package com.mashang.aicode.web.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mashang.aicode.web.mapper.SpaceMapper;
import com.mashang.aicode.web.model.entity.Space;
import com.mashang.aicode.web.service.SpaceService;
import org.springframework.stereotype.Service;

/**
 * 空间服务实现类
 * 提供空间相关的业务逻辑实现
 */
@Service
public class SpaceServiceImpl extends ServiceImpl<SpaceMapper, Space> implements SpaceService {
}
