package com.mashang.aicode.web.manager.websocket;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.json.JSONUtil;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.mashang.aicode.web.manager.disruptor.AppEditEventProducer;
import com.mashang.aicode.web.manager.websocket.model.DialogueMessageTypeEnum;
import com.mashang.aicode.web.manager.websocket.model.DialogueRequestMessage;
import com.mashang.aicode.web.manager.websocket.model.DialogueResponseMessage;
import com.mashang.aicode.web.manager.websocket.model.EditActionEnum;
import com.mashang.aicode.web.mapper.UserMapper;
import com.mashang.aicode.web.model.entity.User;
import com.mashang.aicode.web.model.vo.UserVO;
import com.mashang.aicode.web.service.UserService;
import jakarta.annotation.Resource;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 应用编辑 WebSocket 处理器
 * 
 * 功能说明：
 * 1. 管理应用的多用户实时协作编辑
 * 2. 同一应用只能有一个用户处于编辑状态
 * 3. 编辑操作会实时广播给所有连接的用户
 * 4. 新加入的用户可以看到之前的编辑记录
 * 
 * 使用场景：
 * - 多个用户同时查看同一个应用
 * - 只有一个用户可以编辑，其他用户只能查看
 * - 编辑操作会实时同步给所有用户
 */
@Slf4j
@Component
public class AppEditHandler extends TextWebSocketHandler {

    /**
     * 记录每个应用的编辑状态
     * key: 应用ID (appId)
     * value: 当前正在编辑该应用的用户ID
     * 
     * 说明：同一时间只有一个用户可以编辑某个应用
     */
    private final Map<Long, Long> appEditingUsers = new ConcurrentHashMap<>();

    /**
     * 保存所有连接的 WebSocket 会话
     * key: 应用ID (appId)
     * value: 连接到该应用的所有用户会话集合
     * 
     * 说明：用于向所有连接到该应用的用户广播消息
     */
    private final Map<Long, Set<WebSocketSession>> appSessions = new ConcurrentHashMap<>();

    /**
     * 保存每个应用的编辑记录
     * key: 应用ID (appId)
     * value: 该应用的所有编辑操作记录（消息列表）
     * 
     * 说明：新加入的用户可以看到之前的编辑历史
     */
    private final Map<Long, List<TextMessage>> appEditRecodes = new ConcurrentHashMap<>();

    @Resource
    private UserMapper userDAO;

    @Resource
    private UserService userService;

    @Resource
    private AppEditEventProducer appEditEventProducer;

    @Resource
    private ObjectMapper objectMapper;

    /**
     * WebSocket 连接建立成功后的回调方法
     * 
     * 执行流程：
     * 1. 从会话中获取用户信息和应用ID
     * 2. 将该用户的会话添加到应用的会话集合中
     * 3. 向所有连接到该应用的用户广播"用户加入"消息
     * 4. 向新加入的用户发送该应用的历史编辑记录
     * 
     * @param session WebSocket 会话对象
     * @throws Exception 异常
     */
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        // 从会话属性中获取当前用户和应用ID
        User user = (User) session.getAttributes().get("user");
        Long appId = (Long) session.getAttributes().get("appId");

        // 将该用户的会话添加到应用的会话集合中
        // computeIfAbsent: 如果该应用还没有会话集合，则创建一个新的
        appSessions.computeIfAbsent(appId, k -> ConcurrentHashMap.newKeySet());
        appSessions.get(appId).add(session);

        // 构造"用户加入"的消息，包含在线用户列表
        DialogueResponseMessage appEditResponseMessage = new DialogueResponseMessage();
        appEditResponseMessage.setType(DialogueMessageTypeEnum.INFO.getValue());
        String message = String.format("%s加入编辑", user.getUserName());
        appEditResponseMessage.setMessage(message);
        appEditResponseMessage.setUser(userService.getUserVO(user));
        
        // 获取在线用户列表
        List<UserVO> onlineUsersList = getOnlineUsers(appId);
        appEditResponseMessage.setOnlineUsers(onlineUsersList);
        
        log.info("用户 {} 加入应用 {}，当前在线用户数: {}", user.getUserName(), appId, onlineUsersList.size());
        
        TextMessage textMessage = getTextMessage(appEditResponseMessage);
        log.info("发送消息内容: {}", textMessage.getPayload());

        // 向所有连接到该应用的用户广播"用户加入"消息
        broadcastToApp(appId, textMessage);

