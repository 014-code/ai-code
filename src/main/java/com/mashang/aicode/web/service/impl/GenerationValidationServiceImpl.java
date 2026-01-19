package com.mashang.aicode.web.service.impl;

import cn.hutool.core.util.StrUtil;
import cn.hutool.crypto.digest.DigestUtil;
import com.mashang.aicode.web.constant.AppConstant;
import com.mashang.aicode.web.constant.UserConstant;
import com.mashang.aicode.web.model.entity.User;
import com.mashang.aicode.web.model.enums.PointsTypeEnum;
import com.mashang.aicode.web.monitor.PointsMetricsCollector;
import com.mashang.aicode.web.service.GenerationValidationService;
import com.mashang.aicode.web.service.UserPointService;
import com.mashang.aicode.web.service.UserService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

/**
 * 生成验证服务实现类
 */
@Service
@Slf4j
public class GenerationValidationServiceImpl implements GenerationValidationService {

    @Resource
    private StringRedisTemplate stringRedisTemplate;

    @Resource
    private UserPointService userPointsService;

    @Resource
    private PointsMetricsCollector pointsMetricsCollector;

    @Resource
    private UserService userService;

    // Redis key前缀
    private static final String KEY_WARNING_COUNT = "generation:warning:count:"; // 每日警告次数
    private static final String KEY_GENERATION_HASH = "generation:hash:"; // 24小时内生成记录
    private static final String KEY_BAN_FLAG = "generation:ban:"; // 禁止生成标记
    private static final String KEY_TOKEN_USAGE = "generation:token:usage:"; // 每日Token消耗
    private static final String KEY_GENERATION_COUNT = "generation:count:"; // 每日生成次数

    // 配置常量
    private static final int MAX_WARNINGS_PER_DAY = 3; // 每日最大警告次数
    private static final int PUNISHMENT_POINTS = 10; // 惩罚扣除积分
    private static final int MIN_CONTENT_LENGTH = 100; // 最小有效内容长度
    private static final int MAX_TOKENS_PER_DAY = 120000; // 每日最大Token消耗（12万）
    private static final int MAX_GENERATIONS_PER_DAY = 30; // 每日最大生成次数

    @Override
    public boolean isUserBannedToday(Long userId) {
        String key = KEY_BAN_FLAG + LocalDate.now() + ":" + userId;
        String value = stringRedisTemplate.opsForValue().get(key);
        return "1".equals(value);
    }

    @Override
    public boolean isDuplicateGeneration(Long userId, String message) {
        if (StrUtil.isBlank(message)) {
            return false;
        }
        String messageHash = DigestUtil.md5Hex(message.trim());
        String key = KEY_GENERATION_HASH + userId;
        // 检查是否存在相同的hash
        Boolean exists = stringRedisTemplate.opsForSet().isMember(key, messageHash);
        return Boolean.TRUE.equals(exists);
    }

    @Override
    public void recordGeneration(Long userId, String message) {
        if (StrUtil.isBlank(message)) {
            return;
        }
        String messageHash = DigestUtil.md5Hex(message.trim());
        String key = KEY_GENERATION_HASH + userId;
        // 添加到Set中，24小时过期
        stringRedisTemplate.opsForSet().add(key, messageHash);
        stringRedisTemplate.expire(key, Duration.ofHours(24));
    }

    @Override
    @Deprecated
    public boolean validateGenerationResult(String content) {
        // 旧版本：仅检查内容（保留向后兼容）
        return validateGenerationResult(content, null, null);
    }

