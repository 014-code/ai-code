package com.mashang.aicode.web.model.dto.user;

import lombok.Data;

import java.io.Serializable;

/**
 * 用户注册请求
 *
 * @author vasc-language
 */
@Data
public class UserRegisterRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 账号
     */
    private String userAccount;

    /**
     * 密码
     */
    private String userPassword;

    /**
     * 确认密码
     */
    private String checkPassword;

    /**
     * 用户邮箱
     */
    private String userEmail;

    /**
     * 邮箱验证码
     */
    private String emailCode;

    /**
     * 邀请码
     */
    private String inviteCode;
}
