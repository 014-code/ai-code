package com.mashang.aicode.web.mapper;

import com.mashang.aicode.web.model.entity.ChatHistory;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

/**
 * 对话历史 映射层
 */
@Mapper
public interface ChatHistoryMapper extends BaseMapper<ChatHistory> {
}