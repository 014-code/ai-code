package com.mashang.aicode.web.schedule;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.mashang.aicode.web.constant.PointsConstants;
import com.mashang.aicode.web.model.entity.PointsRecord;
import com.mashang.aicode.web.model.entity.UserPoint;
import com.mashang.aicode.web.model.enums.PointsStatusEnum;
import com.mashang.aicode.web.model.enums.PointsTypeEnum;
import com.mashang.aicode.web.service.PointsRecordService;
import com.mashang.aicode.web.service.PointsRecordService;
import com.mashang.aicode.web.service.UserPointService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 积分过期定时任务
 * 每天凌晨1点执行，扫描并处理过期积分
 */
@Slf4j
@Component
public class PointExpireScheduler {

    @Resource
    private PointsRecordService pointsRecordService;

    @Resource
    private UserPointService userPointService;

    /**
     * 每天凌晨3点执行积分过期检查（FIFO策略）
     * cron表达式：秒 分 时 日 月 周
     */
    @Scheduled(cron = "0 0 3 * * ?")
    public void expirePoint() {
        log.info("开始执行积分过期检查任务（FIFO策略）");
        long startTime = System.currentTimeMillis();

        try {
            // 提前发送到期提醒
            sendExpireReminders();

            // 查询所有已过期但未处理的积分记录（按过期时间和创建时间排序，确保FIFO）
            QueryWrapper<PointsRecord> queryWrapper = new QueryWrapper<>();
            queryWrapper.le("expireTime", LocalDateTime.now())
                    .isNotNull("expireTime")
                    .gt("point", 0) // 只处理增加积分的记录
                    .in("status", Arrays.asList(
                            PointsStatusEnum.ACTIVE.getValue(),
                            PointsStatusEnum.PARTIAL_CONSUMED.getValue(),
                            null  // 兼容旧数据
                    ))
                    .orderByAsc("expireTime")  // 过期时间升序（先过期的先处理）
                    .orderByAsc("createTime"); // 创建时间升序

            List<PointsRecord> expiredRecords = pointsRecordService.list(queryWrapper);

            if (expiredRecords.isEmpty()) {
                log.info("没有需要处理的过期积分");
                return;
            }

            log.info("发现 {} 条过期积分记录待处理", expiredRecords.size());

            // 按用户分组，保持FIFO顺序
            Map<Long, List<PointsRecord>> userRecordsMap = expiredRecords.stream()
                    .collect(Collectors.groupingBy(
                            PointsRecord::getUserId,
                            LinkedHashMap::new,  // 保持插入顺序
                            Collectors.toList()
                    ));

            // 逐用户逐笔处理过期积分
            int processedUsers = 0;
            int processedRecords = 0;
            int totalExpiredPoint = 0;

            for (Map.Entry<Long, List<PointsRecord>> entry : userRecordsMap.entrySet()) {
                Long userId = entry.getKey();
                List<PointsRecord> records = entry.getValue();

                try {
                    int userExpiredPoint = processUserExpiredPointFIFO(userId, records);
                    if (userExpiredPoint > 0) {
                        processedUsers++;
                        processedRecords += records.size();
                        totalExpiredPoint += userExpiredPoint;
                    }
                } catch (Exception e) {
                    log.error("处理用户 {} 的过期积分失败", userId, e);
                }
            }

            long endTime = System.currentTimeMillis();
            log.info("积分过期检查任务完成，处理了 {} 个用户，{} 条记录，共 {} 积分过期，耗时 {} ms",
                    processedUsers, processedRecords, totalExpiredPoint, (endTime - startTime));

        } catch (Exception e) {
            log.error("积分过期检查任务执行失败", e);
        }
    }

