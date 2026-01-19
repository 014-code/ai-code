package com.mashang.aicode.web.monitor;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 部署监控指标收集器
 * 收集部署相关的各项指标，包括部署状态、持续时间、资源使用等
 */
@Component
@Slf4j
public class DeploymentMetricsCollector {

    @Resource
    private MeterRegistry meterRegistry;

    private final ConcurrentMap<String, Counter> deploymentCountersCache = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, Counter> successCountersCache = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, Counter> failedCountersCache = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, Counter> rollbackCountersCache = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, Timer> deploymentTimerCache = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, AtomicLong> gaugeValuesCache = new ConcurrentHashMap<>();

    private final AtomicInteger activeDeployments = new AtomicInteger(0);
    private final AtomicLong lastDeploymentTime = new AtomicLong(0);
    private final AtomicInteger totalDeploymentsToday = new AtomicInteger(0);

    /**
     * 记录部署开始
     *
     * @param deploymentId 部署ID
     * @param environment  环境（dev/staging/prod）
     * @param version      版本号
     * @param deployer     部署人
     */
    public void recordDeploymentStart(String deploymentId, String environment, String version, String deployer) {
        String key = deploymentId + "_" + environment;

        Counter counter = deploymentCountersCache.computeIfAbsent(key, k ->
                Counter.builder("ai_code_deployment_total")
                        .description("部署总次数")
                        .tag("deployment_id", deploymentId)
                        .tag("environment", environment)
                        .tag("version", version)
                        .tag("deployer", deployer)
                        .register(meterRegistry)
        );
        counter.increment();

        activeDeployments.incrementAndGet();
        lastDeploymentTime.set(Instant.now().toEpochMilli());

        log.info("[Deployment Metrics] 部署开始: deploymentId={}, environment={}, version={}, deployer={}",
                deploymentId, environment, version, deployer);
    }

    /**
     * 记录部署成功
     *
     * @param deploymentId 部署ID
     * @param environment  环境
     * @param version      版本号
     * @param duration     部署持续时间
     */
    public void recordDeploymentSuccess(String deploymentId, String environment, String version, Duration duration) {
        String key = deploymentId + "_" + environment + "_success";

        Counter counter = successCountersCache.computeIfAbsent(key, k ->
                Counter.builder("ai_code_deployment_success_total")
                        .description("部署成功次数")
                        .tag("deployment_id", deploymentId)
                        .tag("environment", environment)
                        .tag("version", version)
                        .register(meterRegistry)
        );
        counter.increment();

        Timer timer = deploymentTimerCache.computeIfAbsent(deploymentId, k ->
                Timer.builder("ai_code_deployment_duration_seconds")
                        .description("部署持续时间")
                        .tag("deployment_id", deploymentId)
                        .tag("environment", environment)
                        .tag("version", version)
                        .register(meterRegistry)
        );
        timer.record(duration);

        activeDeployments.decrementAndGet();
        totalDeploymentsToday.incrementAndGet();

        log.info("[Deployment Metrics] 部署成功: deploymentId={}, environment={}, version={}, duration={}s",
                deploymentId, environment, version, duration.getSeconds());
    }

    /**
     * 记录部署失败
     *
     * @param deploymentId 部署ID
     * @param environment  环境
     * @param version      版本号
     * @param errorMessage 错误信息
     */
    public void recordDeploymentFailed(String deploymentId, String environment, String version, String errorMessage) {
        String key = deploymentId + "_" + environment + "_failed";

        Counter counter = failedCountersCache.computeIfAbsent(key, k ->
                Counter.builder("ai_code_deployment_failed_total")
                        .description("部署失败次数")
                        .tag("deployment_id", deploymentId)
                        .tag("environment", environment)
                        .tag("version", version)
                        .tag("error_type", categorizeError(errorMessage))
                        .register(meterRegistry)
        );
        counter.increment();

        activeDeployments.decrementAndGet();

        log.error("[Deployment Metrics] 部署失败: deploymentId={}, environment={}, version={}, error={}",
                deploymentId, environment, version, errorMessage);
    }

