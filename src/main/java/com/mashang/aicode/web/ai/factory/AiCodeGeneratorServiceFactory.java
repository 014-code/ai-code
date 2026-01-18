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
import com.mashang.aicode.web.service.ChatHistoryService;
import com.mashang.aicode.web.utils.SpringContextUtil;
import dev.langchain4j.community.store.memory.chat.redis.RedisChatMemoryStore;
import dev.langchain4j.data.message.ToolExecutionResultMessage;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.chat.StreamingChatModel;
import dev.langchain4j.service.AiServices;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

/**
 * ai服务初始化工厂类
 */
@Configuration
@Slf4j
public class AiCodeGeneratorServiceFactory {

    @Resource(name = "openAiChatModel")
    private ChatModel openAiChatModel;

    @Resource(name = "ollamaChatModel")
    private ChatModel ollamaChatModel;

    @Resource
    private RedisChatMemoryStore redisChatMemoryStore;

    @Autowired
    private ChatHistoryService chatHistoryService;

    @Autowired
    private FileWriteTool fileWriteTool;

    @Autowired
    private FileReadTool fileReadTool;

    @Autowired
    private FileModifyTool fileModifyTool;

    @Autowired
    private FileDirReadTool fileDirReadTool;

    @Autowired
    private FileDeleteTool fileDeleteTool;

    @Autowired
    private CommandTool commandTool;

    @Resource
    private ToolManager toolManager;


    private final Cache<String, AiCodeGeneratorService> serviceCache = Caffeine.newBuilder().maximumSize(1000).expireAfterWrite(Duration.ofMinutes(30)).expireAfterAccess(Duration.ofMinutes(10)).removalListener((key, value, cause) -> {
        log.debug("AI 服务实例被移除，key: {}, 原因: {}", key, cause);
    }).build();


    public AiCodeGeneratorService getAiCodeGeneratorService(long appId) {
        // 默认使用 MULTI_FILE 类型
        return getAiCodeGeneratorService(appId, CodeGenTypeEnum.MULTI_FILE);
    }


    /**
     * 创建新的 AI 服务实例
     */
    private AiCodeGeneratorService createAiCodeGeneratorService(long appId, CodeGenTypeEnum codeGenType) {
        // 根据 appId 构建独立的对话记忆
        MessageWindowChatMemory chatMemory = MessageWindowChatMemory.builder().id(appId).chatMemoryStore(redisChatMemoryStore).maxMessages(10).build();
        // 从数据库加载历史对话到记忆中
        chatHistoryService.loadChatHistoryToMemory(appId, chatMemory, 10);
        // 根据代码生成类型选择不同的模型配置
        return switch (codeGenType) {
            // Vue 项目生成使用推理模型
            case VUE_PROJECT, REACT_PROJECT -> {
                StreamingChatModel streamingChatModel = SpringContextUtil.getBean("streamingChatModelPrototype", StreamingChatModel.class);

                yield AiServices.builder(AiCodeGeneratorService.class)
                        .streamingChatModel(streamingChatModel)
                        .chatMemoryProvider(memoryId -> chatMemory)
                        .tools(getLangchainTools())
                        .inputGuardrails(new PromptSafetyInputGuardrail())
                        .maxSequentialToolsInvocations(10)
                        //出路工具调用幻觉问题
                        .hallucinatedToolNameStrategy(toolExecutionRequest ->
                                ToolExecutionResultMessage.from(
                                        toolExecutionRequest, "Error: there is no called" +
                                                toolExecutionRequest.name()
                                )).build();
            }
            case HTML, MULTI_FILE -> {
                StreamingChatModel openAiModel = SpringContextUtil.getBean("streamingChatModelPrototype", StreamingChatModel.class);
                yield AiServices.builder(AiCodeGeneratorService.class)
                        .chatModel(ollamaChatModel)
                        .streamingChatModel(openAiModel)
                        .chatMemory(chatMemory)
//                        .inputGuardrails(new PromptSafetyInputGuardrail())
                        .build();
            }
            default ->
                    throw new BusinessException(ErrorCode.SYSTEM_ERROR, "不支持的代码生成类型: " + codeGenType.getValue());
        };
    }

    /**
     * 根据 appId 和代码生成类型获取服务（带缓存）
     */
    public AiCodeGeneratorService getAiCodeGeneratorService(long appId, CodeGenTypeEnum codeGenType) {
        String cacheKey = buildCacheKey(appId, codeGenType);
        return serviceCache.get(cacheKey, key -> createAiCodeGeneratorService(appId, codeGenType));
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
     * 所有工具类
     *
     * @return
     */
    private Object[] getLangchainTools() {
        return new Object[]{
                fileWriteTool,
                fileReadTool,
                fileModifyTool,
                fileDirReadTool,
                fileDeleteTool,
                commandTool
        };
    }

}


