package com.mashang.aicode.web.service;

import com.mashang.aicode.web.model.entity.PointsRecord;
import com.mashang.aicode.web.model.entity.User;

import java.util.List;

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

    /**
     * 发送积分异常告警邮件
     *
     * @param toEmail           收件人邮箱
     * @param inconsistentUsers 异常用户列表
     * @param totalCount        异常总数
     */
    void sendPointsAlertEmail(String toEmail, List<InconsistentUserInfo> inconsistentUsers, int totalCount);

    /**
     * 异常用户信息
     */
    record InconsistentUserInfo(
            Long userId,
            String userAccount,
            String userName,
            Integer accountBalance,
            Integer calculatedBalance,
            Integer difference,
            List<PointsRecord> recentChanges
    ) {}
}
