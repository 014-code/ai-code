package com.mashang.aicode.web.ai.factory;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.mashang.aicode.web.ai.guardrail.PromptSafetyInputGuardrail;
import com.mashang.aicode.web.ai.model.enums.CodeGenTypeEnum;
import com.mashang.aicode.web.ai.service.AiCodeGeneratorService;
import com.mashang.aicode.web.ai.tool.CommandTool;
import com.mashang.aicode.web.ai.tool.FileDeleteTool;
import com.mashang.aicode.web.ai.tool.FileDirReadTool;
import com.mashang.aicode.web.ai.tool.FileModifyTool;
import com.mashang.aicode.web.ai.tool.FileReadTool;
import com.mashang.aicode.web.ai.tool.FileWriteTool;
import com.mashang.aicode.web.ai.tool.ToolManager;
import com.mashang.aicode.web.exception.BusinessException;
import com.mashang.aicode.web.exception.ErrorCode;
import dev.langchain4j.data.message.ToolExecutionResultMessage;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.chat.StreamingChatModel;
import dev.langchain4j.service.AiServices;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

/**
 * AI服务初始化工厂类（单模型版本）
 * 移除了多模型动态切换功能，使用固定的单模型配置
 */
@Configuration
@Slf4j
public class AiCodeGeneratorServiceFactory {

    @Resource(name = "openAiChatModel")
    private ChatModel openAiChatModel;

    @Resource(name = "ollamaChatModel")
    private ChatModel ollamaChatModel;

    @Resource(name = "streamingChatModelPrototype")
    private StreamingChatModel streamingChatModel;

    @Resource
    private ToolManager toolManager;

    private final Cache<String, AiCodeGeneratorService> serviceCache = Caffeine.newBuilder()
            .maximumSize(1000)
            .expireAfterWrite(Duration.ofMinutes(30))
            .expireAfterAccess(Duration.ofMinutes(10))
            .removalListener((key, value, cause) -> {
                log.debug("AI 服务实例被移除，key: {}, 原因: {}", key, cause);
            })
            .build();

    public AiCodeGeneratorService getAiCodeGeneratorService(long appId) {
        return getAiCodeGeneratorService(appId, CodeGenTypeEnum.MULTI_FILE);
    }

    /**
     * 根据 appId 和代码生成类型获取服务（带缓存）
     */
    public AiCodeGeneratorService getAiCodeGeneratorService(long appId, CodeGenTypeEnum codeGenType) {
        String cacheKey = buildCacheKey(appId, codeGenType);
        return serviceCache.get(cacheKey, key -> createAiCodeGeneratorService(appId, codeGenType));
    }

    /**
     * 创建新的 AI 服务实例（单模型版本）
     */
    private AiCodeGeneratorService createAiCodeGeneratorService(long appId, CodeGenTypeEnum codeGenType) {
        // 构建对话记忆
        MessageWindowChatMemory chatMemory = MessageWindowChatMemory.builder()
                .id(appId)
                .maxMessages(30)
                .build();

        // 根据代码生成类型选择不同的模型配置
        return switch (codeGenType) {
            case VUE_PROJECT, REACT_PROJECT -> {
                yield AiServices.builder(AiCodeGeneratorService.class)
                        .streamingChatModel(streamingChatModel)
                        .chatMemoryProvider(memoryId -> chatMemory)
                        .tools(getLangchainTools())
                        .inputGuardrails(new PromptSafetyInputGuardrail())
                        .maxSequentialToolsInvocations(10)
                        .hallucinatedToolNameStrategy(toolExecutionRequest ->
                                ToolExecutionResultMessage.from(
                                        toolExecutionRequest, "Error: there is no called" +
                                                toolExecutionRequest.name()
                                )).build();
            }
            case HTML, MULTI_FILE -> {
                yield AiServices.builder(AiCodeGeneratorService.class)
                        .chatModel(ollamaChatModel)
                        .streamingChatModel(streamingChatModel)
                        .chatMemory(chatMemory)
                        .build();
            }
            default ->
                    throw new BusinessException(ErrorCode.SYSTEM_ERROR, "不支持的代码生成类型: " + codeGenType.getValue());
        };
    }

    /**
     * 构建缓存键
     */
    private String buildCacheKey(long appId, CodeGenTypeEnum codeGenType) {
        return appId + "_" + codeGenType.getValue();
    }

    @Bean
    public AiCodeGeneratorService aiCodeGeneratorService() {
        return getAiCodeGeneratorService(0L);
    }

    /**
     * 获取所有工具类
     */
    private Object[] getLangchainTools() {
        return toolManager.getAllTools();
    }
}
