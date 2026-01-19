package com.mashang.aicode.web.monitor;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * 积分系统 Prometheus 监控指标收集器
 */
@Component
@Slf4j
public class PointsMetricsCollector {

    @Resource
    private MeterRegistry meterRegistry;

    // 缓存已创建的指标，避免重复创建
    private final ConcurrentMap<String, Counter> pointsGrantedCountersCache = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, Counter> pointsConsumedCountersCache = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, Counter> pointsExpiredCountersCache = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, Counter> invalidGenerationCountersCache = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, Counter> refundFailureCountersCache = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, Counter> pointsDeductionFailureCountersCache = new ConcurrentHashMap<>();

    /**
     * 记录积分发放（按类型统计）
     * @param userId 用户ID
     * @param pointsType 积分类型（SIGN_IN, REGISTER, INVITE, FIRST_GENERATE等）
     * @param points 发放积分数
     */
    public void recordPointsGranted(String userId, String pointsType, int points) {
        String key = userId + "_" + pointsType;
        Counter counter = pointsGrantedCountersCache.computeIfAbsent(key, k ->
                Counter.builder("ai_code_points_granted_total")
                        .description("积分发放总量")
                        .tag("user_id", userId)
                        .tag("type", pointsType)
                        .register(meterRegistry)
        );
        counter.increment(points);
        log.debug("[Metrics] 积分发放: userId={}, type={}, points={}", userId, pointsType, points);
    }

    /**
     * 记录积分消耗
     * @param userId 用户ID
     * @param points 消耗积分数
     */
    public void recordPointsConsumed(String userId, int points) {
        String key = userId;
        Counter counter = pointsConsumedCountersCache.computeIfAbsent(key, k ->
                Counter.builder("ai_code_points_consumed_total")
                        .description("积分消耗总量")
                        .tag("user_id", userId)
                        .register(meterRegistry)
        );
        counter.increment(points);
        log.debug("[Metrics] 积分消耗: userId={}, points={}", userId, points);
    }

    /**
     * 记录积分过期
     * @param userId 用户ID
     * @param points 过期积分数
     */
    public void recordPointsExpired(String userId, int points) {
        String key = userId;
        Counter counter = pointsExpiredCountersCache.computeIfAbsent(key, k ->
                Counter.builder("ai_code_points_expired_total")
                        .description("积分过期总量")
                        .tag("user_id", userId)
                        .register(meterRegistry)
        );
        counter.increment(points);
        log.debug("[Metrics] 积分过期: userId={}, points={}", userId, points);
    }

    /**
     * 记录无效生成次数
     * @param userId 用户ID
     * @param reason 原因（empty: 内容为空, duplicate: 重复生成, security: 安全过滤）
     */
    public void recordInvalidGeneration(String userId, String reason) {
        String key = userId + "_" + reason;
        Counter counter = invalidGenerationCountersCache.computeIfAbsent(key, k ->
                Counter.builder("ai_code_invalid_generation_total")
                        .description("无效生成次数")
                        .tag("user_id", userId)
                        .tag("reason", reason)
                        .register(meterRegistry)
        );
        counter.increment();
        log.debug("[Metrics] 无效生成: userId={}, reason={}", userId, reason);
    }

    /**
     * 记录Token消耗超限用户数
     * @param userId 用户ID
     */
    public void recordTokenLimitExceeded(String userId) {
        String key = userId;
        Counter counter = invalidGenerationCountersCache.computeIfAbsent("token_limit_" + key, k ->
                Counter.builder("ai_code_token_limit_exceeded_users")
                        .description("Token消耗超限用户数")
                        .tag("user_id", userId)
                        .register(meterRegistry)
        );
        counter.increment();
        log.debug("[Metrics] Token超限: userId={}", userId);
    }

    /**
     * 记录积分返还失败次数（用于告警和后续人工补偿）
     * @param userId 用户ID
     * @param appId 应用ID
     */
    public void recordRefundFailure(String userId, String appId) {
        String key = userId + "_" + appId;
        Counter counter = refundFailureCountersCache.computeIfAbsent(key, k ->
                Counter.builder("ai_code_points_refund_failure_total")
                        .description("积分返还失败次数")
                        .tag("user_id", userId)
                        .tag("app_id", appId)
                        .register(meterRegistry)
        );
        counter.increment();
        log.warn("[Metrics] 积分返还失败: userId={}, appId={}", userId, appId);
    }

    /**
     * 记录积分扣费失败次数（用于告警和事后对账）
     * @param userId 用户ID
     * @param appId 应用ID
     */
    public void recordPointsDeductionFailure(String userId, String appId) {
        String key = userId + "_" + appId;
        Counter counter = pointsDeductionFailureCountersCache.computeIfAbsent(key, k ->
                Counter.builder("ai_code_points_deduction_failure_total")
                        .description("积分扣费失败次数")
                        .tag("user_id", userId)
                        .tag("app_id", appId)
                        .register(meterRegistry)
        );
        counter.increment();
        log.error("[Metrics] 积分扣费失败: userId={}, appId={}", userId, appId);
    }
}