        // 向新加入的用户发送该应用的历史编辑记录
        broadcastToOneUser(appId, appEditRecodes.get(appId), session);
    }

    /**
     * 接收到客户端消息后的回调方法
     * 
     * 消息类型：
     * - ENTER_EDIT: 请求进入编辑状态
     * - EDIT_ACTION: 执行编辑操作
     * - EXIT_EDIT: 退出编辑状态
     * 
     * @param session WebSocket 会话对象
     * @param message 客户端发送的消息
     * @throws Exception 异常
     */
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        // 将消息解析为 PictureEditMessage
        DialogueRequestMessage appEditRequestMessage = JSONUtil.toBean(message.getPayload(), DialogueRequestMessage.class);
        // 从 Session 属性中获取公共参数
        Map<String, Object> attributes = session.getAttributes();
        User user = (User) attributes.get("user");
        Long appId = (Long) attributes.get("appId");
        log.info("客户端消息 = {}", message);
        // 生产消息
        appEditEventProducer.publishEvent(appEditRequestMessage, session, user, appId);
    }

    /**
     * 处理"进入编辑"请求
     * 
     * 业务逻辑：
     * 1. 检查该应用是否已有用户在编辑
     * 2. 如果没有，则将当前用户设置为编辑者
     * 3. 如果有其他用户在编辑，则返回错误消息
     * 
     * @param appEditContext 编辑上下文对象
     * @throws Exception 异常
     */
    public void handleEnterEditMessage(AppEditContext appEditContext) throws Exception {
        User user = appEditContext.getUser();
        Long appId = appEditContext.getAppId();

        // 检查该应用是否已有用户在编辑
        if (!appEditingUsers.containsKey(appId)) {
            // 没有用户在编辑，将当前用户设置为编辑者
            appEditingUsers.put(appId, user.getId());

            // 构造"开始编辑"的消息
            DialogueResponseMessage appEditResponseMessage = new DialogueResponseMessage();
            appEditResponseMessage.setType(DialogueMessageTypeEnum.ENTER_EDIT.getValue());
            String message = String.format("%s开始编辑应用", user.getUserName());
            appEditResponseMessage.setMessage(message);
            appEditResponseMessage.setUser(userService.getUserVO(user));
            TextMessage textMessage = getTextMessage(appEditResponseMessage);

            // 向所有用户广播"开始编辑"消息
            broadcastToApp(appId, textMessage);
        }

        // 如果当前用户不是编辑者，则发送错误消息
        if (!Objects.equals(appEditingUsers.get(appId), user.getId())) {
            handleEditErrorMessage(user, appId, appEditContext.getSession());
        }
    }

    /**
     * 处理编辑错误消息
     * 
     * 业务逻辑：
     * 1. 获取当前正在编辑的用户信息
     * 2. 向请求用户发送错误消息，告知谁正在编辑
     * 
     * @param user 请求编辑的用户
     * @param appId 应用ID
     * @param sendSession 请求用户的会话
     * @throws Exception 异常
     */
    private void handleEditErrorMessage(User user, Long appId, WebSocketSession sendSession) throws Exception {
        // 获取当前正在编辑的用户ID
        Long editUserId = appEditingUsers.get(appId);
        User editUser = userDAO.selectOneById(editUserId);

        // 构造错误消息
        DialogueResponseMessage appEditResponseMessage = new DialogueResponseMessage();
        appEditResponseMessage.setType(DialogueMessageTypeEnum.ERROR.getValue());
        appEditResponseMessage.setMessage(String.format("操作失败 %s 正在操作", editUser.getUserName()));
        appEditResponseMessage.setUser(userService.getUserVO(user));

        // 只向请求用户发送错误消息
        broadcastToOneUser(appId, Collections.singletonList(getTextMessage(appEditResponseMessage)), sendSession);
    }

    /**
     * 处理编辑操作
     * 
     * 业务逻辑：
     * 1. 验证当前用户是否是编辑者
     * 2. 如果是，则执行编辑操作并广播给其他用户
     * 3. 将编辑操作保存到历史记录中
     * 
     * @param appEditContext 编辑上下文对象
     * @throws Exception 异常
     */
    public void handleEditActionMessage(AppEditContext appEditContext) throws Exception {
        DialogueRequestMessage appEditRequestMessage = appEditContext.getRequestMessage();
        WebSocketSession session = appEditContext.getSession();
        User user = appEditContext.getUser();
        Long appId = appEditContext.getAppId();
        Long editingUserId = appEditingUsers.get(appId);
        String editAction = appEditRequestMessage.getEditAction();
        EditActionEnum actionEnum = EditActionEnum.getEnumByValue(editAction);

        // 编辑操作类型无效，直接返回
        if (actionEnum == null) {
            return;
        }

        // 验证当前用户是否是编辑者
        if (editingUserId != null && editingUserId.equals(user.getId())) {
            // 构造编辑操作消息
            DialogueResponseMessage appEditResponseMessage = new DialogueResponseMessage();
            appEditResponseMessage.setType(DialogueMessageTypeEnum.EDIT_ACTION.getValue());
            String message = String.format("%s执行%s", user.getUserName(), actionEnum.getText());
            appEditResponseMessage.setMessage(message);
            appEditResponseMessage.setEditAction(editAction);
            appEditResponseMessage.setUser(userService.getUserVO(user));
            TextMessage textMessage = getTextMessage(appEditResponseMessage);

            // 向除了当前编辑者之外的所有用户广播编辑操作
            // 注意：不发送给编辑者自己，否则会造成重复编辑
            broadcastToApp(appId, textMessage, session);

            // 将编辑操作保存到历史记录中，供新加入的用户查看
            DialogueResponseMessage saveDialogueResponseMessage = new DialogueResponseMessage();
            saveDialogueResponseMessage.setType(DialogueMessageTypeEnum.EDIT_ACTION.getValue());
            saveDialogueResponseMessage.setEditAction(editAction);

            // 获取该应用的历史记录列表，如果没有则创建
            List<TextMessage> list = appEditRecodes.computeIfAbsent(appId, k -> new ArrayList<>());
            // 将新的编辑操作添加到历史记录中
            list.add(getTextMessage(saveDialogueResponseMessage));
        }
    }

    /**
     * 处理退出编辑
     * 
     * 业务逻辑：
     * 1. 如果当前用户是编辑者，则退出编辑状态
     * 2. 向所有用户广播"退出编辑"消息
     * 3. 移除该用户的会话
     * 4. 如果该应用没有用户连接了，则清理历史记录
     * 
     * @param appEditContext 编辑上下文对象
     */
    public void handleExitEditMessage(AppEditContext appEditContext) {
        Long appId = null;
        try {
            User user = appEditContext.getUser();
            appId = appEditContext.getAppId();
            Long editingUserId = appEditingUsers.get(appId);

            // 检查当前用户是否是编辑者
            if (editingUserId != null && editingUserId.equals(user.getId())) {
                // 构造"退出编辑"消息
                DialogueResponseMessage appEditResponseMessage = new DialogueResponseMessage();
                appEditResponseMessage.setType(DialogueMessageTypeEnum.EXIT_EDIT.getValue());
                String message = String.format("%s退出编辑应用", user.getUserName());
                appEditResponseMessage.setMessage(message);
                appEditResponseMessage.setUser(userService.getUserVO(user));
                TextMessage textMessage = getTextMessage(appEditResponseMessage);

                // 向所有用户广播"退出编辑"消息
                broadcastToApp(appId, textMessage);

                // 移除该应用的编辑状态
                appEditingUsers.remove(appId);
            }

            // 从会话集合中移除该用户的会话
            appSessions.get(appId).remove(appEditContext.getSession());

        } catch (Exception e) {
            log.error("AppEditHandler#handleExitEditMessage {}", ExceptionUtils.getRootCauseMessage(e));
            throw new RuntimeException(e);
        } finally {
            // 如果该应用没有用户连接了，则清理历史记录，防止内存泄露
            if (appSessions.get(appId).isEmpty()) {
                appEditRecodes.remove(appId);
            }
        }
    }

    /**
     * 向应用的所有用户广播消息
     * 
     * @param appId 应用ID
     * @param textMessage 要广播的消息
     * @param excludeSession 要排除的会话（不向该会话发送消息）
     * @throws Exception 异常
     */
    private void broadcastToApp(Long appId, TextMessage textMessage, WebSocketSession excludeSession) throws Exception {
        //获取当前应用中的所有会话组
        Set<WebSocketSession> sessionSet = appSessions.get(appId);
        if (CollUtil.isNotEmpty(sessionSet)) {
            for (WebSocketSession session : sessionSet) {
                // 跳过要排除的会话
                if (excludeSession != null && excludeSession.equals(session)) {
                    continue;
                }
                // 只向打开的会话发送消息
                if (session.isOpen()) {
                    session.sendMessage(textMessage);
                }
            }
        }
    }

    /**
     * 将响应消息转换为 WebSocket 文本消息
     * 
     * @param appEditResponseMessage 响应消息对象
     * @return WebSocket 文本消息
     * @throws JsonProcessingException JSON 序列化异常
     */
    private TextMessage getTextMessage(DialogueResponseMessage appEditResponseMessage) throws JsonProcessingException {
        // 将响应对象序列化为 JSON 字符串
        String message = objectMapper.writeValueAsString(appEditResponseMessage);
        return new TextMessage(message);
    }

    /**
     * 向应用的所有用户广播消息（不排除任何会话）
     * 
     * @param appId 应用ID
     * @param textMessage 要广播的消息
     * @throws Exception 异常
     */
    private void broadcastToApp(Long appId, TextMessage textMessage) throws Exception {
        broadcastToApp(appId, textMessage, null);
    }

    /**
     * 向指定用户发送消息
     * 
     * @param appId 应用ID
     * @param textMessages 要发送的消息列表
     * @param sendSession 目标用户的会话
     * @throws Exception 异常
     */
    private void broadcastToOneUser(Long appId, List<TextMessage> textMessages, WebSocketSession sendSession) throws Exception {
        Set<WebSocketSession> sessionSet = appSessions.get(appId);
        if (CollUtil.isNotEmpty(sessionSet)) {
            // 消息列表为空，直接返回
            if (Objects.isNull(textMessages) || textMessages.isEmpty()) {
                return;
            }

            // 遍历所有消息，发送给目标用户
            textMessages.forEach(textMessage -> {
                for (WebSocketSession session : sessionSet) {
                    // 只向目标用户发送消息
                    if (session.isOpen() && session.equals(sendSession)) {
                        try {
                            session.sendMessage(textMessage);
                        } catch (IOException e) {
                            log.error("AppEditHandler#broadcastToOneUser {}", ExceptionUtils.getRootCauseMessage(e));
                            throw new RuntimeException(e);
                        }
                    }
                }
            });
        }
    }

    /**
     * 获取在线用户列表
     * 
     * @param appId 应用ID
     * @return 在线用户列表
     */
    private List<UserVO> getOnlineUsers(Long appId) {
        Set<WebSocketSession> sessionSet = appSessions.get(appId);
        if (CollUtil.isEmpty(sessionSet)) {
            return new ArrayList<>();
        }

        List<UserVO> onlineUsersList = new ArrayList<>();
        for (WebSocketSession session : sessionSet) {
            if (session.isOpen()) {
                User user = (User) session.getAttributes().get("user");
                if (user != null) {
                    onlineUsersList.add(userService.getUserVO(user));
                }
            }
        }
        return onlineUsersList;
    }

    /**
     * 处理发送消息
     * 
     * @param appEditContext 编辑上下文对象
     * @throws Exception 异常
     */
    public void handleSendMessage(AppEditContext appEditContext) throws Exception {
        User user = appEditContext.getUser();
        Long appId = appEditContext.getAppId();
        DialogueRequestMessage requestMessage = appEditContext.getRequestMessage();

        // 构造发送消息
        DialogueResponseMessage appEditResponseMessage = new DialogueResponseMessage();
        appEditResponseMessage.setType(DialogueMessageTypeEnum.SEND_MESSAGE.getValue());
        appEditResponseMessage.setMessage(requestMessage.getMessage());
        appEditResponseMessage.setUser(userService.getUserVO(user));
        TextMessage textMessage = getTextMessage(appEditResponseMessage);

        log.info("用户 {} 发送消息: {}", user.getUserName(), requestMessage.getMessage());

        // 向所有用户广播
        broadcastToApp(appId, textMessage);
    }

    /**
     * 处理触摸元素
     * 
     * @param appEditContext 编辑上下文对象
     * @throws Exception 异常
     */
    public void handleHoverElement(AppEditContext appEditContext) throws Exception {
        User user = appEditContext.getUser();
        Long appId = appEditContext.getAppId();
        DialogueRequestMessage requestMessage = appEditContext.getRequestMessage();

        // 构造触摸元素消息
        DialogueResponseMessage appEditResponseMessage = new DialogueResponseMessage();
        appEditResponseMessage.setType(DialogueMessageTypeEnum.HOVER_ELEMENT.getValue());
        String message = String.format("%s触摸元素", user.getUserName());
        appEditResponseMessage.setMessage(message);
        appEditResponseMessage.setUser(userService.getUserVO(user));
        appEditResponseMessage.setElement(requestMessage.getElement());
        TextMessage textMessage = getTextMessage(appEditResponseMessage);
        log.info("触摸广播 = {}",  textMessage);
        // 向所有用户广播
        broadcastToApp(appId, textMessage);
    }

    /**
     * 处理选择元素
     * 
     * @param appEditContext 编辑上下文对象
     * @throws Exception 异常
     */
    public void handleSelectElement(AppEditContext appEditContext) throws Exception {
        User user = appEditContext.getUser();
        Long appId = appEditContext.getAppId();
        DialogueRequestMessage requestMessage = appEditContext.getRequestMessage();

        // 构造选择元素消息
        DialogueResponseMessage appEditResponseMessage = new DialogueResponseMessage();
        appEditResponseMessage.setType(DialogueMessageTypeEnum.SELECT_ELEMENT.getValue());
        String message = String.format("%s选择元素", user.getUserName());
        appEditResponseMessage.setMessage(message);
        appEditResponseMessage.setUser(userService.getUserVO(user));
        appEditResponseMessage.setElement(requestMessage.getElement());
        TextMessage textMessage = getTextMessage(appEditResponseMessage);

        // 向所有用户广播
        broadcastToApp(appId, textMessage);
    }

    /**
     * 处理清除元素
     * 
     * @param appEditContext 编辑上下文对象
     * @throws Exception 异常
     */
    public void handleClearElement(AppEditContext appEditContext) throws Exception {
        User user = appEditContext.getUser();
        Long appId = appEditContext.getAppId();
        DialogueRequestMessage requestMessage = appEditContext.getRequestMessage();

        // 构造清除元素消息
        DialogueResponseMessage appEditResponseMessage = new DialogueResponseMessage();
        appEditResponseMessage.setType(DialogueMessageTypeEnum.CLEAR_ELEMENT.getValue());
        String message = String.format("%s清除元素", user.getUserName());
        appEditResponseMessage.setMessage(message);
        appEditResponseMessage.setUser(userService.getUserVO(user));
        appEditResponseMessage.setElement(requestMessage.getElement());
        TextMessage textMessage = getTextMessage(appEditResponseMessage);

        // 向所有用户广播
        broadcastToApp(appId, textMessage);
    }

    /**
     * 处理部署项目
     * 
     * @param appEditContext 编辑上下文对象
     * @throws Exception 异常
     */
    public void handleDeployProject(AppEditContext appEditContext) throws Exception {
        User user = appEditContext.getUser();
        Long appId = appEditContext.getAppId();

        // 构造部署项目消息
        DialogueResponseMessage appEditResponseMessage = new DialogueResponseMessage();
        appEditResponseMessage.setType(DialogueMessageTypeEnum.DEPLOY_PROJECT.getValue());
        String message = String.format("%s部署项目", user.getUserName());
        appEditResponseMessage.setMessage(message);
        appEditResponseMessage.setUser(userService.getUserVO(user));
        TextMessage textMessage = getTextMessage(appEditResponseMessage);

        // 向所有用户广播
        broadcastToApp(appId, textMessage);
    }

    /**
     * 处理停止回复
     * 
     * @param appEditContext 编辑上下文对象
     * @throws Exception 异常
     */
    public void handleStopResponse(AppEditContext appEditContext) throws Exception {
        User user = appEditContext.getUser();
        Long appId = appEditContext.getAppId();

        // 构造停止回复消息
        DialogueResponseMessage appEditResponseMessage = new DialogueResponseMessage();
        appEditResponseMessage.setType(DialogueMessageTypeEnum.STOP_RESPONSE.getValue());
        String message = String.format("%s停止回复", user.getUserName());
        appEditResponseMessage.setMessage(message);
        appEditResponseMessage.setUser(userService.getUserVO(user));
        TextMessage textMessage = getTextMessage(appEditResponseMessage);

        // 向所有用户广播
        broadcastToApp(appId, textMessage);
    }

    /**
     * 编辑上下文对象
     * 用于封装编辑操作所需的参数
     */
    @Data
    @AllArgsConstructor
    public static class AppEditContext {
        private DialogueRequestMessage requestMessage;
        private WebSocketSession session;
        private User user;
        private Long appId;
    }
}
