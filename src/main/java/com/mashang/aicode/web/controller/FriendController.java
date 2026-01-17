package com.mashang.aicode.web.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mashang.aicode.web.annotation.AuthCheck;
import com.mashang.aicode.web.common.BaseResponse;
import com.mashang.aicode.web.common.PageRequest;
import com.mashang.aicode.web.common.ResultUtils;
import com.mashang.aicode.web.constant.UserConstant;
import com.mashang.aicode.web.exception.BusinessException;
import com.mashang.aicode.web.exception.ErrorCode;
import com.mashang.aicode.web.model.dto.friend.FriendListQueryDTO;
import com.mashang.aicode.web.model.dto.friend.FriendRequestSendDTO;
import com.mashang.aicode.web.model.entity.FriendRequest;
import com.mashang.aicode.web.model.vo.FriendRequestVO;
import com.mashang.aicode.web.model.vo.UserVO;
import com.mashang.aicode.web.service.FriendService;
import com.mashang.aicode.web.service.UserService;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

/**
 * 好友控制器
 */
@RestController
@RequestMapping("/friend")
@Slf4j
public class FriendController {

    @Resource
    private FriendService friendService;

    @Resource
    private UserService userService;

    /**
     * 发送好友请求
     *
     * @param requestDTO 发送好友请求DTO
     * @param request    HTTP请求
     * @return 好友请求
     */
    @PostMapping("/request")
    @AuthCheck(mustRole = UserConstant.DEFAULT_ROLE)
    public BaseResponse<FriendRequest> sendFriendRequest(@RequestBody FriendRequestSendDTO requestDTO, HttpServletRequest request) {
        Long userId = userService.getLoginUser(request).getId();
        FriendRequest friendRequest = friendService.sendFriendRequest(requestDTO, userId);
        return ResultUtils.success(friendRequest);
    }

    /**
     * 接受好友请求
     *
     * @param requestId 请求ID
     * @param request   HTTP请求
     * @return 是否成功
     */
    @PutMapping("/request/{requestId}/accept")
    @AuthCheck(mustRole = UserConstant.DEFAULT_ROLE)
    public BaseResponse<Boolean> acceptFriendRequest(@PathVariable Long requestId, HttpServletRequest request) {
        Long userId = userService.getLoginUser(request).getId();
        boolean success = friendService.acceptFriendRequest(requestId, userId);
        return ResultUtils.success(success);
    }

    /**
     * 拒绝好友请求
     *
     * @param requestId 请求ID
     * @param request   HTTP请求
     * @return 是否成功
     */
    @PutMapping("/request/{requestId}/reject")
    @AuthCheck(mustRole = UserConstant.DEFAULT_ROLE)
    public BaseResponse<Boolean> rejectFriendRequest(@PathVariable Long requestId, HttpServletRequest request) {
        Long userId = userService.getLoginUser(request).getId();
        boolean success = friendService.rejectFriendRequest(requestId, userId);
        return ResultUtils.success(success);
    }

    /**
     * 获取收到的好友请求
     *
     * @param status    请求状态
     * @param pageNum   页码
     * @param pageSize  每页大小
     * @param request   HTTP请求
     * @return 好友请求分页列表
     */
    @GetMapping("/requests")
    @AuthCheck(mustRole = UserConstant.DEFAULT_ROLE)
    public BaseResponse<Page<FriendRequestVO>> getReceivedFriendRequests(
            @RequestParam(value = "status", defaultValue = "PENDING") String status,
            @RequestParam(value = "pageNum", defaultValue = "1") Integer pageNum,
            @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize,
            HttpServletRequest request) {
        Long userId = userService.getLoginUser(request).getId();
        Page<FriendRequestVO> page = friendService.getReceivedFriendRequests(status, pageNum, pageSize, userId);
        return ResultUtils.success(page);
    }

    /**
     * 获取好友列表
     *
     * @param pageNum   页码
     * @param pageSize  每页大小
     * @param request  HTTP请求
     * @return 好友用户分页列表
     */
    @GetMapping("/list")
    @AuthCheck(mustRole = UserConstant.DEFAULT_ROLE)
    public BaseResponse<Page<UserVO>> getFriendList(
            @RequestParam(value = "pageNum", defaultValue = "1") Integer pageNum,
            @RequestParam(value = "pageSize", defaultValue = "20") Integer pageSize,
            HttpServletRequest request) {
        Long userId = userService.getLoginUser(request).getId();
        FriendListQueryDTO queryDTO = new FriendListQueryDTO();
        queryDTO.setPageNum(pageNum);
        queryDTO.setPageSize(pageSize);
        Page<UserVO> page = friendService.getFriendList(queryDTO, userId);
        return ResultUtils.success(page);
    }

    /**
     * 删除好友
     *
     * @param friendId 好友ID
     * @param request  HTTP请求
     * @return 是否成功
     */
    @DeleteMapping("/{friendId}")
    @AuthCheck(mustRole = UserConstant.DEFAULT_ROLE)
    public BaseResponse<Boolean> deleteFriend(@PathVariable Long friendId, HttpServletRequest request) {
        Long userId = userService.getLoginUser(request).getId();
        boolean success = friendService.deleteFriend(friendId, userId);
        return ResultUtils.success(success);
    }
}