package com.mashang.aicode.web.monitor;

import dev.langchain4j.model.chat.listener.ChatModelErrorContext;
import dev.langchain4j.model.chat.listener.ChatModelListener;
import dev.langchain4j.model.chat.listener.ChatModelRequestContext;
import dev.langchain4j.model.chat.listener.ChatModelResponseContext;
import dev.langchain4j.model.output.TokenUsage;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;

/**
 * 指标监听器-用来触发收集器中的各方法
 */
@Component
@Slf4j
public class AiModelMonitorListener implements ChatModelListener {


    private static final String REQUEST_START_TIME_KEY = "request_start_time";

    private static final String MONITOR_CONTEXT_KEY = "monitor_context";

    @Resource
    private AiModelMetricsCollector aiModelMetricsCollector;

    /**
     * 请求收集时触发
     *
     * @param requestContext
     */
    @Override
    public void onRequest(ChatModelRequestContext requestContext) {

        requestContext.attributes().put(REQUEST_START_TIME_KEY, Instant.now());

        MonitorContext context = MonitorContextHolder.getContext();
        if (context == null) {
            log.warn("MonitorContext not available in onRequest, skip metrics");
            return;
        }
        String userId = context.getUserId();
        String appId = context.getAppId();
        requestContext.attributes().put(MONITOR_CONTEXT_KEY, context);

        String modelName = requestContext.chatRequest().modelName();

        aiModelMetricsCollector.recordRequest(userId, appId, modelName, "started");

    }

    /**
     * 响应时触发
     *
     * @param responseContext
     */
    @Override
    public void onResponse(ChatModelResponseContext responseContext) {

        Map<Object, Object> attributes = responseContext.attributes();

        MonitorContext context = (MonitorContext) attributes.get(MONITOR_CONTEXT_KEY);
        if (context == null) {
            log.warn("MonitorContext missing in onResponse, skip metrics");
            return;
        }
        String userId = context.getUserId();
        String appId = context.getAppId();

        String modelName = responseContext.chatResponse().modelName();

        aiModelMetricsCollector.recordRequest(userId, appId, modelName, "success");

        recordResponseTime(attributes, userId, appId, modelName);

        recordTokenUsage(responseContext, userId, appId, modelName);

    }

    /**
     * 错误时触发
     *
     * @param errorContext
     */
    @Override
    public void onError(ChatModelErrorContext errorContext) {

        MonitorContext context = (MonitorContext) errorContext.attributes().get(MONITOR_CONTEXT_KEY);
        if (context == null) {
            context = MonitorContextHolder.getContext();
        }
        if (context == null) {
            log.warn("MonitorContext missing, skip metrics");
            return;
        }
        String userId = context.getUserId();
        String appId = context.getAppId();

        String modelName = errorContext.chatRequest().modelName();
        String errorMessage = errorContext.error().getMessage();

        aiModelMetricsCollector.recordRequest(userId, appId, modelName, "error");
        aiModelMetricsCollector.recordError(userId, appId, modelName, errorMessage);

        Map<Object, Object> attributes = errorContext.attributes();
        recordResponseTime(attributes, userId, appId, modelName);
    }


    /**
     * 收集响应时间统计
     *
     * @param attributes
     * @param userId
     * @param appId
     * @param modelName
     */
    private void recordResponseTime(Map<Object, Object> attributes, String userId, String appId, String modelName) {
        Instant startTime = (Instant) attributes.get(REQUEST_START_TIME_KEY);
        if (startTime == null) {
            log.warn("Request start time missing, skip response time metric for model {}", modelName);
            return;
        }
        Duration responseTime = Duration.between(startTime, Instant.now());
        aiModelMetricsCollector.recordResponseTime(userId, appId, modelName, responseTime);
    }


    /**
     * 记录token消耗数
     *
     * @param responseContext
     * @param userId
     * @param appId
     * @param modelName
     */
    private void recordTokenUsage(ChatModelResponseContext responseContext, String userId, String appId, String modelName) {
        TokenUsage tokenUsage = responseContext.chatResponse().metadata().tokenUsage();
        if (tokenUsage != null) {
            aiModelMetricsCollector.recordTokenUsage(userId, appId, modelName, "input", tokenUsage.inputTokenCount());
            aiModelMetricsCollector.recordTokenUsage(userId, appId, modelName, "output", tokenUsage.outputTokenCount());
            aiModelMetricsCollector.recordTokenUsage(userId, appId, modelName, "total", tokenUsage.totalTokenCount());
        }
    }
}