    /**
     * 记录回滚
     *
     * @param deploymentId     部署ID
     * @param environment      环境
     * @param fromVersion      回滚前的版本
     * @param toVersion        回滚到的版本
     * @param rollbackReason   回滚原因
     */
    public void recordRollback(String deploymentId, String environment, String fromVersion, String toVersion, String rollbackReason) {
        String key = deploymentId + "_" + environment + "_rollback";

        Counter counter = rollbackCountersCache.computeIfAbsent(key, k ->
                Counter.builder("ai_code_deployment_rollback_total")
                        .description("回滚总次数")
                        .tag("deployment_id", deploymentId)
                        .tag("environment", environment)
                        .tag("from_version", fromVersion)
                        .tag("to_version", toVersion)
                        .tag("reason", rollbackReason)
                        .register(meterRegistry)
        );
        counter.increment();

        log.warn("[Deployment Metrics] 回滚记录: deploymentId={}, environment={}, from={} to={}, reason={}",
                deploymentId, environment, fromVersion, toVersion, rollbackReason);
    }

    /**
     * 记录服务器CPU使用率
     *
     * @param environment 环境
     * @param cpuUsage    CPU使用率（0-100）
     */
    public void recordCpuUsage(String environment, double cpuUsage) {
        String key = "cpu_usage_" + environment;
        AtomicLong value = gaugeValuesCache.computeIfAbsent(key, k -> {
            AtomicLong atomicLong = new AtomicLong(0);
            Gauge.builder("ai_code_server_cpu_usage", atomicLong, AtomicLong::get)
                    .description("服务器CPU使用率")
                    .tag("environment", environment)
                    .register(meterRegistry);
            return atomicLong;
        });
        value.set((long) cpuUsage);
    }

    /**
     * 记录服务器内存使用率
     *
     * @param environment 环境
     * @param memoryUsage 内存使用率（0-100）
     */
    public void recordMemoryUsage(String environment, double memoryUsage) {
        String key = "memory_usage_" + environment;
        AtomicLong value = gaugeValuesCache.computeIfAbsent(key, k -> {
            AtomicLong atomicLong = new AtomicLong(0);
            Gauge.builder("ai_code_server_memory_usage", atomicLong, AtomicLong::get)
                    .description("服务器内存使用率")
                    .tag("environment", environment)
                    .register(meterRegistry);
            return atomicLong;
        });
        value.set((long) memoryUsage);
    }

    /**
     * 记录服务器磁盘使用率
     *
     * @param environment 环境
     * @param diskUsage   磁盘使用率（0-100）
     */
    public void recordDiskUsage(String environment, double diskUsage) {
        String key = "disk_usage_" + environment;
        AtomicLong value = gaugeValuesCache.computeIfAbsent(key, k -> {
            AtomicLong atomicLong = new AtomicLong(0);
            Gauge.builder("ai_code_server_disk_usage", atomicLong, AtomicLong::get)
                    .description("服务器磁盘使用率")
                    .tag("environment", environment)
                    .register(meterRegistry);
            return atomicLong;
        });
        value.set((long) diskUsage);
    }

    /**
     * 记录JVM堆内存使用
     *
     * @param environment 环境
     * @param usedMemory  已使用内存（字节）
     * @param maxMemory   最大内存（字节）
     */
    public void recordJvmHeapUsage(String environment, long usedMemory, long maxMemory) {
        String key = "jvm_heap_" + environment;
        AtomicLong value = gaugeValuesCache.computeIfAbsent(key, k -> {
            AtomicLong atomicLong = new AtomicLong(0);
            Gauge.builder("ai_code_jvm_heap_usage_bytes", atomicLong, AtomicLong::get)
                    .description("JVM堆内存使用量")
                    .tag("environment", environment)
                    .register(meterRegistry);
            return atomicLong;
        });
        value.set(usedMemory);
    }

    /**
     * 记录JVM线程数
     *
     * @param environment 环境
     * @param threadCount 线程数
     */
    public void recordJvmThreads(String environment, int threadCount) {
        String key = "jvm_threads_" + environment;
        AtomicLong value = gaugeValuesCache.computeIfAbsent(key, k -> {
            AtomicLong atomicLong = new AtomicLong(0);
            Gauge.builder("ai_code_jvm_threads_total", atomicLong, AtomicLong::get)
                    .description("JVM线程数")
                    .tag("environment", environment)
                    .register(meterRegistry);
            return atomicLong;
        });
        value.set(threadCount);
    }

