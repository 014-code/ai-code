package com.mashang.aicode.web.mapper;

import com.mashang.aicode.web.model.entity.App;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

/**
 * 应用 映射层。
 */
@Mapper
public interface AppMapper extends BaseMapper<App> {
}