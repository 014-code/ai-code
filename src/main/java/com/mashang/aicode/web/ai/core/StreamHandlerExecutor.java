package com.mashang.aicode.web.ai.core;

import com.mashang.aicode.web.ai.core.handler.JsonMessageStreamHandler;
import com.mashang.aicode.web.ai.core.handler.SimpleTextStreamHandler;
import com.mashang.aicode.web.ai.model.enums.CodeGenTypeEnum;
import com.mashang.aicode.web.model.entity.User;
import com.mashang.aicode.web.service.ChatHistoryService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;

/**
 * 流处理器执行器
 * 根据代码生成类型创建合适的流处理器：
 * 1. 传统的 Flux<String> 流（HTML、MULTI_FILE） -> SimpleTextStreamHandler
 * 2. TokenStream 格式的复杂流（VUE_PROJECT） -> JsonMessageStreamHandler
 */
@Slf4j
@Component
public class StreamHandlerExecutor {

    @Resource
    private JsonMessageStreamHandler jsonMessageStreamHandler;

    /**
     * 创建流处理器并处理聊天历史记录
     *
     * @param originFlux         原始流
     * @param chatHistoryService 聊天历史服务
     * @param appId              应用ID
     * @param loginUser          登录用户
     * @param codeGenType        代码生成类型
     * @return 处理后的流
     */
    public Flux<String> doExecute(Flux<String> originFlux,
                                  ChatHistoryService chatHistoryService,
                                  long appId, User loginUser, CodeGenTypeEnum codeGenType) {
        log.info("StreamHandlerExecutor.doExecute called, appId: {}, codeGenType: {}", appId, codeGenType);
        return switch (codeGenType) {
            case VUE_PROJECT -> {
                log.info("Using JsonMessageStreamHandler for VUE_PROJECT, appId: {}", appId);
                yield jsonMessageStreamHandler.handle(originFlux, chatHistoryService, appId, loginUser);
            }
            case REACT_PROJECT -> {
                log.info("Using JsonMessageStreamHandler for REACT_PROJECT, appId: {}", appId);
                yield jsonMessageStreamHandler.handle(originFlux, chatHistoryService, appId, loginUser);
            }
            case HTML, MULTI_FILE -> {
                log.info("Using SimpleTextStreamHandler for {}, appId: {}", codeGenType, appId);
                yield new SimpleTextStreamHandler().handle(originFlux, chatHistoryService, appId, loginUser);
            }
        };
    }
}