    /**
     * 按FIFO策略处理单个用户的过期积分
     *
     * @param userId         用户ID
     * @param expiredRecords 该用户的过期积分记录（已按过期时间排序）
     * @return 实际过期的积分总数
     */
    @Transactional(rollbackFor = Exception.class)
    protected int processUserExpiredPointFIFO(Long userId, List<PointsRecord> expiredRecords) {
        // 获取用户当前可用积分
        UserPoint userPoint = userPointService.getOrCreateUserPoint(userId);
        int availablePoint = userPoint.getAvailablePoints();

        log.info("用户 {} 当前可用积分：{}，待过期记录数：{}", userId, availablePoint, expiredRecords.size());

        int totalExpired = 0;
        int expiredCount = 0;

        // 逐笔处理过期（FIFO顺序）
        for (PointsRecord record : expiredRecords) {
            if (availablePoint <= 0) {
                log.warn("用户 {} 可用积分已耗尽，剩余 {} 笔记录无法过期",
                        userId, expiredRecords.size() - expiredCount);
                break;
            }

            // 计算该记录的剩余积分
            Integer remainingPoint = record.getRemainingPoints();
            if (remainingPoint == null || remainingPoint <= 0) {
                // 兼容旧数据：如果没有remainingPoints字段，使用原始points
                remainingPoint = record.getPoints();
            }

            // 计算实际可过期金额（不超过剩余可用积分）
            int expireAmount = Math.min(remainingPoint, availablePoint);

            // 扣减可用积分
            availablePoint -= expireAmount;
            totalExpired += expireAmount;
            expiredCount++;

            // 更新记录状态
            if (expireAmount >= remainingPoint) {
                // 全部过期
                record.setStatus(PointsStatusEnum.EXPIRED.getValue());
                record.setRemainingPoints(0);
            } else {
                // 部分过期
                record.setStatus(PointsStatusEnum.PARTIAL_CONSUMED.getValue());
                record.setRemainingPoints(remainingPoint - expireAmount);
            }
            pointsRecordService.updateById(record);

            log.debug("过期记录 ID:{}, 原始金额:{}, 剩余:{}, 本次过期:{}, 状态:{}",
                    record.getId(), record.getPoints(), remainingPoint, expireAmount, record.getStatus());
        }

        // 更新用户积分账户
        if (totalExpired > 0) {
            userPoint.setAvailablePoints(userPoint.getAvailablePoints() - totalExpired);
            userPointService.updateById(userPoint);

            // 创建过期扣减流水记录
            PointsRecord expireRecord = PointsRecord.builder()
                    .userId(userId)
                    .points(-totalExpired)
                    .balance(userPoint.getAvailablePoints())
                    .type(PointsTypeEnum.EXPIRE.getValue())
                    .status(PointsStatusEnum.CONSUMED.getValue())
                    .reason(String.format("积分过期（%d笔，FIFO策略）", expiredCount))
                    .build();
            pointsRecordService.save(expireRecord);

            log.info("用户 {} 完成积分过期：扣减 {} 积分，处理 {} 笔记录，剩余可用 {} 积分",
                    userId, totalExpired, expiredCount, userPoint.getAvailablePoints());
        }

        return totalExpired;
    }

    private void sendExpireReminders() {
        try {
            LocalDate targetDate = LocalDate.now().plusDays(PointsConstants.POINTS_EXPIRE_REMIND_DAYS);
            LocalDateTime dayStart = targetDate.atStartOfDay();
            LocalDateTime dayEnd = dayStart.plusDays(1);

            QueryWrapper<PointsRecord> queryWrapper = new QueryWrapper<>();
            queryWrapper.ge("expireTime", dayStart)
                    .lt("expireTime", dayEnd)
                    .gt("point", 0)
                    .ne("type", PointsTypeEnum.EXPIRE.getValue());

            List<PointsRecord> expiringRecords = pointsRecordService.list(queryWrapper);
            if (expiringRecords.isEmpty()) {
                return;
            }

            Set<Long> expiringRecordIds = expiringRecords.stream()
                    .map(PointsRecord::getId)
                    .collect(Collectors.toSet());

            if (expiringRecordIds.isEmpty()) {
                return;
            }

            QueryWrapper<PointsRecord> reminderQuery = new QueryWrapper<>();
            reminderQuery.eq("type", PointsTypeEnum.EXPIRE_REMINDER.getValue())
                    .in("relatedId", expiringRecordIds);

            Set<Long> remindedRecordIds = pointsRecordService.list(reminderQuery).stream()
                    .map(PointsRecord::getRelatedId)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

            for (PointsRecord record : expiringRecords) {
                if (remindedRecordIds.contains(record.getId())) {
                    continue;
                }

                UserPoint userPoint = userPointService.getOrCreateUserPoint(record.getUserId());
                PointsRecord reminder = PointsRecord.builder()
                        .userId(record.getUserId())
                        .points(0)
                        .balance(userPoint.getAvailablePoints())
                        .type(PointsTypeEnum.EXPIRE_REMINDER.getValue())
                        .reason(String.format("积分将于%s过期，请及时使用", record.getExpireTime().toLocalDate()))
                        .relatedId(record.getId())
                        .expireTime(record.getExpireTime())
                        .build();
                pointsRecordService.save(reminder);
            }
        } catch (Exception e) {
            log.error("积分到期提醒发送失败", e);
        }
    }
}
