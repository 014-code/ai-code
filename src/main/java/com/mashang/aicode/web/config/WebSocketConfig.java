package com.mashang.aicode.web.config;

import com.mashang.aicode.web.manager.websocket.AppEditHandler;
import com.mashang.aicode.web.manager.websocket.WsHandshakeInterceptor;
import jakarta.annotation.Resource;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * WebSocket 配置类
 * 
 * 功能说明：
 * 1. 启用 WebSocket 支持
 * 2. 注册 WebSocket 处理器
 * 3. 配置 WebSocket 拦截器
 * 
 * 使用场景：
 * - 应用编辑的实时协作
 * - 多用户同时编辑同一个应用
 * - 编辑操作的实时同步
 */
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Resource
    private AppEditHandler appEditHandler;

    @Resource
    private WsHandshakeInterceptor wsHandshakeInterceptor;

    /**
     * 注册 WebSocket 处理器
     * 
     * 配置说明：
     * 1. 注册应用编辑的 WebSocket 处理器
     * 2. 配置访问路径：/ws/app/edit
     * 3. 配置握手拦截器：用于权限验证
     * 4. 允许跨域访问
     * 
     * @param registry WebSocket 处理器注册器
     */
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // 注册应用编辑的 WebSocket 处理器
        registry.addHandler(appEditHandler, "/ws/app/edit")
                // 添加握手拦截器，用于验证用户权限
                .addInterceptors(wsHandshakeInterceptor)
                // 允许跨域访问
                .setAllowedOrigins("*");
    }
}
