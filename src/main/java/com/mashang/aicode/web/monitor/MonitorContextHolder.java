package com.mashang.aicode.web.monitor;

import lombok.extern.slf4j.Slf4j;

/**
 * 监控上下文持有者
 */
@Slf4j
public class MonitorContextHolder {

    //线程池
    private static final ThreadLocal<MonitorContext> CONTEXT_HOLDER = new ThreadLocal<>();

    /**
     * 设置上下文
     * @param context
     */
    public static void setContext(MonitorContext context) {
        CONTEXT_HOLDER.set(context);
    }

    /**
     * 获取上下文
     * @return
     */
    public static MonitorContext getContext() {
        return CONTEXT_HOLDER.get();
    }

    /**
     * 清除上下文
     */
    public static void clearContext() {
        CONTEXT_HOLDER.remove();
    }
}


