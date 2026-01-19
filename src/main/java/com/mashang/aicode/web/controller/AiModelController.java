package com.mashang.aicode.web.controller;

import com.mashang.aicode.web.common.BaseResponse;
import com.mashang.aicode.web.common.ResultUtils;
import com.mashang.aicode.web.model.entity.AiModelConfig;
import com.mashang.aicode.web.service.AiModelConfigService;
import com.mashang.aicode.web.utils.IpUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * AI模型配置 控制层。
 */
@Slf4j
@RestController
@RequestMapping("/ai-model")
@Tag(name = "AI模型配置", description = "AI模型选择和查询接口")
public class AiModelController {

    @Resource
    private AiModelConfigService aiModelConfigService;

    /**
     * 获取所有启用的AI模型列表
     *
     * @return 启用的模型列表
     */
    @GetMapping("/list")
    @Operation(summary = "获取所有启用的AI模型列表", description = "返回按等级和排序顺序排列的所有可用模型")
    public BaseResponse<List<AiModelConfig>> listEnabledModels() {
        log.info("查询所有启用的AI模型");
        List<AiModelConfig> models = aiModelConfigService.listEnabledModels();
        return ResultUtils.success(models);
    }

    /**
     * 根据等级获取AI模型列表
     *
     * @param tier 模型等级 (SIMPLE, MEDIUM, HARD, EXPERT)
     * @return 指定等级的模型列表
     */
    @GetMapping("/list/tier/{tier}")
    @Operation(summary = "根据等级获取AI模型", description = "获取指定等级的所有可用模型")
    public BaseResponse<List<AiModelConfig>> listModelsByTier(@PathVariable String tier) {
        log.info("查询等级为 {} 的AI模型", tier);
        List<AiModelConfig> models = aiModelConfigService.listByTier(tier);
        return ResultUtils.success(models);
    }

    /**
     * 根据模型key获取配置信息
     *
     * @param modelKey 模型key
     * @return 模型配置
     */
    @GetMapping("/get/{modelKey}")
    @Operation(summary = "根据模型key获取配置", description = "获取指定模型的详细配置信息")
    public BaseResponse<AiModelConfig> getModelByKey(@PathVariable String modelKey) {
        log.info("查询模型配置: {}", modelKey);
        AiModelConfig model = aiModelConfigService.getByModelKey(modelKey);
        return ResultUtils.success(model);
    }

}
