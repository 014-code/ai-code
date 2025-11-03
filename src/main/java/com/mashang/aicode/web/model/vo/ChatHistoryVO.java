package com.mashang.aicode.web.model.vo;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 对话历史视图对象
 */
@Data
public class ChatHistoryVO implements Serializable {

    /**
     * id
     */
    private Long id;

    /**
     * 应用id
     */
    private Long appId;

    /**
     * 用户id
     */
    private Long userId;

    /**
     * 消息类型：user/ai/error
     */
    private String messageType;

    /**
     * 消息类型描述
     */
    private String messageTypeDesc;

    /**
     * 消息内容
     */
    private String messageContent;

    /**
     * 错误信息（仅当messageType为error时有效）
     */
    private String errorInfo;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;

    /**
     * 用户信息
     */
    private UserVO user;

    /**
     * 应用信息
     */
    private AppVO app;

    private static final long serialVersionUID = 1L;
}