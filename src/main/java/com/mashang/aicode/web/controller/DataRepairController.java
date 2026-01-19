package com.mashang.aicode.web.controller;

import com.mashang.aicode.web.annotation.AuthCheck;
import com.mashang.aicode.web.common.BaseResponse;
import com.mashang.aicode.web.common.ResultUtils;
import com.mashang.aicode.web.constant.UserConstant;
import com.mashang.aicode.web.service.impl.DataRepairService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 数据修复控制器 - 仅管理员可访问
 */
@RestController
@RequestMapping("/admin/data-repair")
@Slf4j
public class DataRepairController {

    @Resource
    private DataRepairService dataRepairService;

    /**
     * 为所有现有用户初始化积分账户
     * @return 成功初始化的用户数量
     */
    @PostMapping("/init-points")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Map<String, Object>> initializePointsForAllUsers() {
        log.info("[管理员操作] 开始为所有现有用户初始化积分");

        int successCount = dataRepairService.initializePointsForExistingUsers();

        Map<String, Object> result = new HashMap<>();
        result.put("successCount", successCount);
        result.put("message", String.format("成功为 %d 个用户初始化积分账户", successCount));

        log.info("[管理员操作] 积分初始化完成，成功数量: {}", successCount);

        return ResultUtils.success(result);
    }

    /**
     * 为单个用户初始化积分
     * @param userId 用户ID
     * @param points 赠送积分数量（可选，默认100）
     * @return 是否成功
     */
    @PostMapping("/init-points/{userId}")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> initializePointsForUser(
            @PathVariable Long userId,
            @RequestParam(required = false) Integer points) {

        log.info("[管理员操作] 为用户 {} 初始化积分，数量: {}", userId, points);

        boolean success = dataRepairService.initializePointsForUser(userId, points);

        return ResultUtils.success(success);
    }

    /**
     * 为全部管理员账号发放积分
     *
     * @param points 发放积分数量（默认100）
     * @return 发放成功的管理员数量
     */
    @PostMapping("/grant-admin-points")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Map<String, Object>> grantPointsForAdmins(@RequestParam(required = false) Integer points) {
        log.info("[管理员操作] 为管理员账号发放积分，数量: {}", points);

        int successCount = dataRepairService.grantPointsForAdmins(points);

        Map<String, Object> result = new HashMap<>();
        result.put("successCount", successCount);
        result.put("points", points);
        result.put("message", String.format("成功为 %d 个管理员发放积分", successCount));

        return ResultUtils.success(result);
    }
}
