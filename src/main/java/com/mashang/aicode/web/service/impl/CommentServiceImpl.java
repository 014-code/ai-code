package com.mashang.aicode.web.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.collection.CollUtil;
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
import com.mashang.aicode.web.model.entity.table.AppTableDef;
import com.mashang.aicode.web.model.entity.table.CommentTableDef;
import com.mashang.aicode.web.model.entity.table.UserTableDef;
import com.mashang.aicode.web.model.vo.AppVO;
import com.mashang.aicode.web.model.vo.CommentVO;
import com.mashang.aicode.web.model.vo.UserVO;
import com.mashang.aicode.web.service.AppService;
import com.mashang.aicode.web.service.CommentService;
import com.mashang.aicode.web.service.ForumPostService;
import com.mashang.aicode.web.service.UserService;
import com.mybatisflex.core.paginate.Page;
import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.spring.service.impl.ServiceImpl;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.mashang.aicode.web.model.entity.table.AppTableDef.APP;
import static com.mashang.aicode.web.model.entity.table.CommentTableDef.COMMENT;
import static com.mashang.aicode.web.model.entity.table.UserTableDef.USER;

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
            User user = userMapper.selectOneById(comment.getUserId());
            if (user != null) {
                UserVO userVO = userService.getUserVO(user);
                commentVO.setUser(userVO);
            }
        }

        // 设置应用信息
        if (comment.getAppId() != null) {
            App app = appMapper.selectOneById(comment.getAppId());
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
        Map<Long, UserVO> userVOMap = userMapper.selectListByQuery(QueryWrapper.create().select(USER.ID, USER.USER_NAME, USER.USER_AVATAR).where(USER.ID.in(userIds))).stream().map(userService::getUserVO).collect(Collectors.toMap(UserVO::getId, userVO -> userVO));

        // 获取所有应用ID
        List<Long> appIds = commentList.stream().map(Comment::getAppId).distinct().collect(Collectors.toList());

        // 批量查询应用信息
        Map<Long, AppVO> appVOMap = appMapper.selectListByQuery(QueryWrapper.create().select(APP.ID, APP.APP_NAME, APP.COVER).where(APP.ID.in(appIds))).stream().map(appService::getAppVO).collect(Collectors.toMap(AppVO::getId, appVO -> appVO));

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

        QueryWrapper queryWrapper = QueryWrapper.create();

        if (id != null) {
            queryWrapper.and(COMMENT.ID.eq(id));
        }
        if (appId != null) {
            queryWrapper.and(COMMENT.APP_ID.eq(appId));
        }
        if (parentId != null) {
            queryWrapper.and(COMMENT.PARENT_ID.eq(parentId));
        }
        if (userId != null) {
            queryWrapper.and(COMMENT.USER_ID.eq(userId));
        }
        if (content != null && !content.trim().isEmpty()) {
            queryWrapper.and(COMMENT.CONTENT.like("%" + content + "%"));
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
                queryWrapper.orderBy(COMMENT.CREATE_TIME, isAsc);
            } else if ("likeCount".equalsIgnoreCase(sortField)) {
                queryWrapper.orderBy(COMMENT.LIKE_COUNT, isAsc);
            } else if ("replyCount".equalsIgnoreCase(sortField)) {
                queryWrapper.orderBy(COMMENT.REPLY_COUNT, isAsc);
            }
        } else {
            // 默认按创建时间降序
            queryWrapper.orderBy(COMMENT.CREATE_TIME, false);
        }

        Page<Comment> commentPage = this.page(Page.of(pageNum, pageSize), queryWrapper);

        // 数据转换
        Page<CommentVO> commentVOPage = new Page<>(pageNum, pageSize, commentPage.getTotalRow());
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
                queryWrapper.orderBy(COMMENT.CREATE_TIME, isAsc);
            } else if ("likeCount".equalsIgnoreCase(sortField)) {
                queryWrapper.orderBy(COMMENT.LIKE_COUNT, isAsc);
            } else if ("replyCount".equalsIgnoreCase(sortField)) {
                queryWrapper.orderBy(COMMENT.REPLY_COUNT, isAsc);
            }
        } else {
            // 默认按创建时间降序
            queryWrapper.orderBy(COMMENT.CREATE_TIME, false);
        }

        Page<Comment> commentPage = this.page(Page.of(pageNum, pageSize), queryWrapper);

        // 数据转换
        Page<CommentVO> commentVOPage = new Page<>(pageNum, pageSize, commentPage.getTotalRow());
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

        QueryWrapper queryWrapper = getQueryWrapper(commentQueryRequest);
        queryWrapper.and(COMMENT.COMMENT_TYPE.eq(2));

        String sortField = commentQueryRequest.getSortField();
        String sortOrder = commentQueryRequest.getSortOrder();
        if (sortField != null && !sortField.trim().isEmpty()) {
            boolean isAsc = "asc".equalsIgnoreCase(sortOrder);
            if ("createTime".equalsIgnoreCase(sortField)) {
                queryWrapper.orderBy(COMMENT.CREATE_TIME, isAsc);
            } else if ("likeCount".equalsIgnoreCase(sortField)) {
                queryWrapper.orderBy(COMMENT.LIKE_COUNT, isAsc);
            } else if ("replyCount".equalsIgnoreCase(sortField)) {
                queryWrapper.orderBy(COMMENT.REPLY_COUNT, isAsc);
            }
        } else {
            queryWrapper.orderBy(COMMENT.CREATE_TIME, false);
        }

        Page<Comment> commentPage = this.page(Page.of(pageNum, pageSize), queryWrapper);

        Page<CommentVO> commentVOPage = new Page<>(pageNum, pageSize, commentPage.getTotalRow());
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