    @Override
    public boolean validateGenerationResult(String content, Long appId, String codeGenType) {
        // 检查内容是否为空或过短
        if (StrUtil.isBlank(content)) {
            log.warn("[无效生成] 生成内容为空");
            return false;
        }

        // 去除空白字符后检查长度
        String trimmed = content.trim();
        if (trimmed.length() < MIN_CONTENT_LENGTH) {
            log.warn("[无效生成] 生成内容过短: {} 字符", trimmed.length());
            return false;
        }

        // 优化后的逻辑：先检查文件，再判断是否为计划阶段
        boolean hasCodeFiles = false;
        if (appId != null && StrUtil.isNotBlank(codeGenType)) {
            hasCodeFiles = checkCodeFilesGenerated(appId, codeGenType);
        }

        boolean isWaitingConfirmation = isWaitingForConfirmation(trimmed);

        // 情况1：文件已生成 + AI输出确认内容 = 异常输出（但仍通过校验）
        if (hasCodeFiles && isWaitingConfirmation) {
            log.warn("[AI输出异常] 项目已成功生成但AI又输出了计划确认内容，这可能是AI的时序问题，appId={}, codeGenType={}", appId, codeGenType);
            return true; // 通过校验，因为实际功能已完成
        }

        // 情况2：没有文件 + AI输出确认内容 = 正常计划阶段
        if (!hasCodeFiles && isWaitingConfirmation) {
            log.info("[计划阶段] AI正在等待用户确认计划，这是正常流程，允许通过校验");
            return true; // 这是两阶段流程的第一阶段，不是失败！
        }

        // 情况3：没有文件 + AI未输出确认内容 = 生成失败
        if (!hasCodeFiles && !isWaitingConfirmation) {
            log.warn("[无效生成] 未生成实际代码文件且AI未提供计划，appId={}, codeGenType={}", appId, codeGenType);
            return false;
        }

        // 情况4：有文件 + AI未输出确认内容 = 正常完成
        log.info("[正常完成] 项目生成成功且AI输出正常，appId={}, codeGenType={}", appId, codeGenType);

        // TODO: 后续可以添加安全过滤（色情、暴力、政治敏感内容检测）
        // if (containsSensitiveContent(content)) {
        //     log.warn("[无效生成] 包含敏感内容");
        //     return false;
        // }

        return true;
    }

    /**
     * 检查AI是否在等待用户确认计划
     * 通过识别AI输出中的询问性语句来判断
     *
     * @param content AI输出的内容
     * @return true表示AI在等待确认
     */
    private boolean isWaitingForConfirmation(String content) {
        if (StrUtil.isBlank(content)) {
            return false;
        }

        String lowerContent = content.toLowerCase();

        // 1. 确认性询问短语列表
        String[] confirmationPhrases = {
            "您觉得这个计划",
            "你觉得这个计划", 
            "这个方案",
            "是否满意",
            "是否可以",
            "请确认",
            "请问是否",
            "可以开始吗",
            "是否开始",
            "合适吗",
            "同意吗",
            "没问题吗",
            // 识别"计划说明后的下一步引导"
            "what's next",
            "运行 npm",
            "实现的功能",
            "实现功能",
            "主要功能",
            "核心功能"
        };

        // 检查是否包含确认性询问
        for (String phrase : confirmationPhrases) {
            if (lowerContent.contains(phrase.toLowerCase())) {
                log.debug("检测到询问短语: {}", phrase);
                return true;
            }
        }

        // 2. 新增：检测AI是否输出了"假工具调用"
        // 如果AI输出包含工具调用的文本描述（如"【工具调用】"），但后续验证会发现没有实际文件
        // 这说明AI在描述计划，而不是真正执行
        if (lowerContent.contains("【工具调用】") || 
            lowerContent.contains("[工具调用]") ||
            lowerContent.contains("tool call") ||
            lowerContent.contains("calling tool")) {
            log.debug("检测到工具调用文本描述，可能是计划阶段的说明");
            // 注意：这里先返回false，让后续的文件检查来判断
            // 如果没有文件，会被判定为失败；但我们会在失败时检查是否包含这些特征
        }

        // 3. 新增：检测步骤列表式的计划描述
        // 如果包含多个步骤标记，很可能是计划
        int stepMarkers = 0;
        String[] stepPatterns = {"步骤", "step", "•", "●", "1)", "2)", "3)", "一、", "二、", "三、"};
        for (String pattern : stepPatterns) {
            if (lowerContent.contains(pattern.toLowerCase())) {
                stepMarkers++;
            }
        }
        if (stepMarkers >= 3) {
            log.debug("检测到多个步骤标记({}个)，可能是计划阶段", stepMarkers);
            return true;
        }

        return false;
    }