    /**
     * 记录JVM GC次数
     *
     * @param environment 环境
     * @param gcCount     GC次数
     * @param gcType      GC类型（Young/Old）
     */
    public void recordJvmGcCount(String environment, long gcCount, String gcType) {
        String key = "jvm_gc_count_" + environment + "_" + gcType;
        Counter counter = deploymentCountersCache.computeIfAbsent(key, k ->
                Counter.builder("ai_code_jvm_gc_total")
                        .description("JVM GC总次数")
                        .tag("environment", environment)
                        .tag("gc_type", gcType)
                        .register(meterRegistry)
        );
        counter.increment(gcCount);
    }

    /**
     * 记录数据库连接池使用情况
     *
     * @param environment    环境
     * @param activeCount    活跃连接数
     * @param idleCount      空闲连接数
     * @param maxPoolSize    最大连接数
     */
    public void recordDatabasePoolUsage(String environment, int activeCount, int idleCount, int maxPoolSize) {
        String key = "db_pool_" + environment;
        AtomicLong value = gaugeValuesCache.computeIfAbsent(key, k -> {
            AtomicLong atomicLong = new AtomicLong(0);
            Gauge.builder("ai_code_db_pool_active_connections", atomicLong, AtomicLong::get)
                    .description("数据库连接池活跃连接数")
                    .tag("environment", environment)
                    .register(meterRegistry);
            return atomicLong;
        });
        value.set(activeCount);
    }

    /**
     * 记录HTTP请求响应时间
     *
     * @param environment 环境
     * @param endpoint    端点
     * @param method      HTTP方法
     * @param duration    响应时间
     */
    public void recordHttpResponseTime(String environment, String endpoint, String method, Duration duration) {
        String key = "http_response_" + environment + "_" + method + "_" + endpoint;

        Timer timer = deploymentTimerCache.computeIfAbsent(key, k ->
                Timer.builder("ai_code_http_response_duration_seconds")
                        .description("HTTP请求响应时间")
                        .tag("environment", environment)
                        .tag("endpoint", endpoint)
                        .tag("method", method)
                        .register(meterRegistry)
        );
        timer.record(duration);
    }

    /**
     * 记录活跃部署数
     */
    public void registerActiveDeploymentsGauge() {
        Gauge.builder("ai_code_active_deployments", activeDeployments, AtomicInteger::get)
                .description("当前活跃的部署数量")
                .register(meterRegistry);
    }

    /**
     * 记录今日部署总数
     */
    public void registerTodayDeploymentsGauge() {
        Gauge.builder("ai_code_deployments_today", totalDeploymentsToday, AtomicInteger::get)
                .description("今日部署总次数")
                .register(meterRegistry);
    }

    /**
     * 记录距离上次部署的时间
     */
    public void registerLastDeploymentTimeGauge() {
        Gauge.builder("ai_code_seconds_since_last_deployment", lastDeploymentTime, AtomicLong::get)
                .description("距离上次部署的秒数")
                .register(meterRegistry);
    }

    /**
     * 对错误信息进行分类
     */
    private String categorizeError(String errorMessage) {
        if (errorMessage == null) {
            return "unknown";
        }
        String lowerError = errorMessage.toLowerCase();
        if (lowerError.contains("timeout") || lowerError.contains("timeout")) {
            return "timeout";
        } else if (lowerError.contains("connection") || lowerError.contains("refused")) {
            return "connection";
        } else if (lowerError.contains("outofmemory") || lowerError.contains("oom")) {
            return "memory";
        } else if (lowerError.contains("disk") || lowerError.contains("space")) {
            return "storage";
        } else if (lowerError.contains("permission") || lowerError.contains("access")) {
            return "permission";
        } else if (lowerError.contains("database") || lowerError.contains("sql")) {
            return "database";
        }
        return "other";
    }

    /**
     * 部署信息记录类
     */
    public record DeploymentInfo(
            String deploymentId,
            String environment,
            String version,
            String deployer,
            Instant startTime
    ) {}

    /**
     * 部署事件记录类
     */
    public record DeploymentEvent(
            String deploymentId,
            String environment,
            String version,
            String eventType,
            String message,
            Instant timestamp
    ) {}
}
