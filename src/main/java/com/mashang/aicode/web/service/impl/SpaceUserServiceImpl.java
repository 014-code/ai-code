package com.mashang.aicode.web.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mashang.aicode.web.mapper.SpaceUserMapper;
import com.mashang.aicode.web.model.entity.SpaceUser;
import com.mashang.aicode.web.service.SpaceUserService;
import org.springframework.stereotype.Service;

/**
 * 空间成员服务实现类
 * 提供空间成员相关的业务逻辑实现
 */
@Service
public class SpaceUserServiceImpl extends ServiceImpl<SpaceUserMapper, SpaceUser> implements SpaceUserService {
}