    /**
     * 检查是否生成了实际代码文件
     *
     * @param appId       应用ID
     * @param codeGenType 代码生成类型
     * @return true表示已生成文件
     */
    private boolean checkCodeFilesGenerated(Long appId, String codeGenType) {
        try {
            // 根据代码生成类型确定输出目录
            String outputDir;
            if ("vue_project".equals(codeGenType)) {
                outputDir = AppConstant.CODE_OUTPUT_ROOT_DIR + "/vue_project_" + appId;
            } else if ("multi_file".equals(codeGenType)) {
                outputDir = AppConstant.CODE_OUTPUT_ROOT_DIR + "/multi_file_" + appId;
            } else if ("html".equals(codeGenType)) {
                outputDir = AppConstant.CODE_OUTPUT_ROOT_DIR + "/html_" + appId;
            } else {
                // 未知类型，暂不检查文件
                log.debug("未知代码生成类型，跳过文件检查: {}", codeGenType);
                return true;
            }

            java.io.File projectDir = new java.io.File(outputDir);
            if (!projectDir.exists() || !projectDir.isDirectory()) {
                log.debug("项目目录不存在: {}", outputDir);
                return false;
            }

            // 检查目录下是否有实际文件（至少3个文件，排除系统文件）
            java.io.File[] files = projectDir.listFiles();
            if (files == null || files.length == 0) {
                log.debug("项目目录为空: {}", outputDir);
                return false;
            }

            int validFileCount = 0;
            for (java.io.File file : files) {
                // 排除系统文件和目录
                if (file.isFile() && !".DS_Store".equals(file.getName())) {
                    validFileCount++;
                }
            }

            // 至少需要3个有效文件（例如：package.json + vite.config.js + index.html）
            boolean hasEnoughFiles = validFileCount >= 3;
            if (!hasEnoughFiles) {
                log.debug("项目文件数量不足: {} 个文件，需要至少3个", validFileCount);
            }
            return hasEnoughFiles;

        } catch (Exception e) {
            log.error("检查代码文件生成失败: {}", e.getMessage(), e);
            // 检查失败时，为了不影响正常流程，返回true
            return true;
        }
    }

    @Override
    public int recordWarningAndPunish(Long userId, String reason) {
        // 管理员免于惩罚机制（双重保护：调用方+方法内部）
        if (isAdmin(userId)) {
            log.info("[管理员免罚] 用户={} 为管理员，跳过警告和惩罚", userId);
            return 0;
        }

        String today = LocalDate.now().toString();
        String countKey = KEY_WARNING_COUNT + today + ":" + userId;

        // 增加警告次数
        Long count = stringRedisTemplate.opsForValue().increment(countKey);
        if (count == null) {
            count = 1L;
        }

        // 设置过期时间为今日结束（到明天0点）
        long secondsUntilMidnight = Duration.between(
                java.time.LocalDateTime.now(),
                java.time.LocalDateTime.now().plusDays(1).withHour(0).withMinute(0).withSecond(0)
        ).getSeconds();
        stringRedisTemplate.expire(countKey, secondsUntilMidnight, TimeUnit.SECONDS);

        log.warn("[生成警告] 用户={}, 原因={}, 今日警告次数={}", userId, reason, count);

        // 记录监控指标
        String metricReason = reason.contains("重复") ? "duplicate" : "other";
        pointsMetricsCollector.recordInvalidGeneration(userId.toString(), metricReason);

        // 额外扣减10积分作为惩罚
        try {
            userPointsService.deductPoints(
                    userId,
                    PUNISHMENT_POINTS,
                    PointsTypeEnum.GENERATE.getValue(),
                    "无效生成惩罚：" + reason,
                    null
            );
            log.info("[积分惩罚] 用户={}, 扣除{}积分", userId, PUNISHMENT_POINTS);
        } catch (Exception e) {
            log.error("[积分惩罚失败] 用户={}, 错误={}", userId, e.getMessage());
        }

        // 如果达到3次警告，设置禁止标记
        if (count >= MAX_WARNINGS_PER_DAY) {
            String banKey = KEY_BAN_FLAG + today + ":" + userId;
            stringRedisTemplate.opsForValue().set(banKey, "1", secondsUntilMidnight, TimeUnit.SECONDS);
            log.warn("[禁止生成] 用户={}, 今日警告次数达到{}", userId, MAX_WARNINGS_PER_DAY);
        }

        return count.intValue();
    }

