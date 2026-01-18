package com.mashang.aicode.web.model.dto.user;

import lombok.Data;

import java.io.Serializable;

/**
 * 发送邮箱验证码请求
 *
 * @author vasc-language
 */
@Data
public class SendEmailCodeRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 邮箱地址
     */
    private String email;

    /**
     * 验证码类型：REGISTER-注册，RESET_PASSWORD-重置密码，LOGIN-登录验证
     */
    private String type;
}
