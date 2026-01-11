package com.mashang.aicode.web.model.dto.user;

import lombok.Data;

import java.io.Serializable;

/**
 * 用户修改信息请求
 */
@Data
public class UserUpdateInfoRequest implements Serializable {

    /**
     * 用户昵称
     */
    private String userName;

    /**
     * 用户简介
     */
    private String userProfile;

    private static final long serialVersionUID = 1L;
}
