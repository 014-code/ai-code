package com.mashang.aicode.web.config;

import cn.hutool.core.thread.ThreadFactoryBuilder;
import com.lmax.disruptor.dsl.Disruptor;
import com.mashang.aicode.web.manager.disruptor.AppEditEvent;
import com.mashang.aicode.web.manager.disruptor.AppEditEventWorkHandler;
import jakarta.annotation.Resource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppEditEventDisruptorConfig {

    @Resource
    private AppEditEventWorkHandler appEditEventWorkHandler;

    @Bean("appEditEventDisruptor")
    public Disruptor<AppEditEvent> messageModelRingBuffer() {
        // ringBuffer 的大小
        int bufferSize = 1024 * 256;
        Disruptor<AppEditEvent> disruptor = new Disruptor<>(
                AppEditEvent::new,
                bufferSize,
                ThreadFactoryBuilder.create().setNamePrefix("appEditEventDisruptor").build()
        );
        // 设置消费者
        disruptor.handleEventsWithWorkerPool(appEditEventWorkHandler);
        // 开启 disruptor
        disruptor.start();
        return disruptor;
    }

}
