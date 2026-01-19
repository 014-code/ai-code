package com.mashang.aicode.web.controller;

import com.mashang.aicode.web.annotation.AuthCheck;
import com.mashang.aicode.web.common.BaseResponse;
import com.mashang.aicode.web.common.ResultUtils;
import com.mashang.aicode.web.model.entity.User;
import com.mashang.aicode.web.model.entity.UserPoint;
import com.mashang.aicode.web.service.UserPointService;
import com.mashang.aicode.web.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 用户积分控制器
 */
@Slf4j
@RestController
@RequestMapping("/user/points")
@Tag(name = "用户积分", description = "用户积分查询接口")
public class UserPointController {

    @Resource
    private UserPointService userPointService;

    @Resource
    private UserService userService;

    /**
     * 获取用户积分信息
     *
     * @param userId 用户ID
     * @return 用户积分信息
     */
    @GetMapping("/get/{userId}")
    @Operation(summary = "获取用户积分信息", description = "获取指定用户的积分信息")
    @AuthCheck(mustRole = "admin")
    public BaseResponse<UserPoint> getUserPoint(@PathVariable Long userId) {
        log.info("查询用户 {} 的积分信息", userId);
        UserPoint userPoint = userPointService.getUserPointByUserId(userId);
        return ResultUtils.success(userPoint);
    }

    /**
     * 获取当前用户的积分信息
     *
     * @return 当前用户的积分信息
     */
    @GetMapping("/current")
    @Operation(summary = "获取当前用户积分信息", description = "获取当前登录用户的积分信息")
    public BaseResponse<UserPoint> getCurrentUserPoint(HttpServletRequest request) {
        User loginUser = userService.getLoginUser(request);
        UserPoint userPoint = userPointService.getOrCreateUserPoint(loginUser.getId());
        return ResultUtils.success(userPoint);
    }
}
