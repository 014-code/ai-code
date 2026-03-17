package com.mashang.aicode.web.ai.core.handler;

import com.mashang.aicode.web.ai.model.enums.CodeGenTypeEnum;
import com.mashang.aicode.web.constant.PointsConstants;
import com.mashang.aicode.web.model.entity.User;
import com.mashang.aicode.web.model.enums.ChatHistoryMessageTypeEnum;
import com.mashang.aicode.web.model.enums.PointsTypeEnum;
import com.mashang.aicode.web.service.ChatHistoryService;
import com.mashang.aicode.web.service.UserPointService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;

/**
 * 简单文本流处理器
 * 处理 HTML 和 MULTI_FILE 类型的流式响应
 */
@Slf4j
@Component
public class SimpleTextStreamHandler {

    @Resource
    private UserPointService userPointService;

    /**
     * 处理传统流（HTML, MULTI_FILE）
     * 直接收集完整的文本响应
     *
     * @param originFlux         原始流
     * @param chatHistoryService 聊天历史服务
     * @param appId              应用ID
     * @param loginUser          登录用户
     * @param codeGenType        代码生成类型
     * @return 处理后的流
     */
    public Flux<String> handle(Flux<String> originFlux,
                               ChatHistoryService chatHistoryService,
                               long appId, User loginUser, CodeGenTypeEnum codeGenType) {
        StringBuilder aiResponseBuilder = new StringBuilder();
        return originFlux
                .map(chunk -> {
                    aiResponseBuilder.append(chunk);
                    return chunk;
                })
                .doOnComplete(() -> {
                    String aiResponse = aiResponseBuilder.toString();
                    chatHistoryService.addChatMessage(appId, aiResponse, ChatHistoryMessageTypeEnum.AI.getValue(), loginUser.getId());
                    deductPointsAfterGeneration(loginUser.getId(), codeGenType);
                })
                .doOnError(error -> {
                    String errorMessage = "AI回复失败: " + error.getMessage();
                    chatHistoryService.addChatMessage(appId, errorMessage, ChatHistoryMessageTypeEnum.AI.getValue(), loginUser.getId());
                    deductPointsAfterGeneration(loginUser.getId(), codeGenType);
                });
    }

    private void deductPointsAfterGeneration(Long userId, CodeGenTypeEnum codeGenType) {
        try {
            int points = PointsConstants.getPointsByGenType(codeGenType != null ? codeGenType.getValue() : null);
            userPointService.deductPoints(userId, points, PointsTypeEnum.GENERATE.getValue(), "代码生成消费", null);
            log.info("[积分扣减] 用户 {} 生成代码完成，扣减 {} 积分，类型: {}", userId, points, codeGenType);
        } catch (Exception e) {
            log.error("[积分扣减失败] 用户 {}, 错误: {}", userId, e.getMessage(), e);
        }
    }
}


