package com.mashang.aicode.web.model.dto.user;

import lombok.Data;

import java.io.Serializable;

/**
 * 用户修改头像请求
 */
@Data
public class UserUpdateAvatarRequest implements Serializable {

    /**
     * 用户头像URL
     */
    private String userAvatar;

    private static final long serialVersionUID = 1L;
}
