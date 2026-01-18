package com.mashang.aicode.web.service;

/**
 * 邮件服务接口
 *
 * @author vasc-language
 */
public interface EmailService {

    /**
     * 发送邮箱验证码
     *
     * @param email 邮箱地址
     * @param type  验证码类型：REGISTER-注册，RESET_PASSWORD-重置密码，LOGIN-登录验证
     * @return 是否发送成功
     */
    boolean sendVerificationCode(String email, String type);

    /**
     * 验证邮箱验证码
     *
     * @param email 邮箱地址
     * @param code  验证码
     * @param type  验证码类型
     * @return 是否验证成功
     */
    boolean verifyCode(String email, String code, String type);

    /**
     * 清理过期的验证码
     *
     * @return 清理的记录数
     */
    int cleanExpiredCodes();
}
