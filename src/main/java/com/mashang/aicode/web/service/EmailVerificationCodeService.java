package com.mashang.aicode.web.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.mashang.aicode.web.model.entity.EmailVerificationCode;

public interface EmailVerificationCodeService extends IService<EmailVerificationCode> {

    EmailVerificationCode getLatestValidCode(String email, String type);

    boolean verifyCode(String email, String code, String type);

    void markAsUsed(Long id);
}
