package com.mashang.aicode.web.model.dto.friend;

import lombok.Data;

/**
 * 发送好友请求DTO
 */
@Data
public class FriendRequestSendDTO {

    /**
     * 接收方用户ID
     */
    private Long addresseeId;

    /**
     * 请求消息
     */
    private String message;
}