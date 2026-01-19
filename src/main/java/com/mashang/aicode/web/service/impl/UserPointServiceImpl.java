package com.mashang.aicode.web.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mashang.aicode.web.constant.PointsConstants;
import com.mashang.aicode.web.exception.BusinessException;
import com.mashang.aicode.web.exception.ErrorCode;
import com.mashang.aicode.web.exception.ThrowUtils;
import com.mashang.aicode.web.mapper.UserMapper;
import com.mashang.aicode.web.mapper.UserPointMapper;
import com.mashang.aicode.web.model.entity.PointsRecord;
import com.mashang.aicode.web.model.entity.User;
import com.mashang.aicode.web.model.entity.UserPoint;
import com.mashang.aicode.web.model.enums.PointsStatusEnum;
import com.mashang.aicode.web.model.enums.UserRoleEnum;
import com.mashang.aicode.web.monitor.PointsMetricsCollector;
import com.mashang.aicode.web.service.PointsRecordService;
import com.mashang.aicode.web.service.UserPointService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class UserPointServiceImpl extends ServiceImpl<UserPointMapper, UserPoint> implements UserPointService {

    @Resource
    private UserPointMapper userPointMapper;
    @Autowired
    private PointsRecordService pointsRecordService;

    @Override
    public UserPoint getUserPointByUserId(Long userId) {
        QueryWrapper<UserPoint> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("userId", userId);
        queryWrapper.eq("isDelete", 0);
        return userPointMapper.selectOne(queryWrapper);
    }

    @Resource
    private RedissonClient redissonClient;

    @Resource
    private PointsMetricsCollector pointsMetricsCollector;

    @Resource
    private UserMapper userMapper;

    private static final String POINTS_LOCK_PREFIX = "points:lock:";

    @Override
    public UserPoint getOrCreateUserPoint(Long userId) {
        ThrowUtils.throwIf(userId == null || userId <= 0, ErrorCode.PARAMS_ERROR, "用户ID不能为空");

        // 先查询是否存在
        QueryWrapper<UserPoint> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("userId", userId);
        UserPoint userPoints = this.getOne(queryWrapper);

        // 如果不存在则创建
        if (userPoints == null) {
            userPoints = UserPoint.builder()
                    .userId(userId)
                    .totalPoints(0)
                    .availablePoints(0)
                    .frozenPoints(0)
                    .build();
            boolean saved = this.save(userPoints);
            ThrowUtils.throwIf(!saved, ErrorCode.SYSTEM_ERROR, "创建用户积分记录失败");
            log.info("为用户 {} 创建了积分账户", userId);
        }

        return userPoints;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean addPoints(Long userId, Integer points, String type, String reason, Long relatedId) {
        ThrowUtils.throwIf(userId == null || userId <= 0, ErrorCode.PARAMS_ERROR, "用户ID不能为空");
        ThrowUtils.throwIf(points == null || points <= 0, ErrorCode.PARAMS_ERROR, "积分数量必须大于0");
        ThrowUtils.throwIf(type == null || type.trim().isEmpty(), ErrorCode.PARAMS_ERROR, "积分类型不能为空");

        if (isAdmin(userId)) {
            log.info("管理员 {} 发放 {} 积分（无限额度，仍记录流水）", userId, points);

            // 管理员也记录流水（审计需要）
            PointsRecord record = PointsRecord.builder()
                    .userId(userId)
                    .points(points)
                    .balance(999999) // 管理员显示无限积分
                    .type(type)
                    .status(PointsStatusEnum.ACTIVE.getValue())
                    .remainingPoints(points)
                    .reason(reason + "（管理员免扣）")
                    .relatedId(relatedId)
                    .expireTime(LocalDateTime.now().plusDays(PointsConstants.POINTS_VALIDITY_DAYS))
                    .build();
            pointsRecordService.save(record);

            // 记录监控指标
            pointsMetricsCollector.recordPointsGranted(userId.toString(), type, points);

            return true;
        }

        String lockKey = POINTS_LOCK_PREFIX + userId;
        RLock lock = redissonClient.getLock(lockKey);

        try {
            // 尝试获取锁，最多等待3秒，锁自动释放时间为配置的超时时间
            boolean locked = lock.tryLock(3, PointsConstants.POINTS_LOCK_TIMEOUT_SECONDS, TimeUnit.SECONDS);
            if (!locked) {
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, "系统繁忙，请稍后重试");
            }

            // 获取或创建用户积分记录
            UserPoint userPoints = getOrCreateUserPoint(userId);

            // 更新积分
            userPoints.setTotalPoints(userPoints.getTotalPoints() + points);
            userPoints.setAvailablePoints(userPoints.getAvailablePoints() + points);
            boolean updated = this.updateById(userPoints);
            ThrowUtils.throwIf(!updated, ErrorCode.SYSTEM_ERROR, "更新用户积分失败");

            // 记录积分变动明细（增加积分时设置过期时间和状态）
            LocalDateTime expireTime = LocalDateTime.now().plusDays(PointsConstants.POINTS_VALIDITY_DAYS);
            PointsRecord record = PointsRecord.builder()
                    .userId(userId)
                    .points(points)
                    .balance(userPoints.getAvailablePoints())
                    .type(type)
                    .status(PointsStatusEnum.ACTIVE.getValue())  // 新增积分状态为ACTIVE
                    .remainingPoints(points)  // 初始剩余积分等于总积分
                    .reason(reason)
                    .relatedId(relatedId)
                    .expireTime(expireTime)
                    .build();
            boolean recordSaved = pointsRecordService.save(record);
            ThrowUtils.throwIf(!recordSaved, ErrorCode.SYSTEM_ERROR, "保存积分明细失败");

            // 记录监控指标
            pointsMetricsCollector.recordPointsGranted(userId.toString(), type, points);

            log.info("用户 {} 增加了 {} 积分，类型：{}，原因：{}，剩余：{}",
                    userId, points, type, reason, userPoints.getAvailablePoints());
            return true;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("用户 {} 增加积分时获取锁被中断", userId, e);
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "系统繁忙，请稍后重试");
        } finally {
            // 释放锁（只有当前线程持有锁时才释放）
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deductPoints(Long userId, Integer points, String type, String reason, Long relatedId) {
        ThrowUtils.throwIf(userId == null || userId <= 0, ErrorCode.PARAMS_ERROR, "用户ID不能为空");
        ThrowUtils.throwIf(points == null || points <= 0, ErrorCode.PARAMS_ERROR, "积分数量必须大于0");
        ThrowUtils.throwIf(type == null || type.trim().isEmpty(), ErrorCode.PARAMS_ERROR, "积分类型不能为空");

        if (isAdmin(userId)) {
            log.info("管理员 {} 扣减 {} 积分（无限额度，仍记录流水）", userId, points);

            // 管理员也记录流水（审计需要）
            PointsRecord record = PointsRecord.builder()
                    .userId(userId)
                    .points(-points)
                    .balance(999999) // 管理员显示无限积分
                    .type(type)
                    .status(PointsStatusEnum.CONSUMED.getValue())
                    .reason(reason + "（管理员免扣）")
                    .relatedId(relatedId)
                    .build();
            pointsRecordService.save(record);

            // 记录监控指标
            pointsMetricsCollector.recordPointsConsumed(userId.toString(), points);

            return true;
        }

        String lockKey = POINTS_LOCK_PREFIX + userId;
        RLock lock = redissonClient.getLock(lockKey);

        try {
            // 尝试获取锁，最多等待3秒，锁自动释放时间为配置的超时时间
            boolean locked = lock.tryLock(3, PointsConstants.POINTS_LOCK_TIMEOUT_SECONDS, TimeUnit.SECONDS);
            if (!locked) {
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, "系统繁忙，请稍后重试");
            }

            // 获取用户积分记录
            UserPoint userPoints = getOrCreateUserPoint(userId);

            // 检查积分是否充足
            if (userPoints.getAvailablePoints() < points) {
                log.warn("用户 {} 积分不足，当前：{}，需要：{}", userId, userPoints.getAvailablePoints(), points);
                throw new BusinessException(ErrorCode.PARAMS_ERROR, "积分不足");
            }

            // 更新用户账户可用积分（先更新账户）
            userPoints.setAvailablePoints(userPoints.getAvailablePoints() - points);
            boolean updated = this.updateById(userPoints);
            ThrowUtils.throwIf(!updated, ErrorCode.SYSTEM_ERROR, "更新用户积分失败");

            // 使用FIFO策略扣减积分（传入更新后的余额）
            deductPointsFIFO(userId, points, type, reason, relatedId, null, null, userPoints.getAvailablePoints());

            // 记录监控指标
            pointsMetricsCollector.recordPointsConsumed(userId.toString(), points);

            log.info("用户 {} 扣减了 {} 积分，类型：{}，原因：{}，剩余：{}",
                    userId, points, type, reason, userPoints.getAvailablePoints());
            return true;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("用户 {} 扣减积分时获取锁被中断", userId, e);
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "系统繁忙，请稍后重试");
        } finally {
            // 释放锁（只有当前线程持有锁时才释放）
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deductPointsWithModel(Long userId, Integer points, String type, String reason,
                                         Long relatedId, String modelKey, Integer tokenCount) {
        ThrowUtils.throwIf(userId == null || userId <= 0, ErrorCode.PARAMS_ERROR, "用户ID不能为空");
        ThrowUtils.throwIf(points == null || points <= 0, ErrorCode.PARAMS_ERROR, "积分数量必须大于0");
        ThrowUtils.throwIf(type == null || type.trim().isEmpty(), ErrorCode.PARAMS_ERROR, "积分类型不能为空");
        ThrowUtils.throwIf(modelKey == null || modelKey.trim().isEmpty(), ErrorCode.PARAMS_ERROR, "模型key不能为空");
        ThrowUtils.throwIf(tokenCount == null || tokenCount <= 0, ErrorCode.PARAMS_ERROR, "token数量必须大于0");

        if (isAdmin(userId)) {
            log.info("管理员 {} 扣减 {} 积分（无限额度，仍记录流水），模型：{}，token：{}",
                    userId, points, modelKey, tokenCount);

            // 管理员也记录流水（审计需要，包含模型信息）
            PointsRecord record = PointsRecord.builder()
                    .userId(userId)
                    .points(-points)
                    .balance(999999) // 管理员显示无限积分
                    .type(type)
                    .status(PointsStatusEnum.CONSUMED.getValue())
                    .reason(reason + "（管理员免扣）")
                    .relatedId(relatedId)
                    .modelKey(modelKey)
                    .tokenCount(tokenCount)
                    .build();
            pointsRecordService.save(record);

            // 记录监控指标
            pointsMetricsCollector.recordPointsConsumed(userId.toString(), points);

            return true;
        }

        String lockKey = POINTS_LOCK_PREFIX + userId;
        RLock lock = redissonClient.getLock(lockKey);

        try {
            // 尝试获取锁，最多等待3秒，锁自动释放时间为配置的超时时间
            boolean locked = lock.tryLock(3, PointsConstants.POINTS_LOCK_TIMEOUT_SECONDS, TimeUnit.SECONDS);
            if (!locked) {
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, "系统繁忙，请稍后重试");
            }

            // 获取用户积分记录
            UserPoint userPoints = getOrCreateUserPoint(userId);

            // 检查积分是否充足
            if (userPoints.getAvailablePoints() < points) {
                log.warn("用户 {} 积分不足，当前：{}，需要：{}", userId, userPoints.getAvailablePoints(), points);
                throw new BusinessException(ErrorCode.PARAMS_ERROR, "积分不足");
            }

            // 更新用户账户可用积分（先更新账户）
            userPoints.setAvailablePoints(userPoints.getAvailablePoints() - points);
            boolean updated = this.updateById(userPoints);
            ThrowUtils.throwIf(!updated, ErrorCode.SYSTEM_ERROR, "更新用户积分失败");

            // 使用FIFO策略扣减积分（包含模型和token信息，传入更新后的余额）
            deductPointsFIFO(userId, points, type, reason, relatedId, modelKey, tokenCount, userPoints.getAvailablePoints());

            // 记录监控指标
            pointsMetricsCollector.recordPointsConsumed(userId.toString(), points);

            log.info("用户 {} 扣减了 {} 积分，类型：{}，原因：{}，模型：{}，token：{}，剩余：{}",
                    userId, points, type, reason, modelKey, tokenCount, userPoints.getAvailablePoints());
            return true;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("用户 {} 扣减积分时获取锁被中断", userId, e);
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "系统繁忙，请稍后重试");
        } finally {
            // 释放锁（只有当前线程持有锁时才释放）
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }

    @Override
    public Integer getAvailablePoints(Long userId) {
        ThrowUtils.throwIf(userId == null || userId <= 0, ErrorCode.PARAMS_ERROR, "用户ID不能为空");

        UserPoint userPoints = getOrCreateUserPoint(userId);
        return userPoints.getAvailablePoints();
    }

    @Override
    public boolean checkPointsSufficient(Long userId, Integer points) {
        ThrowUtils.throwIf(userId == null || userId <= 0, ErrorCode.PARAMS_ERROR, "用户ID不能为空");
        ThrowUtils.throwIf(points == null || points < 0, ErrorCode.PARAMS_ERROR, "积分数量不能为负数");

        if (isAdmin(userId)) {
            return true;
        }

        Integer availablePoints = getAvailablePoints(userId);
        return availablePoints >= points;
    }

    private boolean isAdmin(Long userId) {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("id", userId);
        queryWrapper.last("LIMIT 1");
        User user = userMapper.selectOne(queryWrapper);
        return user != null && UserRoleEnum.ADMIN.getValue().equals(user.getUserRole());
    }

    /**
     * FIFO策略扣减积分（统一版本）
     * 按照过期时间优先扣减即将过期的积分
     *
     * @param userId         用户ID
     * @param pointsToDeduct 需要扣减的积分
     * @param type           积分类型
     * @param reason         扣减原因
     * @param relatedId      关联ID
     * @param modelKey       模型key（可选）
     * @param tokenCount     token数量（可选）
     * @param currentBalance 当前余额（已更新后的）
     */
    private void deductPointsFIFO(Long userId, Integer pointsToDeduct, String type, String reason, Long relatedId,
                                  String modelKey, Integer tokenCount, Integer currentBalance) {
        // 查询用户所有未过期且有剩余的积分记录（按过期时间升序）
        LocalDateTime now = LocalDateTime.now();
        QueryWrapper<PointsRecord> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("userId", userId);
        queryWrapper.gt("points", 0);
        queryWrapper.in("status", Arrays.asList(
                PointsStatusEnum.ACTIVE.getValue(),
                PointsStatusEnum.PARTIAL_CONSUMED.getValue(),
                null
        ));
        queryWrapper.and(qw -> qw.isNull("expireTime").or(qw2 -> qw2.gt("expireTime", now)));
        queryWrapper.orderByAsc("expireTime");
        queryWrapper.orderByAsc("createTime");

        List<PointsRecord> availableRecords = pointsRecordService.list(queryWrapper);

        if (availableRecords.isEmpty()) {
            log.warn("用户 {} 没有可用的积分记录", userId);
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "积分不足");
        }

        int remaining = pointsToDeduct;
        int consumedRecordCount = 0;

        // 按FIFO顺序逐笔扣减
        for (PointsRecord record : availableRecords) {
            if (remaining <= 0) {
                break;
            }

            // 获取该记录的剩余积分
            Integer remainingPoints = record.getRemainingPoints();
            if (remainingPoints == null || remainingPoints <= 0) {
                // 兼容旧数据
                remainingPoints = record.getPoints();
            }

            // 计算本次扣减金额
            int deductAmount = Math.min(remainingPoints, remaining);

            // 更新记录状态
            if (deductAmount >= remainingPoints) {
                // 全部消费
                record.setStatus(PointsStatusEnum.CONSUMED.getValue());
                record.setRemainingPoints(0);
            } else {
                // 部分消费
                record.setStatus(PointsStatusEnum.PARTIAL_CONSUMED.getValue());
                record.setRemainingPoints(remainingPoints - deductAmount);
            }
            pointsRecordService.updateById(record);

            remaining -= deductAmount;
            consumedRecordCount++;

            log.debug("FIFO扣减：记录ID={}, 原始积分={}, 剩余={}, 本次扣减={}, 新状态={}",
                    record.getId(), record.getPoints(), remainingPoints, deductAmount, record.getStatus());
        }

        // 创建扣减流水记录（使用传入的准确余额）
        PointsRecord.PointsRecordBuilder builder = PointsRecord.builder()
                .userId(userId)
                .points(-pointsToDeduct)
                .balance(currentBalance)  // 使用准确的当前余额
                .type(type)
                .status(PointsStatusEnum.CONSUMED.getValue())
                .reason(reason + String.format("（FIFO策略，消耗%d笔记录）", consumedRecordCount))
                .relatedId(relatedId);

        // 如果有模型信息，添加到记录中
        if (modelKey != null) {
            builder.modelKey(modelKey);
        }
        if (tokenCount != null) {
            builder.tokenCount(tokenCount);
        }

        PointsRecord deductRecord = builder.build();
        pointsRecordService.save(deductRecord);

        if (modelKey != null) {
            log.info("用户 {} FIFO扣减 {} 积分（模型：{}，token：{}），消耗 {} 笔记录",
                    userId, pointsToDeduct, modelKey, tokenCount, consumedRecordCount);
        } else {
            log.info("用户 {} FIFO扣减 {} 积分，消耗 {} 笔记录", userId, pointsToDeduct, consumedRecordCount);
        }
    }
}
