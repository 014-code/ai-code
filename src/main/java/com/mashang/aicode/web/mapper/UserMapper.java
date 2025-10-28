package com.mashang.aicode.web.mapper;

import com.mashang.aicode.web.model.entity.User;
import com.mybatisflex.core.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

/**
 * 用户 映射层。
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {

}
