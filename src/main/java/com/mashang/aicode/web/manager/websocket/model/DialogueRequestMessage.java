package com.mashang.aicode.web.manager.websocket.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 协同对话请求消息类
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DialogueRequestMessage {

    /**
     * 消息类型，例如 "ENTER_EDIT", "EXIT_EDIT", "EDIT_ACTION"
     */
    private String type;

    /**
     * 执行的编辑动作
     */
    private String editAction;

    /**
     * 消息内容
     */
    private String message;

    /**
     * 元素信息（用于协同编辑）
     */
    private Object element;
}
