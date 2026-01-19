package com.mashang.aicode.web.service;

/**
 * 生成验证服务 - 用于检测无效生成和防刷
 */
public interface GenerationValidationService {

    /**
     * 检查用户今日是否被禁止生成（累计3次警告）
     * @param userId 用户ID
     * @return true表示被禁止
     */
    boolean isUserBannedToday(Long userId);

    /**
     * 检查24小时内是否重复生成相同需求
     * @param userId 用户ID
     * @param message 用户输入的提示词
     * @return true表示重复
     */
    boolean isDuplicateGeneration(Long userId, String message);

    /**
     * 记录本次生成的提示词（用于后续重复检测）
     * @param userId 用户ID
     * @param message 用户输入的提示词
     */
    void recordGeneration(Long userId, String message);

    /**
     * 验证生成结果是否有效（旧版本，保留兼容性）
     * @param content 生成的内容
     * @return true表示有效，false表示无效
     * @deprecated 使用 validateGenerationResult(String content, Long appId, String codeGenType) 替代
     */
    @Deprecated
    boolean validateGenerationResult(String content);

    /**
     * 验证生成结果是否有效（检查内容和实际文件）
     * @param content 生成的内容
     * @param appId 应用ID
     * @param codeGenType 代码生成类型
     * @return true表示有效，false表示无效
     */
    boolean validateGenerationResult(String content, Long appId, String codeGenType);

    /**
     * 记录警告并惩罚用户（额外扣减10积分）
     * @param userId 用户ID
     * @param reason 警告原因
     * @return 警告次数
     */
    int recordWarningAndPunish(Long userId, String reason);

    /**
     * 获取用户今日警告次数
     * @param userId 用户ID
     * @return 警告次数
     */
    int getTodayWarningCount(Long userId);

    /**
     * 检查用户今日Token消耗是否超限
     * @param userId 用户ID
     * @return true表示已超限
     */
    boolean isTokenLimitExceeded(Long userId);

    /**
     * 检查用户今日生成次数是否超限
     * @param userId 用户ID
     * @return true表示已超限
     */
    boolean isGenerationCountExceeded(Long userId);

    /**
     * 记录用户Token消耗
     * @param userId 用户ID
     * @param tokens 消耗的Token数量
     */
    void recordTokenUsage(Long userId, int tokens);

    /**
     * 增加用户今日生成次数
     * @param userId 用户ID
     * @return 当前生成次数
     */
    int incrementGenerationCount(Long userId);

    /**
     * 获取用户今日Token消耗
     * @param userId 用户ID
     * @return Token消耗数量
     */
    int getTodayTokenUsage(Long userId);

    /**
     * 获取用户今日生成次数
     * @param userId 用户ID
     * @return 生成次数
     */
    int getTodayGenerationCount(Long userId);
}
