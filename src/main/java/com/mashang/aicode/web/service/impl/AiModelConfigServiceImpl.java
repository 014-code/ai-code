package com.mashang.aicode.web.service.impl;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mashang.aicode.web.mapper.AiModelConfigMapper;
import com.mashang.aicode.web.model.entity.AiModelConfig;
import com.mashang.aicode.web.service.AiModelConfigService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Slf4j
@Service
public class AiModelConfigServiceImpl extends ServiceImpl<AiModelConfigMapper, AiModelConfig> implements AiModelConfigService {

    @Override
    public AiModelConfig getByModelKey(String modelKey) {
        QueryWrapper<AiModelConfig> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("modelKey", modelKey);
        queryWrapper.eq("isEnabled", 1);
        return this.getOne(queryWrapper);
    }

    @Override
    public List<AiModelConfig> listEnabledModels() {
        QueryWrapper<AiModelConfig> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("isEnabled", 1);
        queryWrapper.orderByAsc("sortOrder");
        queryWrapper.orderByAsc("tier");
        return this.list(queryWrapper);
    }

    @Override
    public List<AiModelConfig> listByTier(String tier) {
        QueryWrapper<AiModelConfig> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("tier", tier);
        queryWrapper.eq("isEnabled", 1);
        queryWrapper.orderByAsc("sortOrder");
        return this.list(queryWrapper);
    }

    @Override
    public boolean updateModelStatus(Long id, Integer isEnabled) {
        AiModelConfig config = this.getById(id);
        if (config == null) {
            return false;
        }
        config.setIsEnabled(isEnabled);
        return this.updateById(config);
    }

    @Override
    public Page<AiModelConfig> listAiModelConfigByPage(QueryWrapper<AiModelConfig> queryWrapper, Integer current, Integer pageSize) {
        Page<AiModelConfig> page = new Page<>(current, pageSize);
        return this.page(page, queryWrapper);
    }

    @Override
    public Integer calculatePoints(String modelKey, Integer tokenCount) {
        AiModelConfig config = getByModelKey(modelKey);
        if (config == null) {
            throw new IllegalArgumentException("模型配置不存在: " + modelKey);
        }

        // 计算基础积分: (token数量 / 1000) * 每1K token的积分
        // 向上取整，确保即使不足1K token也会扣除积分
        int kTokens = (int) Math.ceil(tokenCount / 1000.0);
        int basePoints = kTokens * config.getPointsPerKToken();

        // 应用质量系数（如果存在）
        BigDecimal qualityScore = config.getQualityScore();
        if (qualityScore != null && qualityScore.compareTo(BigDecimal.ONE) != 0) {
            // 质量系数加权计算
            BigDecimal finalPoints = BigDecimal.valueOf(basePoints)
                    .multiply(qualityScore)
                    .setScale(0, RoundingMode.HALF_UP); // 四舍五入到整数

            int result = finalPoints.intValue();

            log.debug("模型 {} Token消耗计算: {}tokens -> {}K tokens, 基础积分: {}×{}={}, 质量系数: {}, 最终积分: {}",
                    modelKey, tokenCount, kTokens, kTokens, config.getPointsPerKToken(),
                    basePoints, qualityScore, result);

            return result;
        }

        // 无质量系数或质量系数为1.0，返回基础积分
        log.debug("模型 {} Token消耗计算: {}tokens -> {}K tokens, 积分: {}×{}={} (无质量系数调整)",
                modelKey, tokenCount, kTokens, kTokens, config.getPointsPerKToken(), basePoints);

        return basePoints;
    }

    @Override
    public boolean updateQualityScore(String modelKey, BigDecimal qualityScore) {
        if (qualityScore == null || qualityScore.compareTo(BigDecimal.valueOf(0.5)) < 0
                || qualityScore.compareTo(BigDecimal.valueOf(2.0)) > 0) {
            log.warn("质量系数超出范围(0.5-2.0): {}", qualityScore);
            return false;
        }

        AiModelConfig config = getByModelKey(modelKey);
        if (config == null) {
            log.warn("模型配置不存在: {}", modelKey);
            return false;
        }

        config.setQualityScore(qualityScore);
        boolean updated = this.updateById(config);

        if (updated) {
            log.info("模型 {} 质量系数已更新: {}", modelKey, qualityScore);
        } else {
            log.error("模型 {} 质量系数更新失败", modelKey);
        }

        return updated;
    }

    @Override
    public boolean updateModelStats(String modelKey, BigDecimal successRate,
                                    Integer avgTokenUsage, BigDecimal userRating) {
        AiModelConfig config = getByModelKey(modelKey);
        if (config == null) {
            log.warn("模型配置不存在: {}", modelKey);
            return false;
        }

        if (successRate != null) {
            config.setSuccessRate(successRate);
        }
        if (avgTokenUsage != null) {
            config.setAvgTokenUsage(avgTokenUsage);
        }
        if (userRating != null) {
            config.setUserRating(userRating);
        }

        boolean updated = this.updateById(config);

        if (updated) {
            log.info("模型 {} 统计信息已更新: 成功率={}, 平均Token={}, 用户评分={}",
                    modelKey, successRate, avgTokenUsage, userRating);
        } else {
            log.error("模型 {} 统计信息更新失败", modelKey);
        }

        return updated;
    }
}
