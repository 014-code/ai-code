package com.mashang.aicode.web.service.impl;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mashang.aicode.web.mapper.EmailVerificationCodeMapper;
import com.mashang.aicode.web.model.entity.EmailVerificationCode;
import com.mashang.aicode.web.service.EmailVerificationCodeService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Date;

@Slf4j
@Service
public class EmailVerificationCodeServiceImpl extends ServiceImpl<EmailVerificationCodeMapper, EmailVerificationCode> implements EmailVerificationCodeService {

    @Override
    public EmailVerificationCode getLatestValidCode(String email, String type) {
        QueryWrapper<EmailVerificationCode> wrapper = new QueryWrapper<>();
        wrapper.eq("email", email);
        wrapper.eq("type", type);
        wrapper.eq("verified", 0);
        wrapper.eq("isDelete", 0);
        wrapper.gt("expireTime", new Date());
        wrapper.orderByDesc("createTime");
        wrapper.last("LIMIT 1");
        return getOne(wrapper);
    }

    @Override
    public boolean verifyCode(String email, String code, String type) {
        QueryWrapper<EmailVerificationCode> wrapper = new QueryWrapper<>();
        wrapper.eq("email", email);
        wrapper.eq("code", code);
        wrapper.eq("type", type);
        wrapper.eq("verified", 0);
        wrapper.eq("isDelete", 0);
        wrapper.gt("expireTime", new Date());
        EmailVerificationCode verificationCode = getOne(wrapper);
        if (verificationCode != null) {
            markAsUsed(verificationCode.getId());
            return true;
        }
        return false;
    }

    @Override
    public void markAsUsed(Long id) {
        EmailVerificationCode code = new EmailVerificationCode();
        code.setId(id);
        code.setVerified(1);
        updateById(code);
    }
}
