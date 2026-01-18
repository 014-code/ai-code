package com.mashang.aicode.web.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.mashang.aicode.web.model.entity.AiModelConfig;

import java.util.List;

public interface AiModelConfigService extends IService<AiModelConfig> {

    Page<AiModelConfig> listAiModelConfigByPage(QueryWrapper queryWrapper, Integer current, Integer pageSize);

    List<AiModelConfig> getEnabledModels();

    AiModelConfig getModelByKey(String modelKey);

    boolean updateModelStatus(Long id, Integer isEnabled);
}
