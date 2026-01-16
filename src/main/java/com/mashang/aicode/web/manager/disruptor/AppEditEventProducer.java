package com.mashang.aicode.web.manager.disruptor;

import com.lmax.disruptor.RingBuffer;
import com.lmax.disruptor.dsl.Disruptor;
import com.mashang.aicode.web.manager.websocket.model.DialogueRequestMessage;
import com.mashang.aicode.web.model.entity.User;
import jakarta.annotation.PreDestroy;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;

/**
 * 事件生产器
 */
@Component
@Slf4j
public class AppEditEventProducer {

    @Resource
    Disruptor<AppEditEvent> appEditEventDisruptor;

    public void publishEvent(DialogueRequestMessage appEditRequestMessage, WebSocketSession session, User user, Long appId) {
        RingBuffer<AppEditEvent> ringBuffer = appEditEventDisruptor.getRingBuffer();
        // 获取可以生成的位置
        long next = ringBuffer.next();
        AppEditEvent appEditEvent = ringBuffer.get(next);
        appEditEvent.setSession(session);
        appEditEvent.setPictureEditRequestMessage(appEditRequestMessage);
        appEditEvent.setUser(user);
        appEditEvent.setAppId(appId);
        // 发布事件
        ringBuffer.publish(next);
    }

    /**
     * 优雅停机
     */
    @PreDestroy
    public void close() {
        appEditEventDisruptor.shutdown();
    }
}

