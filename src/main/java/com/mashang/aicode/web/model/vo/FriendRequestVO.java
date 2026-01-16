package com.mashang.aicode.web.model.vo;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Date;

/**
 * 好友请求VO
 */
@Data
public class FriendRequestVO {

    /**
     * 请求ID
     */
    private Long id;

    /**
     * 请求方用户信息
     */
    private UserVO requester;

    /**
     * 请求消息
     */
    private String message;

    /**
     * 请求状态：PENDING（待处理）、ACCEPTED（已接受）、REJECTED（已拒绝）
     */
    private String status;

    /**
     * 创建时间
     */
    private Date createTime;
}