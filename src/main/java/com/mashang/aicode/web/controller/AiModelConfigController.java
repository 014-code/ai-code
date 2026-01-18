package com.mashang.aicode.web.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mashang.aicode.web.annotation.AuthCheck;
import com.mashang.aicode.web.common.BaseResponse;
import com.mashang.aicode.web.common.ResultUtils;
import com.mashang.aicode.web.constant.UserConstant;
import com.mashang.aicode.web.exception.ErrorCode;
import com.mashang.aicode.web.exception.ThrowUtils;
import com.mashang.aicode.web.model.entity.AiModelConfig;
import com.mashang.aicode.web.service.AiModelConfigService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/aiModel")
public class AiModelConfigController {

    @Resource
    private AiModelConfigService aiModelConfigService;

    @PostMapping("/add")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Long> addAiModelConfig(@RequestBody AiModelConfig aiModelConfig) {
        ThrowUtils.throwIf(aiModelConfig == null, ErrorCode.PARAMS_ERROR);
        boolean result = aiModelConfigService.save(aiModelConfig);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return ResultUtils.success(aiModelConfig.getId());
    }

    @PostMapping("/update")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> updateAiModelConfig(@RequestBody AiModelConfig aiModelConfig) {
        ThrowUtils.throwIf(aiModelConfig == null || aiModelConfig.getId() == null, ErrorCode.PARAMS_ERROR);
        boolean result = aiModelConfigService.updateById(aiModelConfig);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return ResultUtils.success(true);
    }

    @PostMapping("/updateStatus")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> updateModelStatus(@RequestBody AiModelConfig aiModelConfig) {
        ThrowUtils.throwIf(aiModelConfig == null || aiModelConfig.getId() == null, ErrorCode.PARAMS_ERROR);
        boolean result = aiModelConfigService.updateModelStatus(aiModelConfig.getId(), aiModelConfig.getIsEnabled());
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return ResultUtils.success(true);
    }

    @PostMapping("/delete")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> deleteAiModelConfig(@RequestBody AiModelConfig aiModelConfig) {
        ThrowUtils.throwIf(aiModelConfig == null || aiModelConfig.getId() == null, ErrorCode.PARAMS_ERROR);
        boolean result = aiModelConfigService.removeById(aiModelConfig.getId());
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return ResultUtils.success(true);
    }

    @GetMapping("/get/{id}")
    public BaseResponse<AiModelConfig> getAiModelConfig(@PathVariable Long id) {
        ThrowUtils.throwIf(id == null, ErrorCode.PARAMS_ERROR);
        AiModelConfig aiModelConfig = aiModelConfigService.getById(id);
        ThrowUtils.throwIf(aiModelConfig == null, ErrorCode.NOT_FOUND_ERROR);
        return ResultUtils.success(aiModelConfig);
    }

    @GetMapping("/list")
    public BaseResponse<Page<AiModelConfig>> listAiModelConfig(
            @RequestParam(required = false) String provider,
            @RequestParam(required = false) String tier,
            @RequestParam(required = false) Integer current,
            @RequestParam(required = false) Integer pageSize) {
        QueryWrapper<AiModelConfig> queryWrapper = new QueryWrapper<>();
        if (provider != null) {
            queryWrapper.eq("provider", provider);
        }
        if (tier != null) {
            queryWrapper.eq("tier", tier);
        }
        queryWrapper.eq("is_delete", 0);
        queryWrapper.orderByAsc("sort_order");

        if (current == null || current < 1) {
            current = 1;
        }
        if (pageSize == null || pageSize < 1) {
            pageSize = 10;
        }

        Page<AiModelConfig> page = aiModelConfigService.listAiModelConfigByPage(queryWrapper, current, pageSize);
        return ResultUtils.success(page);
    }

    @GetMapping("/enabled")
    public BaseResponse<List<AiModelConfig>> getEnabledModels() {
        List<AiModelConfig> models = aiModelConfigService.getEnabledModels();
        return ResultUtils.success(models);
    }
}
