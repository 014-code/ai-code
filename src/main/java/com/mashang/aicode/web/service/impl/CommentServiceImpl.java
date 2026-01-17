package com.mashang.aicode.web.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.collection.CollUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mashang.aicode.web.exception.BusinessException;
import com.mashang.aicode.web.exception.ErrorCode;
import com.mashang.aicode.web.exception.ThrowUtils;
import com.mashang.aicode.web.mapper.AppMapper;
import com.mashang.aicode.web.mapper.CommentMapper;
import com.mashang.aicode.web.mapper.UserMapper;
import com.mashang.aicode.web.model.dto.comment.CommentQueryRequest;
import com.mashang.aicode.web.model.entity.App;
import com.mashang.aicode.web.model.entity.Comment;
import com.mashang.aicode.web.model.entity.User;
import com.mashang.aicode.web.model.vo.AppVO;
import com.mashang.aicode.web.model.vo.CommentVO;
import com.mashang.aicode.web.model.vo.UserVO;
import com.mashang.aicode.web.service.AppService;
import com.mashang.aicode.web.service.CommentService;
import com.mashang.aicode.web.service.ForumPostService;
import com.mashang.aicode.web.service.UserService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 评论 服务层实现
 *
 * @author makejava
 */
@Service
@Slf4j
public class CommentServiceImpl extends ServiceImpl<CommentMapper, Comment> implements CommentService {

    @Resource
    private UserService userService;

    @Resource
    private AppService appService;

    @Resource
    private ForumPostService forumPostService;

    @Resource
    private UserMapper userMapper;

    @Resource
    private AppMapper appMapper;

    @Override
    public CommentVO getCommentVO(Comment comment) {
        if (comment == null) {
            return null;
        }
        CommentVO commentVO = new CommentVO();
        BeanUtil.copyProperties(comment, commentVO);

        // 设置用户信息
        if (comment.getUserId() != null) {
            User user = userMapper.selectById(comment.getUserId());
            if (user != null) {
                UserVO userVO = userService.getUserVO(user);
                commentVO.setUser(userVO);
            }
        }

        // 设置应用信息
        if (comment.getAppId() != null) {
            App app = appMapper.selectById(comment.getAppId());
            if (app != null) {
                AppVO appVO = appService.getAppVO(app);
                commentVO.setApp(appVO);
            }
        }

        return commentVO;
    }

    @Override
    public List<CommentVO> getCommentVOList(List<Comment> commentList) {
        if (CollUtil.isEmpty(commentList)) {
            return new ArrayList<>();
        }

        // 获取所有用户ID
        List<Long> userIds = commentList.stream().map(Comment::getUserId).distinct().collect(Collectors.toList());

        // 批量查询用户信息
        Map<Long, UserVO> userVOMap = userMapper.selectList(new LambdaQueryWrapper<User>().select(User::getId, User::getUserName, User::getUserAvatar).in(User::getId, userIds)).stream().map(userService::getUserVO).collect(Collectors.toMap(UserVO::getId, userVO -> userVO));

        // 获取所有应用ID
        List<Long> appIds = commentList.stream().map(Comment::getAppId).distinct().collect(Collectors.toList());

        // 批量查询应用信息
        Map<Long, AppVO> appVOMap = appMapper.selectList(new LambdaQueryWrapper<App>().select(App::getId, App::getAppName, App::getCover).in(App::getId, appIds)).stream().map(appService::getAppVO).collect(Collectors.toMap(AppVO::getId, appVO -> appVO));

        // 转换为VO列表
        return commentList.stream().map(comment -> {
            CommentVO commentVO = new CommentVO();
            BeanUtil.copyProperties(comment, commentVO);
            commentVO.setUser(userVOMap.get(comment.getUserId()));
            commentVO.setApp(appVOMap.get(comment.getAppId()));
            return commentVO;
        }).collect(Collectors.toList());
    }

    @Override
    public QueryWrapper getQueryWrapper(CommentQueryRequest commentQueryRequest) {
        if (commentQueryRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "请求参数为空");
        }

