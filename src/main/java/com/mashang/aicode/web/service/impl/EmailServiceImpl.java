package com.mashang.aicode.web.service.impl;

import cn.hutool.core.util.RandomUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mashang.aicode.web.exception.BusinessException;
import com.mashang.aicode.web.exception.ErrorCode;
import com.mashang.aicode.web.mapper.EmailVerificationCodeMapper;
import com.mashang.aicode.web.model.entity.EmailVerificationCode;
import com.mashang.aicode.web.model.entity.PointsRecord;
import com.mashang.aicode.web.service.EmailService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.List;

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

    /**
     * 发送积分数据一致性异常告警邮件
     *
     * @param toEmail         接收人邮箱
     * @param inconsistentUsers 异常用户列表
     * @param totalCount      异常用户总数
     */ 
    @Override
    public void sendPointsAlertEmail(String toEmail, List<InconsistentUserInfo> inconsistentUsers, int totalCount) {
        if (StrUtil.hasBlank(toEmail) || inconsistentUsers == null || inconsistentUsers.isEmpty()) {
            log.warn("积分告警邮件发送参数无效");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("【014AiCode 告警】积分数据一致性异常");
            message.setText(buildPointsAlertEmailContent(inconsistentUsers, totalCount));

            mailSender.send(message);
            log.info("积分异常告警邮件发送成功: toEmail={}, 异常用户数={}", toEmail, totalCount);
        } catch (Exception e) {
            log.error("积分异常告警邮件发送失败: toEmail={}", toEmail, e);
        }
    }

    private String buildPointsAlertEmailContent(List<InconsistentUserInfo> users, int totalCount) {
        StringBuilder sb = new StringBuilder();
        sb.append("尊敬的管理员你好 ( ^_^ )ノ\n\n");
        sb.append("【014AiCode 积分系统告警】\n\n");
        sb.append("系统检测到积分数据存在不一致的用户共计 ").append(totalCount).append(" 人，请及时处理。\n\n");
        sb.append("━━━━━━━━━━━━━━━━━━━━━━━━\n");
        sb.append("异常用户详情\n");
        sb.append("━━━━━━━━━━━━━━━━━━━━━━━━\n\n");

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        for (int i = 0; i < users.size(); i++) {
            InconsistentUserInfo user = users.get(i);
            sb.append("【用户 ").append(i + 1).append("】\n");
            sb.append("  用户ID: ").append(user.userId()).append("\n");
            sb.append("  账号: ").append(user.userAccount()).append("\n");
            sb.append("  昵称: ").append(user.userName()).append("\n");
            sb.append("  账户显示积分: ").append(user.accountBalance()).append("\n");
            sb.append("  计算实际积分: ").append(user.calculatedBalance()).append("\n");
            sb.append("  差异: ").append(user.difference() > 0 ? "+" : "").append(user.difference()).append("\n");
            sb.append("\n  最近积分变动记录:\n");

            if (user.recentChanges() != null && !user.recentChanges().isEmpty()) {
                for (PointsRecord record : user.recentChanges()) {
                    String typeDesc = getPointsTypeDescription(record.getType());
                    String statusDesc = getPointsStatusDescription(record.getStatus());
                    sb.append("    - ").append(record.getCreateTime().format(formatter))
                            .append(" | ").append(typeDesc)
                            .append(" | 变动: ").append(record.getPoints() > 0 ? "+" : "").append(record.getPoints())
                            .append(" | 余额: ").append(record.getBalance())
                            .append(" | 状态: ").append(statusDesc).append("\n");
                }
            } else {
                sb.append("    (无变动记录)\n");
            }
            sb.append("\n");
        }

        sb.append("━━━━━━━━━━━━━━━━━━━━━━━━\n\n");
        sb.append("请登录管理后台检查并修复以上异常。\n\n");
        sb.append("如非本人操作,请忽略此邮件。\n\n");
        sb.append("---\n");
        sb.append("014AiCode 系统自动发送\n");

        return sb.toString();
    }

    private String getPointsTypeDescription(String type) {
        if (type == null) return "未知类型";
        return switch (type) {
            case "REGISTER" -> "注册奖励";
            case "LOGIN" -> "登录奖励";
            case "INVITE" -> "邀请奖励";
            case "GENERATE" -> "生成应用奖励";
            case "CONSUME" -> "消费扣减";
            case "EXPIRE" -> "积分过期";
            case "ADMIN_ADD" -> "管理员调整";
            case "EXPIRE_REMINDER" -> "过期提醒";
            default -> type;
        };
    }

    private String getPointsStatusDescription(String status) {
        if (status == null) return "未知状态";
        return switch (status) {
            case "ACTIVE" -> "有效";
            case "PARTIAL_CONSUMED" -> "部分消耗";
            case "CONSUMED" -> "已消耗";
            case "EXPIRED" -> "已过期";
            default -> status;
        };
    }
}
