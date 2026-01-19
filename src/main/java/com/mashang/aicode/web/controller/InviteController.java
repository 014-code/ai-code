package com.mashang.aicode.web.controller;

import com.mashang.aicode.web.common.BaseResponse;
import com.mashang.aicode.web.common.ResultUtils;
import com.mashang.aicode.web.model.entity.InviteRecord;
import com.mashang.aicode.web.model.entity.User;
import com.mashang.aicode.web.service.InviteRecordService;
import com.mashang.aicode.web.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static cn.hutool.core.util.StrUtil.isBlank;

/**
 * 邀请控制器
 */
@Slf4j
@RestController
@RequestMapping("/invite")
@Tag(name = "邀请管理", description = "邀请相关接口")
public class InviteController {

    @Resource
    private InviteRecordService inviteRecordService;

    @Resource
    private UserService userService;

    /**
     * 获取用户的邀请码
     *
     * @param request HTTP请求
     * @return 邀请码
     */
    @GetMapping("/code")
    @Operation(summary = "获取邀请码", description = "获取当前用户的邀请码")
    public BaseResponse<Map<String, String>> getInviteCode(HttpServletRequest request) {
        User loginUser = userService.getLoginUser(request);
        String inviteCode = inviteRecordService.getUserInviteCode(loginUser.getId());

        Map<String, String> result = new HashMap<>();
        result.put("inviteCode", inviteCode);
        result.put("inviteUrl", buildInviteUrl(request, inviteCode));

        return ResultUtils.success(result);
    }

    /**
     * 获取用户的邀请记录
     *
     * @param request HTTP请求
     * @return 邀请记录列表
     */
    @GetMapping("/records")
    @Operation(summary = "获取邀请记录", description = "查询当前用户的邀请记录列表")
    public BaseResponse<List<InviteRecord>> getInviteRecords(HttpServletRequest request) {
        User loginUser = userService.getLoginUser(request);
        List<InviteRecord> records = inviteRecordService.getUserInviteRecords(loginUser.getId());
        return ResultUtils.success(records);
    }

    private String buildInviteUrl(HttpServletRequest request, String inviteCode) {
        String origin = request.getHeader("Origin");
        String baseUrl;
        if (!isBlank(origin)) {
            baseUrl = origin;
        } else {
            String scheme = request.getScheme();
            String host = request.getServerName();
            int port = request.getServerPort();
            if (port == 80 || port == 443) {
                baseUrl = String.format("%s://%s", scheme, host);
            } else {
                baseUrl = String.format("%s://%s:%d", scheme, host, port);
            }
        }

        if (!baseUrl.endsWith("/")) {
            baseUrl += "/";
        }
        return baseUrl + "user/register?inviteCode=" + inviteCode;
    }

}
