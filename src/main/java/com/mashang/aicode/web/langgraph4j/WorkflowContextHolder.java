package com.mashang.aicode.web.langgraph4j;

import lombok.Builder;
import lombok.Data;

import java.util.function.Consumer;

/**
 * 工作流上下文持有者
 * 用于在工作流执行期间存储和访问 SSE 消息回调
 */
public class WorkflowContextHolder {

    private static final ThreadLocal<WorkflowContext> CONTEXT_HOLDER = new ThreadLocal<>();

    @Data
    @Builder
    public static class WorkflowContext {
        private Consumer<String> sseMessageCallback;
    }

    /**
     * 设置上下文
     *
     * @param context
     */
    public static void setContext(WorkflowContext context) {
        CONTEXT_HOLDER.set(context);
    }

    /**
     * 获取上下文
     *
     * @return
     */
    public static WorkflowContext getContext() {
        return CONTEXT_HOLDER.get();
    }

    /**
     * 获取 SSE 消息回调
     *
     * @return
     */
    public static Consumer<String> getSseMessageCallback() {
        WorkflowContext context = getContext();
        return context != null ? context.getSseMessageCallback() : null;
    }

    /**
     * 发送 SSE 消息
     *
     * @param message
     */
    public static void sendSseMessage(String message) {
        Consumer<String> callback = getSseMessageCallback();
        if (callback != null) {
            callback.accept(message);
        }
    }

    /**
     * 清除上下文
     */
    public static void clearContext() {
        CONTEXT_HOLDER.remove();
    }
}
