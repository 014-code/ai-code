package com.mashang.aicode.web.model.dto.user;

import lombok.Data;

import java.io.Serializable;

/**
 * 绑定邀请码请求
 */
@Data
public class BindInviteCodeRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 邀请码
     */
    private String inviteCode;
}
