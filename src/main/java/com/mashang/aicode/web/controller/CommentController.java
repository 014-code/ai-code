package com.mashang.aicode.web.controller;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mashang.aicode.web.annotation.AuthCheck;
import com.mashang.aicode.web.common.BaseResponse;
import com.mashang.aicode.web.common.ResultUtils;
import com.mashang.aicode.web.constant.UserConstant;
import com.mashang.aicode.web.exception.BusinessException;
import com.mashang.aicode.web.exception.ErrorCode;
import com.mashang.aicode.web.exception.ThrowUtils;
import com.mashang.aicode.web.model.dto.comment.CommentAddRequest;
import com.mashang.aicode.web.model.dto.comment.CommentQueryRequest;
import com.mashang.aicode.web.model.dto.comment.CommentReplyRequest;
import com.mashang.aicode.web.model.entity.Comment;
import com.mashang.aicode.web.model.entity.User;
import com.mashang.aicode.web.model.vo.CommentVO;
import com.mashang.aicode.web.service.CommentService;
import com.mashang.aicode.web.service.UserService;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

/**
 * 评论 控制层
 *
 * @author makejava
 */
@RestController
@RequestMapping("/comment")
@Slf4j
public class CommentController {

    @Resource
    private CommentService commentService;

    @Resource
    private UserService userService;

    /**
     * 【用户】添加评论
     * 为指定应用添加新评论
     *
     * @param commentAddRequest 评论添加请求，包含应用ID和评论内容
     * @param request           HTTP请求，用于获取当前登录用户
     * @return 返回评论ID
     */
    @PostMapping("/add")
    public BaseResponse<Long> addComment(@RequestBody CommentAddRequest commentAddRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(commentAddRequest == null, ErrorCode.PARAMS_ERROR);

        Long appId = commentAddRequest.getAppId();
        String content = commentAddRequest.getContent();
        ThrowUtils.throwIf(appId == null || appId <= 0, ErrorCode.PARAMS_ERROR, "应用ID无效");
        ThrowUtils.throwIf(content == null || content.trim().isEmpty(), ErrorCode.PARAMS_ERROR, "评论内容不能为空");

        User loginUser = userService.getLoginUser(request);

        Comment comment = new Comment();
        BeanUtil.copyProperties(commentAddRequest, comment);
        comment.setUserId(loginUser.getId());
        comment.setLikeCount(0);
        comment.setReplyCount(0);

        boolean result = commentService.save(comment);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR, "添加评论失败");

