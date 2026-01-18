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

import java.util.List;

@Slf4j
@Service
public class AiModelConfigServiceImpl extends ServiceImpl<AiModelConfigMapper, AiModelConfig> implements AiModelConfigService {

    @Override
    public Page<AiModelConfig> listAiModelConfigByPage(QueryWrapper queryWrapper, Integer current, Integer pageSize) {
        Page<AiModelConfig> page = new Page<>(current, pageSize);
        return page(page, queryWrapper);
    }

    @Override
    public List<AiModelConfig> getEnabledModels() {
        QueryWrapper<AiModelConfig> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("is_enabled", 1);
        queryWrapper.eq("is_delete", 0);
        queryWrapper.orderByAsc("sort_order");
        return list(queryWrapper);
    }

    @Override
    public AiModelConfig getModelByKey(String modelKey) {
        QueryWrapper<AiModelConfig> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("model_key", modelKey);
        queryWrapper.eq("is_delete", 0);
        return getOne(queryWrapper);
    }

    @Override
    public boolean updateModelStatus(Long id, Integer isEnabled) {
        AiModelConfig aiModelConfig = new AiModelConfig();
        aiModelConfig.setId(id);
        aiModelConfig.setIsEnabled(isEnabled);
        return updateById(aiModelConfig);
    }
}
