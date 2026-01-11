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
}
