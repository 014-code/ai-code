package com.mashang.aicode.web.controller;

import cn.hutool.core.bean.BeanUtil;
import com.mashang.aicode.web.annotation.AuthCheck;
import com.mashang.aicode.web.common.BaseResponse;
import com.mashang.aicode.web.common.DeleteRequest;
import com.mashang.aicode.web.common.ResultUtils;
import com.mashang.aicode.web.constant.UserConstant;
import com.mashang.aicode.web.exception.ErrorCode;
import com.mashang.aicode.web.exception.ThrowUtils;
import com.mashang.aicode.web.model.dto.forum.ForumPostAddRequest;
import com.mashang.aicode.web.model.dto.forum.ForumPostQueryRequest;
import com.mashang.aicode.web.model.dto.forum.ForumPostUpdateRequest;
import com.mashang.aicode.web.model.entity.ForumPost;
import com.mashang.aicode.web.model.entity.User;
import com.mashang.aicode.web.model.vo.ForumPostSimpleVO;
import com.mashang.aicode.web.model.vo.ForumPostVO;
import com.mashang.aicode.web.service.ForumPostService;
import com.mashang.aicode.web.service.UserService;
import com.mybatisflex.core.paginate.Page;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/forum/post")
@Slf4j
public class ForumPostController {

    @Resource
    private ForumPostService forumPostService;

    @Resource
    private UserService userService;

    @PostMapping("/add")
    public BaseResponse<Long> addForumPost(@RequestBody ForumPostAddRequest forumPostAddRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(forumPostAddRequest == null, ErrorCode.PARAMS_ERROR);

        User loginUser = userService.getLoginUser(request);

        ForumPost forumPost = new ForumPost();
        BeanUtil.copyProperties(forumPostAddRequest, forumPost);

        Long postId = forumPostService.addForumPost(forumPost, loginUser);
        return ResultUtils.success(postId);
    }

    @PostMapping("/update")
    public BaseResponse<Boolean> updateForumPost(@RequestBody ForumPostUpdateRequest forumPostUpdateRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(forumPostUpdateRequest == null || forumPostUpdateRequest.getId() == null, ErrorCode.PARAMS_ERROR);

        User loginUser = userService.getLoginUser(request);

        ForumPost forumPost = new ForumPost();
        BeanUtil.copyProperties(forumPostUpdateRequest, forumPost);

        boolean result = forumPostService.updateForumPost(forumPost, loginUser);
        return ResultUtils.success(result);
    }

    @PostMapping("/delete")
    public BaseResponse<Boolean> deleteForumPost(@RequestBody DeleteRequest deleteRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(deleteRequest == null || deleteRequest.getId() == null, ErrorCode.PARAMS_ERROR);

        User loginUser = userService.getLoginUser(request);

        boolean result = forumPostService.deleteForumPost(deleteRequest.getId(), loginUser);
        return ResultUtils.success(result);
    }

    @GetMapping("/get/vo")
    public BaseResponse<ForumPostVO> getForumPostVOById(@RequestParam Long id, HttpServletRequest request) {
        ThrowUtils.throwIf(id == null || id <= 0, ErrorCode.PARAMS_ERROR);

        ForumPost forumPost = forumPostService.getById(id);
        ThrowUtils.throwIf(forumPost == null, ErrorCode.NOT_FOUND_ERROR);

        forumPostService.incrementViewCount(id);

        ForumPostVO forumPostVO = forumPostService.getForumPostVO(forumPost);
        return ResultUtils.success(forumPostVO);
    }

    @PostMapping("/list/page/vo")
    public BaseResponse<Page<ForumPostVO>> listForumPostVOByPage(@RequestBody ForumPostQueryRequest forumPostQueryRequest) {
        ThrowUtils.throwIf(forumPostQueryRequest == null, ErrorCode.PARAMS_ERROR);

        Page<ForumPostVO> forumPostVOPage = forumPostService.listForumPostVOByPage(forumPostQueryRequest);
        return ResultUtils.success(forumPostVOPage);
    }

    @PostMapping("/list/page/simple")
    public BaseResponse<Page<ForumPostSimpleVO>> listForumPostSimpleVOByPage(@RequestBody ForumPostQueryRequest forumPostQueryRequest) {
        ThrowUtils.throwIf(forumPostQueryRequest == null, ErrorCode.PARAMS_ERROR);

        Page<ForumPostSimpleVO> forumPostSimpleVOPage = forumPostService.listForumPostSimpleVOByPage(forumPostQueryRequest);
        return ResultUtils.success(forumPostSimpleVOPage);
    }

    @PostMapping("/like")
    public BaseResponse<Boolean> likeForumPost(@RequestBody ForumPostUpdateRequest forumPostUpdateRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(forumPostUpdateRequest == null || forumPostUpdateRequest.getId() == null, ErrorCode.PARAMS_ERROR);

        User loginUser = userService.getLoginUser(request);

        ForumPost forumPost = forumPostService.getById(forumPostUpdateRequest.getId());
        ThrowUtils.throwIf(forumPost == null, ErrorCode.NOT_FOUND_ERROR);

        boolean result = forumPostService.incrementLikeCount(forumPostUpdateRequest.getId());
        return ResultUtils.success(result);
    }

    @PostMapping("/unlike")
    public BaseResponse<Boolean> unlikeForumPost(@RequestBody ForumPostUpdateRequest forumPostUpdateRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(forumPostUpdateRequest == null || forumPostUpdateRequest.getId() == null, ErrorCode.PARAMS_ERROR);

        User loginUser = userService.getLoginUser(request);

        ForumPost forumPost = forumPostService.getById(forumPostUpdateRequest.getId());
        ThrowUtils.throwIf(forumPost == null, ErrorCode.NOT_FOUND_ERROR);

        boolean result = forumPostService.decrementLikeCount(forumPostUpdateRequest.getId());
        return ResultUtils.success(result);
    }

    @PostMapping("/set/pinned")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> setForumPostPinned(@RequestBody ForumPostUpdateRequest forumPostUpdateRequest) {
        ThrowUtils.throwIf(forumPostUpdateRequest == null || forumPostUpdateRequest.getId() == null, ErrorCode.PARAMS_ERROR);

        ForumPost forumPost = forumPostService.getById(forumPostUpdateRequest.getId());
        ThrowUtils.throwIf(forumPost == null, ErrorCode.NOT_FOUND_ERROR, "帖子不存在");

        ForumPost updatePost = new ForumPost();
        updatePost.setId(forumPostUpdateRequest.getId());
        updatePost.setIsPinned(forumPostUpdateRequest.getIsPinned() != null ? forumPostUpdateRequest.getIsPinned() : 0);

        boolean result = forumPostService.updateById(updatePost);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);

        return ResultUtils.success(true);
    }

    @GetMapping("/hot/list/vo")
    public BaseResponse<java.util.List<ForumPostVO>> listHotPosts(@RequestParam(defaultValue = "10") int limit) {
        ThrowUtils.throwIf(limit <= 0, ErrorCode.PARAMS_ERROR);

        java.util.List<ForumPostVO> hotPosts = forumPostService.listHotPosts(limit);
        return ResultUtils.success(hotPosts);
    }

}
