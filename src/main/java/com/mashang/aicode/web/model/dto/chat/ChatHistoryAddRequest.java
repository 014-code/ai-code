package com.mashang.aicode.web.model.dto.chat;

import lombok.Data;

import java.io.Serializable;

/**
 * 对话历史添加请求
 */
@Data
public class ChatHistoryAddRequest implements Serializable {

    /**
     * 应用id
     */
    private Long appId;

    /**
     * 消息类型：user/ai/error
     */
    private String messageType;

    /**
     * 消息内容
     */
    private String messageContent;

    /**
     * 错误信息（仅当messageType为error时有效）
     */
    private String errorInfo;

    private static final long serialVersionUID = 1L;
}