package com.mashang.aicode.web.service.impl;

import cn.hutool.core.util.RandomUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mashang.aicode.web.exception.BusinessException;
import com.mashang.aicode.web.exception.ErrorCode;
import com.mashang.aicode.web.mapper.EmailVerificationCodeMapper;
import com.mashang.aicode.web.model.entity.EmailVerificationCode;
import com.mashang.aicode.web.service.EmailService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Date;

/**
 * 邮件服务实现类
 *
 * @author vasc-language
 */
@Slf4j
@Service
public class EmailServiceImpl extends ServiceImpl<EmailVerificationCodeMapper, EmailVerificationCode> implements EmailService {

    @Resource
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * 验证码有效期(分钟)
     */
    private static final int CODE_EXPIRE_MINUTES = 5;

    /**
     * 发送频率限制(秒)
     */
    private static final int SEND_INTERVAL_SECONDS = 60;

    @Override
    public boolean sendVerificationCode(String email, String type) {
        // 1. 校验参数
        if (StrUtil.hasBlank(email, type)) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }

        // 2. 检查发送频率(60秒内不能重复发送)
        Date limitTime = new Date(System.currentTimeMillis() - SEND_INTERVAL_SECONDS * 1000L);
        QueryWrapper<EmailVerificationCode> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("email", email);
        queryWrapper.eq("type", type);
        queryWrapper.ge("createTime", limitTime);
        queryWrapper.orderByDesc("createTime");
        queryWrapper.last("LIMIT 1");

        EmailVerificationCode recentCode = getOne(queryWrapper);
        if (recentCode != null) {
            throw new BusinessException(ErrorCode.EMAIL_SEND_FREQUENT);
        }

        // 3. 生成6位数字验证码
        String code = RandomUtil.randomNumbers(6);

        // 4. 保存到数据库
        EmailVerificationCode verificationCode = new EmailVerificationCode();
        verificationCode.setEmail(email);
        verificationCode.setCode(code);
        verificationCode.setType(type);
        verificationCode.setExpireTime(new Date(System.currentTimeMillis() + CODE_EXPIRE_MINUTES * 60 * 1000L));
        verificationCode.setVerified(0);
        save(verificationCode);

        // 5. 发送邮件
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("【014AICode 官网】验证码");
            message.setText(buildEmailContent(code, type));

            mailSender.send(message);
            log.info("验证码邮件发送成功: email={}, type={}", email, type);
            return true;
        } catch (Exception e) {
            log.error("验证码邮件发送失败: email={}, type={}", email, type, e);
            throw new BusinessException(ErrorCode.EMAIL_SEND_ERROR, e.getMessage());
        }
    }

    @Override
    public boolean verifyCode(String email, String code, String type) {
        // 1. 校验参数
        if (StrUtil.hasBlank(email, code, type)) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }

        // 2. 查询验证码
        QueryWrapper<EmailVerificationCode> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("email", email);
        queryWrapper.eq("code", code);
        queryWrapper.eq("type", type);
        queryWrapper.eq("verified", 0);
        queryWrapper.ge("expireTime", new Date());
        queryWrapper.orderByDesc("createTime");
        queryWrapper.last("LIMIT 1");

        EmailVerificationCode verificationCode = getOne(queryWrapper);

        // 3. 验证码不存在或已过期
        if (verificationCode == null) {
            return false;
        }

        // 4. 标记为已使用
        verificationCode.setVerified(1);
        updateById(verificationCode);

        log.info("验证码验证成功: email={}, type={}", email, type);
        return true;
    }

    @Override
    public int cleanExpiredCodes() {
        QueryWrapper<EmailVerificationCode> queryWrapper = new QueryWrapper<>();
        queryWrapper.lt("expireTime", new Date());

        int count = Math.toIntExact(count(queryWrapper));
        remove(queryWrapper);
        log.info("清理过期验证码: count={}", count);
        return count;
    }

    /**
     * 构建邮件内容
     *
     * @param code 验证码
     * @param type 验证码类型
     * @return 邮件内容
     */
    private String buildEmailContent(String code, String type) {
        String purpose = switch (type) {
            case "REGISTER" -> "注册账号";
            case "LOGIN" -> "登录验证";
            default -> "身份验证";
        };

        return String.format("""
                        尊敬的用户你好 ( ^_^ )ノ
                        
                        感谢你信任 014AiCode！
                        当前正在进行的操作类型是:【%s】
                        
                        你的验证码为:%s
                        
                        验证码有效期为%d分钟,请妥善保管,不要分享给他人。
                        
                        想进一步了解我们,欢迎访问:
                        
                        GitHub 项目: `https://github.com/014-code/ai-code/tree/master`
                        
                        如非本人操作,请忽略此邮件,我们一直在守护你的安全 \\(^_^)/
                        
                        ---
                        014AiCode 团队
                        """,
                purpose, code, CODE_EXPIRE_MINUTES);
    }
}
