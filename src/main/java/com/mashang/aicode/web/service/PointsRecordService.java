package com.mashang.aicode.web.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.mashang.aicode.web.model.entity.PointsRecord;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 积分明细 服务层。
 */
public interface PointsRecordService extends IService<PointsRecord> {

    /**
     * 查询用户的积分记录
     *
     * @param userId 用户ID
     * @param type   积分类型（可选）
     * @return 积分记录列表
     */
    List<PointsRecord> getUserPointsRecords(Long userId, String type);

    /**
     * 按类型汇总用户积分
     *
     * @param userId 用户ID
     * @return Map<类型, 积分总和>
     */
    Map<String, Integer> sumPointsByType(Long userId);

    /**
     * 获取用户每日积分变化趋势
     *
     * @param userId    用户ID
     * @param startDate 开始日期
     * @param endDate   结束日期
     * @return Map<日期, 积分变化>
     */
    Map<LocalDate, Integer> getDailyPointsTrend(Long userId, LocalDate startDate, LocalDate endDate);

    /**
     * 获取用户积分统计信息
     *
     * @param userId 用户ID
     * @return 统计信息
     */
    Map<String, Object> getUserPointsStatistics(Long userId);

    /**
     * 获取即将过期的积分记录
     *
     * @param userId 用户ID
     * @param days   多少天内过期
     * @return 即将过期的积分记录
     */
    List<PointsRecord> getExpiringPoints(Long userId, Integer days);

}
