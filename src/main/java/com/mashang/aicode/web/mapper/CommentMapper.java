package com.mashang.aicode.web.mapper;

import com.mashang.aicode.web.model.entity.Comment;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

/**
 * 评论 映射层
 *
 * @author makejava
 */
@Mapper
public interface CommentMapper extends BaseMapper<Comment> {
}
