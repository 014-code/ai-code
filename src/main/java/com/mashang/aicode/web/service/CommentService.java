package com.mashang.aicode.web.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.mashang.aicode.web.model.dto.comment.CommentQueryRequest;
import com.mashang.aicode.web.model.entity.Comment;
import com.mashang.aicode.web.model.vo.CommentVO;

/**
 * 评论 服务层
 *
 * @author makejava
 */
public interface CommentService extends IService<Comment> {

    /**
     * 获取评论视图对象
     *
     * @param comment 评论信息
     * @return 评论视图对象
     */
    CommentVO getCommentVO(Comment comment);

    /**
     * 获取评论视图对象列表
     *
     * @param commentList 评论列表
     * @return 评论视图对象列表
     */
    java.util.List<CommentVO> getCommentVOList(java.util.List<Comment> commentList);

    /**
     * 根据查询条件构造数据查询参数
     *
     * @param commentQueryRequest 查询请求
     * @return 查询包装器
     */
    QueryWrapper getQueryWrapper(CommentQueryRequest commentQueryRequest);

    /**
     * 分页获取所有评论视图列表（包含应用信息和用户信息）
     * 用于论坛式展示
     *
     * @param commentQueryRequest 查询请求
     * @return 分页结果
     */
    Page<CommentVO> listAllCommentVOByPage(CommentQueryRequest commentQueryRequest);

    /**
     * 分页获取指定应用的评论视图列表（包含用户信息）
     *
     * @param commentQueryRequest 查询请求
     * @return 分页结果
     */
    Page<CommentVO> listAppCommentVOByPage(CommentQueryRequest commentQueryRequest);

    Long addForumComment(Comment comment, Long userId);

    Long replyForumComment(Comment comment, Long userId);

    Page<CommentVO> listForumPostCommentVOByPage(CommentQueryRequest commentQueryRequest);

    boolean incrementForumPostCommentCount(Long postId);

    boolean decrementForumPostCommentCount(Long postId);

    boolean incrementLikeCount(Long id);

    boolean decrementLikeCount(Long id);

    boolean incrementReplyCount(Long id);

    boolean decrementReplyCount(Long id);
}
