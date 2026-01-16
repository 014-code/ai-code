package com.mashang.aicode.web.manager.websocket.model;

import com.mashang.aicode.web.model.vo.UserVO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DialogueResponseMessage {

    /**
     * 消息类型，例如 "INFO", "ERROR", "ENTER_EDIT", "EXIT_EDIT", "EDIT_ACTION"
     */
    private String type;

    /**
     * 信息
     */
    private String message;

    /**
     * 执行的编辑动作
     */
    private String editAction;

    /**
     * 用户信息
     */
    private UserVO user;

    /**
     * 在线用户列表
     */
    private List<UserVO> onlineUsers;

    /**
     * 元素信息（用于协同编辑）
     */
    private Object element;
}
