package com.mashang.aicode.web.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.mashang.aicode.web.model.entity.AiModelConfig;

import java.math.BigDecimal;
import java.util.List;

public interface AiModelConfigService extends IService<AiModelConfig> {

    /**
     * 根据模型key获取配置
     *
     * @param modelKey 模型key
     * @return 模型配置
     */
    AiModelConfig getByModelKey(String modelKey);

    /**
     * 获取所有启用的模型配置（按排序顺序）
     *
     * @return 启用的模型配置列表
     */
    List<AiModelConfig> listEnabledModels();

    /**
     * 根据等级获取模型配置列表
     *
     * @param tier 模型等级
     * @return 模型配置列表
     */
    List<AiModelConfig> listByTier(String tier);

    /**
     * 更新模型状态
     *
     * @param id        模型ID
     * @param isEnabled 是否启用
     * @return 是否更新成功
     */
    boolean updateModelStatus(Long id, Integer isEnabled);

    /**
     * 分页查询模型配置
     *
     * @param queryWrapper 查询条件
     * @param current     当前页
     * @param pageSize    每页大小
     * @return 分页结果
     */
    Page<AiModelConfig> listAiModelConfigByPage(QueryWrapper<AiModelConfig> queryWrapper, Integer current, Integer pageSize);

    /**
     * 计算消耗的积分
     *
     * @param modelKey   模型key
     * @param tokenCount token数量
     * @return 消耗的积分
     */
    Integer calculatePoints(String modelKey, Integer tokenCount);

    /**
     * 更新模型质量系数
     *
     * @param modelKey     模型key
     * @param qualityScore 质量系数（0.5-2.0）
     * @return 是否更新成功
     */
    boolean updateQualityScore(String modelKey, BigDecimal qualityScore);

    /**
     * 更新模型统计信息
     *
     * @param modelKey      模型key
     * @param successRate   成功率
     * @param avgTokenUsage 平均token消耗
     * @param userRating    用户评分
     * @return 是否更新成功
     */
    boolean updateModelStats(String modelKey, BigDecimal successRate,
                             Integer avgTokenUsage, BigDecimal userRating);
}
