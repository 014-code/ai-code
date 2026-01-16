package com.mashang.aicode.web.manager.websocket;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.util.ObjUtil;
import cn.hutool.core.util.StrUtil;
import com.mashang.aicode.web.constant.SpaceUserPermissionConstant;
import com.mashang.aicode.web.manager.SpaceUserAuthManager;
import com.mashang.aicode.web.model.entity.App;
import com.mashang.aicode.web.model.entity.Space;
import com.mashang.aicode.web.model.entity.User;
import com.mashang.aicode.web.model.enums.SpaceTypeEnum;
import com.mashang.aicode.web.service.AppService;
import com.mashang.aicode.web.service.SpaceService;
import com.mashang.aicode.web.service.UserService;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.List;
import java.util.Map;

@Component
@Slf4j
public class WsHandshakeInterceptor implements HandshakeInterceptor {

    @Resource
    private UserService userService;

    @Resource
    private AppService appService;

    @Resource
    private SpaceService spaceService;

    @Resource
    private SpaceUserAuthManager spaceUserAuthManager;

    /**
     * websocket握手前处理
     * @param request
     * @param response
     * @param wsHandler
     * @param attributes
     * @return
     */
    @Override
    public boolean beforeHandshake(@NotNull ServerHttpRequest request, @NotNull ServerHttpResponse response, @NotNull WebSocketHandler wsHandler, @NotNull Map<String, Object> attributes) {
        if (request instanceof ServletServerHttpRequest) {
            HttpServletRequest servletRequest = ((ServletServerHttpRequest) request).getServletRequest();
            // 获取请求参数
            String appId = servletRequest.getParameter("appId");
            if (StrUtil.isBlank(appId)) {
                log.error("缺少应用参数，拒绝握手");
                return false;
            }
            
            // 从 URL 参数中获取 Sa-Token
            String token = servletRequest.getParameter("satoken");
            if (StrUtil.isNotBlank(token)) {
                // 手动设置 token 到 Sa-Token 上下文中
                StpUtil.setTokenValue(token);
            }
            
            User loginUser = userService.getLoginUser(servletRequest);
            if (ObjUtil.isEmpty(loginUser)) {
                log.error("用户未登录，拒绝握手");
                return false;
            }
            // 校验用户是否有该应用的权限
            App app = appService.getById(appId);
            if (app == null) {
                log.error("应用不存在，拒绝握手");
                return false;
            }
            Long spaceId = app.getSpaceId();
            Space space = null;
            if (spaceId != null) {
                space = spaceService.getById(spaceId);
                if (space == null) {
                    log.error("空间不存在，拒绝握手");
                    return false;
                }
                if (space.getSpaceType() != SpaceTypeEnum.TEAM.getValue()) {
                    log.info("不是团队空间，拒绝握手");
                    return false;
                }
                // 校验用户是否是空间成员
                List<String> permissionList = spaceUserAuthManager.getPermissionList(space, loginUser);
                if (permissionList.isEmpty()) {
                    log.error("不是空间成员，拒绝握手");
                    return false;
                }
            }
            // 设置 attributes
            attributes.put("user", loginUser);
            attributes.put("userId", loginUser.getId());
            // 记得转换为 Long 类型
            attributes.put("appId", Long.valueOf(appId));
        }
        return true;
    }

    @Override
    public void afterHandshake(@NotNull ServerHttpRequest request, @NotNull ServerHttpResponse response, @NotNull WebSocketHandler wsHandler, Exception exception) {
    }
}


