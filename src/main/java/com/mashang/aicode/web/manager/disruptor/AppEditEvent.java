package com.mashang.aicode.web.manager.disruptor;

import com.mashang.aicode.web.manager.websocket.model.DialogueRequestMessage;
import com.mashang.aicode.web.model.entity.User;
import lombok.Data;
import org.springframework.web.socket.WebSocketSession;

@Data
public class AppEditEvent {

    /**
     * 消息
     */
    private DialogueRequestMessage pictureEditRequestMessage;

    /**
     * 当前用户的 session
     */
    private WebSocketSession session;

    /**
     * 当前用户
     */
    private User user;

    /**
     * app id
     */
    private Long appId;

}
