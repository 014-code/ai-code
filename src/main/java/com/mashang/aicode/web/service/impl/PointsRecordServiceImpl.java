package com.mashang.aicode.web.service.impl;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mashang.aicode.web.mapper.PointsRecordMapper;
import com.mashang.aicode.web.model.entity.PointsRecord;
import com.mashang.aicode.web.model.enums.PointsStatusEnum;
import com.mashang.aicode.web.service.PointsRecordService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 积分明细 服务层实现。
 */
@Slf4j
@Service
public class PointsRecordServiceImpl extends ServiceImpl<PointsRecordMapper, PointsRecord> implements PointsRecordService {

    @Override
    public List<PointsRecord> getUserPointsRecords(Long userId, String type) {
        QueryWrapper<PointsRecord> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("userId", userId);

        if (type != null && !type.isEmpty() && !"ALL".equals(type)) {
            queryWrapper.eq("type", type);
        }

        queryWrapper.orderByDesc("createTime");

        return this.list(queryWrapper);
    }

    @Override
    public Map<String, Integer> sumPointsByType(Long userId) {
        QueryWrapper<PointsRecord> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("userId", userId);

        List<PointsRecord> records = this.list(queryWrapper);

        // 按类型分组并求和
        return records.stream()
                .collect(Collectors.groupingBy(
                        PointsRecord::getType,
                        Collectors.summingInt(PointsRecord::getPoints)
                ));
    }

    @Override
    public Map<LocalDate, Integer> getDailyPointsTrend(Long userId, LocalDate startDate, LocalDate endDate) {
        QueryWrapper<PointsRecord> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("userId", userId);
        queryWrapper.ge("createTime", startDate.atStartOfDay());
        queryWrapper.le("createTime", endDate.plusDays(1).atStartOfDay());
        queryWrapper.orderByAsc("createTime");

        List<PointsRecord> records = this.list(queryWrapper);

        // 按日期分组并求和
        Map<LocalDate, Integer> dailyTrend = new LinkedHashMap<>();

        // 初始化所有日期为0
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            dailyTrend.put(current, 0);
            current = current.plusDays(1);
        }

        // 填充实际数据
        for (PointsRecord record : records) {
            LocalDate date = record.getCreateTime();
            dailyTrend.merge(date, record.getPoints(), Integer::sum);
        }

        return dailyTrend;
    }

    @Override
    public Map<String, Object> getUserPointsStatistics(Long userId) {
        QueryWrapper<PointsRecord> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("userId", userId);

        List<PointsRecord> allRecords = this.list(queryWrapper);

        Map<String, Object> statistics = new HashMap<>();

        // 总收入（所有正数积分）
        int totalIncome = allRecords.stream()
                .filter(r -> r.getPoints() > 0)
                .mapToInt(PointsRecord::getPoints)
                .sum();

        // 总支出（所有负数积分）
        int totalExpense = allRecords.stream()
                .filter(r -> r.getPoints() < 0)
                .mapToInt(r -> Math.abs(r.getPoints()))
                .sum();

        // 记录总数
        int totalRecords = allRecords.size();

        // 最近一次积分变动
        PointsRecord latestRecord = allRecords.stream()
                .max(Comparator.comparing(PointsRecord::getCreateTime))
                .orElse(null);

        // 按类型统计
        Map<String, Integer> byType = allRecords.stream()
                .collect(Collectors.groupingBy(
                        PointsRecord::getType,
                        Collectors.summingInt(PointsRecord::getPoints)
                ));

        // 即将过期的积分（7天内）
        LocalDateTime sevenDaysLater = LocalDateTime.now().plusDays(7);
        int expiringPoints = allRecords.stream()
                .filter(r -> r.getExpireTime() != null)
                .filter(r -> r.getExpireTime().isBefore(sevenDaysLater))
                .filter(r -> r.getExpireTime().isAfter(LocalDateTime.now()))
                .filter(r -> PointsStatusEnum.ACTIVE.getValue().equals(r.getStatus())
                        || PointsStatusEnum.PARTIAL_CONSUMED.getValue().equals(r.getStatus()))
                .mapToInt(r -> r.getRemainingPoints() != null ? r.getRemainingPoints() : 0)
                .sum();

        statistics.put("totalIncome", totalIncome);
        statistics.put("totalExpense", totalExpense);
        statistics.put("totalRecords", totalRecords);
        statistics.put("latestRecord", latestRecord);
        statistics.put("byType", byType);
        statistics.put("expiringPoints", expiringPoints);

        return statistics;
    }

    @Override
    public List<PointsRecord> getExpiringPoints(Long userId, Integer days) {
        LocalDateTime deadline = LocalDateTime.now().plusDays(days);

        QueryWrapper<PointsRecord> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("userId", userId);
        queryWrapper.isNotNull("expireTime");
        queryWrapper.ge("expireTime", LocalDateTime.now());
        queryWrapper.le("expireTime", deadline);
        queryWrapper.in("status", Arrays.asList(
                PointsStatusEnum.ACTIVE.getValue(),
                PointsStatusEnum.PARTIAL_CONSUMED.getValue()
        ));
        queryWrapper.orderByAsc("expireTime");

        return this.list(queryWrapper);
    }

}