        Long id = commentQueryRequest.getId();
        Long appId = commentQueryRequest.getAppId();
        Long parentId = commentQueryRequest.getParentId();
        Long userId = commentQueryRequest.getUserId();
        String content = commentQueryRequest.getContent();

        QueryWrapper<Comment> queryWrapper = new QueryWrapper<>();

        if (id != null) {
            queryWrapper.eq("id", id);
        }
        if (appId != null) {
            queryWrapper.eq("appId", appId);
        }
        if (parentId != null) {
            queryWrapper.eq("parentId", parentId);
        }
        if (userId != null) {
            queryWrapper.eq("userId", userId);
        }
        if (content != null && !content.trim().isEmpty()) {
            queryWrapper.like("content", content);
        }

        return queryWrapper;
    }

    @Override
    public Page<CommentVO> listAllCommentVOByPage(CommentQueryRequest commentQueryRequest) {
        ThrowUtils.throwIf(commentQueryRequest == null, ErrorCode.PARAMS_ERROR);

        long pageNum = commentQueryRequest.getPageNum();
        long pageSize = commentQueryRequest.getPageSize();

        QueryWrapper queryWrapper = getQueryWrapper(commentQueryRequest);

        // 添加排序逻辑
        String sortField = commentQueryRequest.getSortField();
        String sortOrder = commentQueryRequest.getSortOrder();
        if (sortField != null && !sortField.trim().isEmpty()) {
            boolean isAsc = "asc".equalsIgnoreCase(sortOrder);
            if ("createTime".equalsIgnoreCase(sortField)) {
                queryWrapper.orderBy(true, isAsc, "createTime");
            } else if ("likeCount".equalsIgnoreCase(sortField)) {
                queryWrapper.orderBy(true, isAsc, "likeCount");
            } else if ("replyCount".equalsIgnoreCase(sortField)) {
                queryWrapper.orderBy(true, isAsc, "replyCount");
            }
        } else {
            // 默认按创建时间降序
            queryWrapper.orderByDesc("createTime");
        }

        Page<Comment> commentPage = this.page(new Page<>(pageNum, pageSize), queryWrapper);

        // 数据转换
        Page<CommentVO> commentVOPage = new Page<>(pageNum, pageSize, commentPage.getTotal());
        List<CommentVO> commentVOList = getCommentVOList(commentPage.getRecords());
        commentVOPage.setRecords(commentVOList);

        return commentVOPage;
    }

    @Override
    public Page<CommentVO> listAppCommentVOByPage(CommentQueryRequest commentQueryRequest) {
        ThrowUtils.throwIf(commentQueryRequest == null, ErrorCode.PARAMS_ERROR);

        long pageNum = commentQueryRequest.getPageNum();
        long pageSize = commentQueryRequest.getPageSize();

        QueryWrapper queryWrapper = getQueryWrapper(commentQueryRequest);

        // 添加排序逻辑
        String sortField = commentQueryRequest.getSortField();
        String sortOrder = commentQueryRequest.getSortOrder();
        if (sortField != null && !sortField.trim().isEmpty()) {
            boolean isAsc = "asc".equalsIgnoreCase(sortOrder);
            if ("createTime".equalsIgnoreCase(sortField)) {
                queryWrapper.orderBy(true, isAsc, "createTime");
            } else if ("likeCount".equalsIgnoreCase(sortField)) {
                queryWrapper.orderBy(true, isAsc, "likeCount");
            } else if ("replyCount".equalsIgnoreCase(sortField)) {
                queryWrapper.orderBy(true, isAsc, "replyCount");
            }
        } else {
            // 默认按创建时间降序
            queryWrapper.orderByDesc("createTime");
        }

        Page<Comment> commentPage = this.page(new Page<>(pageNum, pageSize), queryWrapper);

        // 数据转换
        Page<CommentVO> commentVOPage = new Page<>(pageNum, pageSize, commentPage.getTotal());
        List<CommentVO> commentVOList = getCommentVOList(commentPage.getRecords());
        commentVOPage.setRecords(commentVOList);

        return commentVOPage;
    }

    @Override
    public Long addForumComment(Comment comment, Long userId) {
        ThrowUtils.throwIf(comment == null, ErrorCode.PARAMS_ERROR);
        ThrowUtils.throwIf(userId == null, ErrorCode.PARAMS_ERROR);
        ThrowUtils.throwIf(comment.getAppId() == null, ErrorCode.PARAMS_ERROR, "帖子ID不能为空");
        ThrowUtils.throwIf(comment.getContent() == null || comment.getContent().trim().isEmpty(), ErrorCode.PARAMS_ERROR, "评论内容不能为空");

        comment.setUserId(userId);
        comment.setCommentType(2);
        comment.setLikeCount(0);
        comment.setReplyCount(0);
        comment.setIsDelete(0);

        boolean saved = this.save(comment);
        ThrowUtils.throwIf(!saved, ErrorCode.OPERATION_ERROR, "保存失败");

        incrementForumPostCommentCount(comment.getAppId());

        return comment.getId();
    }

    @Override
    public Long replyForumComment(Comment comment, Long userId) {
        ThrowUtils.throwIf(comment == null, ErrorCode.PARAMS_ERROR);
        ThrowUtils.throwIf(userId == null, ErrorCode.PARAMS_ERROR);
        ThrowUtils.throwIf(comment.getParentId() == null, ErrorCode.PARAMS_ERROR, "父评论ID不能为空");
        ThrowUtils.throwIf(comment.getContent() == null || comment.getContent().trim().isEmpty(), ErrorCode.PARAMS_ERROR, "回复内容不能为空");

        Comment parentComment = this.getById(comment.getParentId());
        ThrowUtils.throwIf(parentComment == null, ErrorCode.NOT_FOUND_ERROR, "父评论不存在");
        ThrowUtils.throwIf(parentComment.getCommentType() != 2, ErrorCode.PARAMS_ERROR, "只能回复论坛评论");

        comment.setUserId(userId);
        comment.setAppId(parentComment.getAppId());
        comment.setCommentType(2);
        comment.setLikeCount(0);
        comment.setReplyCount(0);
        comment.setIsDelete(0);

        boolean saved = this.save(comment);
        ThrowUtils.throwIf(!saved, ErrorCode.OPERATION_ERROR, "保存失败");

        incrementReplyCount(comment.getParentId());

        return comment.getId();
    }

    @Override
    public Page<CommentVO> listForumPostCommentVOByPage(CommentQueryRequest commentQueryRequest) {
        ThrowUtils.throwIf(commentQueryRequest == null, ErrorCode.PARAMS_ERROR);

        long pageNum = commentQueryRequest.getPageNum();
        long pageSize = commentQueryRequest.getPageSize();

        QueryWrapper<Comment> queryWrapper = getQueryWrapper(commentQueryRequest);
        queryWrapper.eq("commentType", 2);

        String sortField = commentQueryRequest.getSortField();
        String sortOrder = commentQueryRequest.getSortOrder();
        if (sortField != null && !sortField.trim().isEmpty()) {
            boolean isAsc = "asc".equalsIgnoreCase(sortOrder);
            if ("createTime".equalsIgnoreCase(sortField)) {
                queryWrapper.orderBy(true, isAsc, "createTime");
            } else if ("likeCount".equalsIgnoreCase(sortField)) {
                queryWrapper.orderBy(true, isAsc, "likeCount");
            } else if ("replyCount".equalsIgnoreCase(sortField)) {
                queryWrapper.orderBy(true, isAsc, "replyCount");
            }
        } else {
            queryWrapper.orderByDesc("createTime");
        }

        Page<Comment> commentPage = this.page(new Page<>(pageNum, pageSize), queryWrapper);

        Page<CommentVO> commentVOPage = new Page<>(pageNum, pageSize, commentPage.getTotal());
        List<CommentVO> commentVOList = getCommentVOList(commentPage.getRecords());
        commentVOPage.setRecords(commentVOList);

        return commentVOPage;
    }

    @Override
    public boolean incrementForumPostCommentCount(Long postId) {
        ThrowUtils.throwIf(postId == null || postId <= 0, ErrorCode.PARAMS_ERROR);

        com.mashang.aicode.web.model.entity.ForumPost forumPost = forumPostService.getById(postId);
        ThrowUtils.throwIf(forumPost == null, ErrorCode.NOT_FOUND_ERROR, "帖子不存在");

        com.mashang.aicode.web.model.entity.ForumPost updatePost = new com.mashang.aicode.web.model.entity.ForumPost();
        updatePost.setId(postId);
        updatePost.setCommentCount((forumPost.getCommentCount() == null ? 0 : forumPost.getCommentCount()) + 1);

        return forumPostService.updateById(updatePost);
    }

    @Override
    public boolean decrementForumPostCommentCount(Long postId) {
        ThrowUtils.throwIf(postId == null || postId <= 0, ErrorCode.PARAMS_ERROR);

        com.mashang.aicode.web.model.entity.ForumPost forumPost = forumPostService.getById(postId);
        ThrowUtils.throwIf(forumPost == null, ErrorCode.NOT_FOUND_ERROR, "帖子不存在");

        int currentCommentCount = forumPost.getCommentCount() == null ? 0 : forumPost.getCommentCount();
        if (currentCommentCount <= 0) {
            return true;
        }

        com.mashang.aicode.web.model.entity.ForumPost updatePost = new com.mashang.aicode.web.model.entity.ForumPost();
        updatePost.setId(postId);
        updatePost.setCommentCount(currentCommentCount - 1);

        return forumPostService.updateById(updatePost);
    }

    @Override
    public boolean incrementLikeCount(Long id) {
        ThrowUtils.throwIf(id == null || id <= 0, ErrorCode.PARAMS_ERROR);

        Comment comment = this.getById(id);
        ThrowUtils.throwIf(comment == null, ErrorCode.NOT_FOUND_ERROR, "评论不存在");

        Comment updateComment = new Comment();
        updateComment.setId(id);
        updateComment.setLikeCount((comment.getLikeCount() == null ? 0 : comment.getLikeCount()) + 1);

        return this.updateById(updateComment);
    }

    @Override
    public boolean decrementLikeCount(Long id) {
        ThrowUtils.throwIf(id == null || id <= 0, ErrorCode.PARAMS_ERROR);

        Comment comment = this.getById(id);
        ThrowUtils.throwIf(comment == null, ErrorCode.NOT_FOUND_ERROR, "评论不存在");

        int currentLikeCount = comment.getLikeCount() == null ? 0 : comment.getLikeCount();
        if (currentLikeCount <= 0) {
            return true;
        }

        Comment updateComment = new Comment();
        updateComment.setId(id);
        updateComment.setLikeCount(currentLikeCount - 1);

        return this.updateById(updateComment);
    }

    @Override
    public boolean incrementReplyCount(Long id) {
        ThrowUtils.throwIf(id == null || id <= 0, ErrorCode.PARAMS_ERROR);

        Comment comment = this.getById(id);
        ThrowUtils.throwIf(comment == null, ErrorCode.NOT_FOUND_ERROR, "评论不存在");

        Comment updateComment = new Comment();
        updateComment.setId(id);
        updateComment.setReplyCount((comment.getReplyCount() == null ? 0 : comment.getReplyCount()) + 1);

        return this.updateById(updateComment);
    }

    @Override
    public boolean decrementReplyCount(Long id) {
        ThrowUtils.throwIf(id == null || id <= 0, ErrorCode.PARAMS_ERROR);

        Comment comment = this.getById(id);
        ThrowUtils.throwIf(comment == null, ErrorCode.NOT_FOUND_ERROR, "评论不存在");

        int currentReplyCount = comment.getReplyCount() == null ? 0 : comment.getReplyCount();
        if (currentReplyCount <= 0) {
            return true;
        }

        Comment updateComment = new Comment();
        updateComment.setId(id);
        updateComment.setReplyCount(currentReplyCount - 1);

        return this.updateById(updateComment);
    }
}
