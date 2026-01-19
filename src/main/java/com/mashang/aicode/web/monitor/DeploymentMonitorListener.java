package com.mashang.aicode.web.monitor;

import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.ThreadMXBean;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * 部署监控事件监听器
 * 监听应用生命周期事件和定时收集服务器指标
 */
@Component
@Slf4j
public class DeploymentMonitorListener {

    @Resource
    private DeploymentMetricsCollector deploymentMetricsCollector;

    private final AtomicBoolean isShuttingDown = new AtomicBoolean(false);

    private static final String DEFAULT_ENVIRONMENT = "prod";

    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor(r -> {
        Thread t = new Thread(r, "deployment-metrics-scheduler");
        t.setDaemon(true);
        return t;
    });

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        log.info("[Deployment Monitor] 应用启动，开始收集部署监控指标");

        deploymentMetricsCollector.registerActiveDeploymentsGauge();
        deploymentMetricsCollector.registerTodayDeploymentsGauge();
        deploymentMetricsCollector.registerLastDeploymentTimeGauge();

        startResourceMonitoring();
    }

    @EventListener(org.springframework.context.event.ContextClosedEvent.class)
    public void onContextClosed() {
        if (isShuttingDown.compareAndSet(false, true)) {
            log.info("[Deployment Monitor] 应用关闭，停止监控收集");
            scheduler.shutdown();
        }
    }

    /**
     * 记录应用启动部署
     *
     * @param version   版本号
     * @param deployer  部署人
     */
    public void recordApplicationStart(String version, String deployer) {
        String deploymentId = "startup_" + System.currentTimeMillis();
        deploymentMetricsCollector.recordDeploymentStart(
                deploymentId,
                DEFAULT_ENVIRONMENT,
                version,
                deployer
        );
        deploymentMetricsCollector.recordDeploymentSuccess(
                deploymentId,
                DEFAULT_ENVIRONMENT,
                version,
                Duration.ZERO
        );
    }

    /**
     * 记录应用关闭（优雅退出）
     *
     * @param version 版本号
     */
    public void recordApplicationShutdown(String version) {
        String deploymentId = "shutdown_" + System.currentTimeMillis();
        deploymentMetricsCollector.recordDeploymentStart(
                deploymentId,
                DEFAULT_ENVIRONMENT,
                version,
                "system"
        );

        log.info("[Deployment Monitor] 应用关闭部署记录完成: version={}", version);
    }

    /**
     * 启动资源监控定时任务
     */
    private void startResourceMonitoring() {
        scheduler.scheduleAtFixedRate(() -> {
            if (isShuttingDown.get()) {
                return;
            }
            try {
                collectSystemMetrics();
            } catch (Exception e) {
                log.warn("[Deployment Monitor] 收集系统指标失败", e);
            }
        }, 30, 30, TimeUnit.SECONDS);
    }

    /**
     * 收集系统资源指标
     */
    private void collectSystemMetrics() {
        Runtime runtime = Runtime.getRuntime();
        long maxMemory = runtime.maxMemory() / (1024 * 1024);
        long totalMemory = runtime.totalMemory() / (1024 * 1024);
        long freeMemory = runtime.freeMemory() / (1024 * 1024);
        long usedMemory = totalMemory - freeMemory;
        double memoryUsagePercent = (double) usedMemory / maxMemory * 100;

        deploymentMetricsCollector.recordJvmHeapUsage(DEFAULT_ENVIRONMENT, usedMemory * 1024 * 1024, maxMemory * 1024 * 1024);
        deploymentMetricsCollector.recordMemoryUsage(DEFAULT_ENVIRONMENT, memoryUsagePercent);

        ThreadMXBean threadMXBean = ManagementFactory.getThreadMXBean();
        int threadCount = threadMXBean.getThreadCount();
        deploymentMetricsCollector.recordJvmThreads(DEFAULT_ENVIRONMENT, threadCount);

        log.debug("[Deployment Monitor] 系统资源监控: memory={}MB/{}MB ({}%), threads={}",
                usedMemory, maxMemory, String.format("%.1f", memoryUsagePercent), threadCount);
    }

    /**
     * 获取当前活跃部署数
     */
    public int getActiveDeploymentCount() {
        return 0;
    }

    /**
     * 检查应用是否健康
     */
    public boolean isHealthy() {
        return !isShuttingDown.get();
    }
}
