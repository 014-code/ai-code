package com.mashang.aicode.web.model.dto.chat;

import com.mashang.aicode.web.common.PageRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 对话历史查询请求
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class ChatHistoryQueryRequest extends PageRequest implements Serializable {


    private Long id;


    private String message;


    private String messageType;


    private Long appId;


    private Long userId;

    /**
     * 时间游标
     */
    private LocalDateTime lastCreateTime;

    private static final long serialVersionUID = 1L;
}