    @Override
    public int getTodayWarningCount(Long userId) {
        String today = LocalDate.now().toString();
        String countKey = KEY_WARNING_COUNT + today + ":" + userId;
        String value = stringRedisTemplate.opsForValue().get(countKey);
        return value == null ? 0 : Integer.parseInt(value);
    }

    @Override
    public boolean isTokenLimitExceeded(Long userId) {
        int usage = getTodayTokenUsage(userId);
        return usage >= MAX_TOKENS_PER_DAY;
    }

    @Override
    public boolean isGenerationCountExceeded(Long userId) {
        int count = getTodayGenerationCount(userId);
        return count >= MAX_GENERATIONS_PER_DAY;
    }

    @Override
    public void recordTokenUsage(Long userId, int tokens) {
        String today = LocalDate.now().toString();
        String key = KEY_TOKEN_USAGE + today + ":" + userId;

        // 增加Token消耗
        Long total = stringRedisTemplate.opsForValue().increment(key, tokens);

        // 设置过期时间为今日结束
        long secondsUntilMidnight = getSecondsUntilMidnight();
        stringRedisTemplate.expire(key, secondsUntilMidnight, TimeUnit.SECONDS);

        int todayTotal = total == null ? getTodayTokenUsage(userId) : total.intValue();
        if (todayTotal >= MAX_TOKENS_PER_DAY) {
            pointsMetricsCollector.recordTokenLimitExceeded(userId.toString());
        }

        log.info("[Token消耗] 用户={}, 本次消耗={}tokens, 今日累计={}tokens",
                userId, tokens, todayTotal);
    }

    @Override
    public int incrementGenerationCount(Long userId) {
        String today = LocalDate.now().toString();
        String key = KEY_GENERATION_COUNT + today + ":" + userId;

        // 增加生成次数
        Long count = stringRedisTemplate.opsForValue().increment(key);
        if (count == null) {
            count = 1L;
        }

        // 设置过期时间为今日结束
        long secondsUntilMidnight = getSecondsUntilMidnight();
        stringRedisTemplate.expire(key, secondsUntilMidnight, TimeUnit.SECONDS);

        log.info("[生成次数] 用户={}, 今日生成次数={}", userId, count);
        return count.intValue();
    }

    @Override
    public int getTodayTokenUsage(Long userId) {
        String today = LocalDate.now().toString();
        String key = KEY_TOKEN_USAGE + today + ":" + userId;
        String value = stringRedisTemplate.opsForValue().get(key);
        return value == null ? 0 : Integer.parseInt(value);
    }

    @Override
    public int getTodayGenerationCount(Long userId) {
        String today = LocalDate.now().toString();
        String key = KEY_GENERATION_COUNT + today + ":" + userId;
        String value = stringRedisTemplate.opsForValue().get(key);
        return value == null ? 0 : Integer.parseInt(value);
    }

    /**
     * 获取到今日结束的秒数
     */
    private long getSecondsUntilMidnight() {
        return Duration.between(
                LocalDateTime.now(),
                LocalDateTime.now().plusDays(1).withHour(0).withMinute(0).withSecond(0)
        ).getSeconds();
    }

    /**
     * 检查用户是否为管理员
     *
     * @param userId 用户ID
     * @return true表示是管理员
     */
    private boolean isAdmin(Long userId) {
        if (userId == null || userId <= 0) {
            return false;
        }
        try {
            User user = userService.getById(userId);
            return user != null && UserConstant.ADMIN_ROLE.equals(user.getUserRole());
        } catch (Exception e) {
            log.error("检查用户管理员身份失败: userId={}", userId, e);
            return false;
        }
    }
}
