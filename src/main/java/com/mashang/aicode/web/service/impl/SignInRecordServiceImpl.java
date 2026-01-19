package com.mashang.aicode.web.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mashang.aicode.web.exception.BusinessException;
import com.mashang.aicode.web.exception.ErrorCode;
import com.mashang.aicode.web.exception.ThrowUtils;
import com.mashang.aicode.web.mapper.SignInRecordMapper;
import com.mashang.aicode.web.model.entity.SignInRecord;
import com.mashang.aicode.web.model.enums.PointsTypeEnum;
import com.mashang.aicode.web.service.PointsRecordService;
import com.mashang.aicode.web.service.SignInRecordService;
import com.mashang.aicode.web.service.UserPointService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * 签到记录 服务层实现。
 */
@Slf4j
@Service
public class SignInRecordServiceImpl extends ServiceImpl<SignInRecordMapper, SignInRecord> implements SignInRecordService {

    @Resource
    private PointsRecordService pointsRecordService;

    @Resource
    private RedissonClient redissonClient;

    @Resource
    private UserPointService userPointService;

    // 签到积分配置
    private static final int BASE_SIGN_IN_POINTS = 5; // 基础签到积分
    private static final int CONTINUOUS_3_DAYS_BONUS = 3; // 连续3天额外奖励
    private static final int CONTINUOUS_7_DAYS_BONUS = 10; // 连续7天额外奖励
    private static final int CONTINUOUS_30_DAYS_BONUS = 50; // 连续30天额外奖励

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> dailySignIn(Long userId) {
        ThrowUtils.throwIf(userId == null || userId <= 0, ErrorCode.PARAMS_ERROR, "用户ID不能为空");

        // 使用分布式锁防止并发签到
        String lockKey = "sign_in:lock:" + userId;
        RLock lock = redissonClient.getLock(lockKey);

        try {
            // 尝试获取锁，最多等待3秒，锁自动释放时间10秒
            boolean locked = lock.tryLock(3, 10, TimeUnit.SECONDS);
            if (!locked) {
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, "系统繁忙，请稍后重试");
            }

            // 加锁后再次检查今日是否已签到（双重检查）
            if (hasSignedInToday(userId)) {
                throw new BusinessException(ErrorCode.OPERATION_ERROR, "今日已签到，请勿重复签到");
            }

            // 计算连续签到天数
            Integer continuousDays = calculateContinuousDays(userId);

            // 计算本次签到获得的积分
            Integer pointsEarned = calculateSignInPoints(continuousDays);

            // 保存签到记录
            SignInRecord signInRecord = SignInRecord.builder()
                    .userId(userId)
                    .signInDate(new Date())
                    .continuousDays(continuousDays)
                    .pointsEarned(pointsEarned)
                    .build();
            boolean saved = this.save(signInRecord);
            ThrowUtils.throwIf(!saved, ErrorCode.SYSTEM_ERROR, "保存签到记录失败");

            // 发放积分
            boolean pointsAdded = userPointService.addPoints(
                    userId,
                    pointsEarned,
                    PointsTypeEnum.SIGN_IN.getValue(),
                    "每日签到奖励",
                    signInRecord.getId()
            );
            ThrowUtils.throwIf(!pointsAdded, ErrorCode.SYSTEM_ERROR, "发放签到积分失败");

            log.info("用户 {} 签到成功，连续签到 {} 天，获得 {} 积分", userId, continuousDays, pointsEarned);

            // 返回签到结果
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("continuousDays", continuousDays);
            result.put("pointsEarned", pointsEarned);
            result.put("message", "签到成功！");

            // 添加连续签到提示
            if (continuousDays == 3) {
                result.put("bonusMessage", "连续签到3天，额外获得3积分！");
            } else if (continuousDays == 7) {
                result.put("bonusMessage", "连续签到7天，额外获得10积分！");
            } else if (continuousDays == 30) {
                result.put("bonusMessage", "连续签到30天，额外获得50积分！");
            }

            return result;

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("用户 {} 签到时获取锁被中断", userId, e);
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "系统繁忙，请稍后重试");
        } finally {
            // 释放锁（只有当前线程持有锁时才释放）
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }

    @Override
    public boolean hasSignedInToday(Long userId) {
        ThrowUtils.throwIf(userId == null || userId <= 0, ErrorCode.PARAMS_ERROR, "用户ID不能为空");

        QueryWrapper<SignInRecord> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("userId", userId)
                .eq("signInDate", LocalDate.now());

        return this.count(queryWrapper) > 0;
    }

    @Override
    public Integer getContinuousDays(Long userId) {
        ThrowUtils.throwIf(userId == null || userId <= 0, ErrorCode.PARAMS_ERROR, "用户ID不能为空");

        QueryWrapper<SignInRecord> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("userId", userId)
                .orderByDesc("signInDate")
                .last("LIMIT 1");

        SignInRecord latestRecord = this.getOne(queryWrapper);

        if (latestRecord == null) {
            return 0;
        }

        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        Date signInDate = latestRecord.getSignInDate();

        if (signInDate.equals(today) || signInDate.equals(yesterday)) {
            return latestRecord.getContinuousDays();
        }

        return 0;
    }

    @Override
    public Map<String, Object> getSignInStatus(Long userId) {
        ThrowUtils.throwIf(userId == null || userId <= 0, ErrorCode.PARAMS_ERROR, "用户ID不能为空");

        Map<String, Object> status = new HashMap<>();
        status.put("hasSignedInToday", hasSignedInToday(userId));
        status.put("continuousDays", getContinuousDays(userId));
        status.put("signedDates", getSignedDates(userId));

        return status;
    }

    /**
     * 计算连续签到天数
     *
     * @param userId 用户ID
     * @return 连续签到天数
     */
    private Integer calculateContinuousDays(Long userId) {
        QueryWrapper<SignInRecord> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("userId", userId)
                .orderByDesc("signInDate")
                .last("LIMIT 1");

        SignInRecord latestRecord = this.getOne(queryWrapper);

        if (latestRecord == null) {
            return 1;
        }

        LocalDate yesterday = LocalDate.now().minusDays(1);
        Date signInDate = latestRecord.getSignInDate();

        if (signInDate.equals(yesterday)) {
            return latestRecord.getContinuousDays() + 1;
        } else {
            return 1;
        }
    }

    /**
     * 根据连续签到天数计算积分
     *
     * @param continuousDays 连续签到天数
     * @return 本次签到获得的积分
     */
    private Integer calculateSignInPoints(Integer continuousDays) {
        int points = BASE_SIGN_IN_POINTS;

        // 连续签到奖励
        if (continuousDays >= 30) {
            points += CONTINUOUS_30_DAYS_BONUS;
        } else if (continuousDays >= 7) {
            points += CONTINUOUS_7_DAYS_BONUS;
        } else if (continuousDays >= 3) {
            points += CONTINUOUS_3_DAYS_BONUS;
        }

        return points;
    }

    private List<String> getSignedDates(Long userId) {
        LocalDate startDate = LocalDate.now().minusDays(30);

        QueryWrapper<SignInRecord> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("userId", userId)
                .ge("signInDate", startDate)
                .orderByAsc("signInDate");

        return this.list(queryWrapper).stream()
                .map(record -> record.getSignInDate().toString())
                .collect(Collectors.toList());
    }

}