        return ResultUtils.success(comment.getId());
    }

    /**
     * 【用户】回复评论
     * 回复某条具体评论，或者回复应用的评论（主评论）
     *
     * @param commentReplyRequest 评论回复请求，包含父评论ID和回复内容
     * @param request             HTTP请求，用于获取当前登录用户
     * @return 返回评论ID
     */
    @PostMapping("/reply")
    public BaseResponse<Long> replyComment(@RequestBody CommentReplyRequest commentReplyRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(commentReplyRequest == null, ErrorCode.PARAMS_ERROR);

        Long parentId = commentReplyRequest.getParentId();
        String content = commentReplyRequest.getContent();
        ThrowUtils.throwIf(parentId == null || parentId <= 0, ErrorCode.PARAMS_ERROR, "父评论ID无效");
        ThrowUtils.throwIf(content == null || content.trim().isEmpty(), ErrorCode.PARAMS_ERROR, "回复内容不能为空");

        User loginUser = userService.getLoginUser(request);

        Comment parentComment = commentService.getById(parentId);
        ThrowUtils.throwIf(parentComment == null, ErrorCode.NOT_FOUND_ERROR, "父评论不存在");

        Comment comment = new Comment();
        comment.setParentId(parentId);
        comment.setAppId(parentComment.getAppId());
        comment.setUserId(loginUser.getId());
        comment.setContent(content);
        comment.setLikeCount(0);
        comment.setReplyCount(0);

        boolean result = commentService.save(comment);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR, "回复评论失败");

        return ResultUtils.success(comment.getId());
    }

    /**
     * 【用户】查询所有评论（分页）
     * 获取平台所有评论列表，支持分页和排序
     * 返回的评论包含应用信息，用于实现类似论坛的功能
     *
     * @param commentQueryRequest 评论查询请求，包含分页信息、排序字段、应用ID、用户ID等筛选条件
     * @return 返回所有评论列表，包含应用信息和用户信息
     */
    @PostMapping("/all/list/page/vo")
    public BaseResponse<Page<CommentVO>> listAllCommentsByPage(@RequestBody CommentQueryRequest commentQueryRequest) {
        ThrowUtils.throwIf(commentQueryRequest == null, ErrorCode.PARAMS_ERROR);

        long pageNum = commentQueryRequest.getPageNum();
        long pageSize = commentQueryRequest.getPageSize();

        Page<CommentVO> commentVOPage = commentService.listAllCommentVOByPage(commentQueryRequest);
        return ResultUtils.success(commentVOPage);
    }

    /**
     * 【用户】查询应用评论（分页）
     * 获取指定应用的评论列表，支持分页和排序
     *
     * @param commentQueryRequest 评论查询请求，包含分页信息、排序字段、应用ID等筛选条件
     * @return 返回指定应用的评论列表，包含回复信息
     */
    @PostMapping("/app/list/page/vo")
    public BaseResponse<Page<CommentVO>> listAppCommentsByPage(@RequestBody CommentQueryRequest commentQueryRequest) {
        ThrowUtils.throwIf(commentQueryRequest == null, ErrorCode.PARAMS_ERROR);

        Long appId = commentQueryRequest.getAppId();
        ThrowUtils.throwIf(appId == null || appId <= 0, ErrorCode.PARAMS_ERROR, "应用ID无效");

        Page<CommentVO> commentVOPage = commentService.listAppCommentVOByPage(commentQueryRequest);
        return ResultUtils.success(commentVOPage);
    }

    /**
     * 【用户】根据 id 删除自己的评论
     *
     * @param id      评论ID
     * @param request HTTP请求，用于获取当前登录用户
     * @return 返回删除结果
     */
    @PostMapping("/delete/user")
    public BaseResponse<Boolean> deleteComment(@RequestBody Long id, HttpServletRequest request) {
        ThrowUtils.throwIf(id == null || id <= 0, ErrorCode.PARAMS_ERROR, "评论ID无效");

        User loginUser = userService.getLoginUser(request);

        Comment comment = commentService.getById(id);
        ThrowUtils.throwIf(comment == null, ErrorCode.NOT_FOUND_ERROR, "评论不存在");

        ThrowUtils.throwIf(!comment.getUserId().equals(loginUser.getId()), ErrorCode.NO_AUTH_ERROR, "无权限删除该评论");

        boolean result = commentService.removeById(id);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR, "删除评论失败");

        return ResultUtils.success(true);
    }

    /**
     * 【管理员】根据 id 删除任意评论
     *
     * @param id 评论ID
     * @return 返回删除结果
     */
    @PostMapping("/delete")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> deleteCommentByAdmin(@RequestBody Long id) {
        ThrowUtils.throwIf(id == null || id <= 0, ErrorCode.PARAMS_ERROR, "评论ID无效");

        Comment comment = commentService.getById(id);
        ThrowUtils.throwIf(comment == null, ErrorCode.NOT_FOUND_ERROR, "评论不存在");

        boolean result = commentService.removeById(id);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR, "删除评论失败");

        return ResultUtils.success(true);
    }

    /**
     * 【管理员】根据 id 查看评论详情
     *
     * @param id 评论ID
     * @return 返回评论详情
     */
    @GetMapping("/get")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Comment> getCommentById(@RequestParam Long id) {
        ThrowUtils.throwIf(id == null || id <= 0, ErrorCode.PARAMS_ERROR, "评论ID无效");

        Comment comment = commentService.getById(id);
        ThrowUtils.throwIf(comment == null, ErrorCode.NOT_FOUND_ERROR, "评论不存在");

        return ResultUtils.success(comment);
    }

    /**
     * 【管理员】分页查询所有评论列表
     *
     * @param commentQueryRequest 评论查询请求，包含分页信息和筛选条件
     * @return 返回评论列表
     */
    @PostMapping("/list/page")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Page<Comment>> listCommentByPage(@RequestBody CommentQueryRequest commentQueryRequest) {
        ThrowUtils.throwIf(commentQueryRequest == null, ErrorCode.PARAMS_ERROR);

        long pageNum = commentQueryRequest.getPageNum();
        long pageSize = commentQueryRequest.getPageSize();

        Page<Comment> commentPage = commentService.page(new Page<>(pageNum, pageSize), commentService.getQueryWrapper(commentQueryRequest));

        return ResultUtils.success(commentPage);
    }

    /**
     * 【用户】添加论坛评论
     * 为指定论坛帖子添加新评论
     *
     * @param comment 评论对象，包含帖子ID和评论内容
     * @param request HTTP请求，用于获取当前登录用户
     * @return 返回评论ID
     */
    @PostMapping("/forum/add")
    public BaseResponse<Long> addForumComment(@RequestBody Comment comment, HttpServletRequest request) {
        ThrowUtils.throwIf(comment == null, ErrorCode.PARAMS_ERROR);

        User loginUser = userService.getLoginUser(request);

        Long commentId = commentService.addForumComment(comment, loginUser.getId());
        return ResultUtils.success(commentId);
    }

    /**
     * 【用户】回复论坛评论
     * 回复某条论坛评论
     *
     * @param comment 评论对象，包含父评论ID和回复内容
     * @param request HTTP请求，用于获取当前登录用户
     * @return 返回评论ID
     */
    @PostMapping("/forum/reply")
    public BaseResponse<Long> replyForumComment(@RequestBody Comment comment, HttpServletRequest request) {
        ThrowUtils.throwIf(comment == null, ErrorCode.PARAMS_ERROR);

        User loginUser = userService.getLoginUser(request);

        Long commentId = commentService.replyForumComment(comment, loginUser.getId());
        return ResultUtils.success(commentId);
    }

    /**
     * 【用户】查询论坛帖子评论（分页）
     * 获取指定论坛帖子的评论列表，支持分页和排序
     *
     * @param commentQueryRequest 评论查询请求，包含分页信息、排序字段、帖子ID等筛选条件
     * @return 返回指定帖子的评论列表
     */
    @PostMapping("/forum/list/page/vo")
    public BaseResponse<Page<CommentVO>> listForumPostCommentsByPage(@RequestBody CommentQueryRequest commentQueryRequest) {
        ThrowUtils.throwIf(commentQueryRequest == null, ErrorCode.PARAMS_ERROR);

        Page<CommentVO> commentVOPage = commentService.listForumPostCommentVOByPage(commentQueryRequest);
        return ResultUtils.success(commentVOPage);
    }

    /**
     * 【用户】点赞论坛评论
     *
     * @param id      评论ID
     * @param request HTTP请求，用于获取当前登录用户
     * @return 返回点赞结果
     */
    @PostMapping("/forum/like")
    public BaseResponse<Boolean> likeForumComment(@RequestBody Long id, HttpServletRequest request) {
        ThrowUtils.throwIf(id == null || id <= 0, ErrorCode.PARAMS_ERROR, "评论ID无效");

        User loginUser = userService.getLoginUser(request);

        Comment comment = commentService.getById(id);
        ThrowUtils.throwIf(comment == null, ErrorCode.NOT_FOUND_ERROR, "评论不存在");
        ThrowUtils.throwIf(comment.getCommentType() != 2, ErrorCode.PARAMS_ERROR, "该评论不是论坛评论");

        boolean result = commentService.incrementLikeCount(id);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR, "点赞失败");

        return ResultUtils.success(true);
    }

    /**
     * 【用户】取消点赞论坛评论
     *
     * @param id      评论ID
     * @param request HTTP请求，用于获取当前登录用户
     * @return 返回取消点赞结果
     */
    @PostMapping("/forum/unlike")
    public BaseResponse<Boolean> unlikeForumComment(@RequestBody Long id, HttpServletRequest request) {
        ThrowUtils.throwIf(id == null || id <= 0, ErrorCode.PARAMS_ERROR, "评论ID无效");

        User loginUser = userService.getLoginUser(request);

        Comment comment = commentService.getById(id);
        ThrowUtils.throwIf(comment == null, ErrorCode.NOT_FOUND_ERROR, "评论不存在");
        ThrowUtils.throwIf(comment.getCommentType() != 2, ErrorCode.PARAMS_ERROR, "该评论不是论坛评论");

        boolean result = commentService.decrementLikeCount(id);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR, "取消点赞失败");

        return ResultUtils.success(true);
    }

    /**
     * 【用户】删除论坛评论
     *
     * @param id      评论ID
     * @param request HTTP请求，用于获取当前登录用户
     * @return 返回删除结果
     */
    @PostMapping("/forum/delete/user")
    public BaseResponse<Boolean> deleteForumComment(@RequestBody Long id, HttpServletRequest request) {
        ThrowUtils.throwIf(id == null || id <= 0, ErrorCode.PARAMS_ERROR, "评论ID无效");

        User loginUser = userService.getLoginUser(request);

        Comment comment = commentService.getById(id);
        ThrowUtils.throwIf(comment == null, ErrorCode.NOT_FOUND_ERROR, "评论不存在");
        ThrowUtils.throwIf(comment.getCommentType() != 2, ErrorCode.PARAMS_ERROR, "该评论不是论坛评论");
        ThrowUtils.throwIf(!comment.getUserId().equals(loginUser.getId()), ErrorCode.NO_AUTH_ERROR, "无权限删除该评论");

        boolean result = commentService.removeById(id);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR, "删除评论失败");

        commentService.decrementForumPostCommentCount(comment.getAppId());

        if (comment.getParentId() != null) {
            commentService.decrementReplyCount(comment.getParentId());
        }

        return ResultUtils.success(true);
    }
}
