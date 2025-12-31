package com.mashang.aicode.web.ai.core.handler;

import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.mashang.aicode.web.ai.core.builder.ProjectBuilder;
import com.mashang.aicode.web.ai.model.enums.CodeGenTypeEnum;
import com.mashang.aicode.web.ai.model.message.*;
import com.mashang.aicode.web.ai.tool.base.BaseTool;
import com.mashang.aicode.web.ai.tool.base.ToolManager;
import com.mashang.aicode.web.constant.AppConstant;
import com.mashang.aicode.web.model.entity.App;
import com.mashang.aicode.web.model.entity.User;
import com.mashang.aicode.web.model.enums.ChatHistoryMessageTypeEnum;
import com.mashang.aicode.web.service.AppService;
import com.mashang.aicode.web.service.ChatHistoryService;

import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;


/**
 * JSON 消息流处理器
 * 处理 VUE/REACT_PROJECT 类型的复杂流式响应，包含工具调用信息
 */
@Slf4j
@Component
public class JsonMessageStreamHandler {

    @Resource
    private ProjectBuilder projectBuilder;

    @Resource
    private ToolManager toolManager;

    @Resource
    @Lazy
    private AppService appService;



    /**
     * 处理 TokenStream（PROJECT）
     * 解析 JSON 消息并重组为完整的响应格式
     *
     * @param originFlux         原始流
     * @param chatHistoryService 聊天历史服务
     * @param appId              应用ID
     * @param loginUser          登录用户
     * @return 处理后的流
     */
    public Flux<String> handle(Flux<String> originFlux, ChatHistoryService chatHistoryService, long appId, User loginUser) {
        log.info("JsonMessageStreamHandler.handle called, appId: {}", appId);
        // 收集数据用于生成后端记忆格式
        StringBuilder chatHistoryStringBuilder = new StringBuilder();
        // 用于跟踪已经见过的工具ID，判断是否是第一次调用
        Set<String> seenToolIds = new HashSet<>();
        // 用于累积工具参数
        Map<String, String> toolArgumentsAccumulator = new HashMap<>();
        return originFlux
                .doOnSubscribe(subscription -> log.info("JsonMessageStreamHandler subscribed, appId: {}", appId))
                .doOnNext(chunk -> log.info("JsonMessageStreamHandler 接收到消息: {}", chunk))
                .map(chunk -> {
                    try {
                        // 解析每个 JSON 消息块
                        String result = handleJsonMessageChunk(chunk, chatHistoryStringBuilder, seenToolIds, toolArgumentsAccumulator);
                        log.info("JsonMessageStreamHandler 处理结果: {}, 原始消息: {}", result, chunk);
                        return result;
                    } catch (Exception e) {
                        // 如果处理单个 chunk 失败，记录错误但继续处理
                        log.warn("处理消息块失败，按普通文本处理: {}", e.getMessage());
                        chatHistoryStringBuilder.append(chunk);
                        return chunk;
                    }
                })
                .doOnComplete(() -> {
                    log.info("JsonMessageStreamHandler 流完成, appId: {}", appId);
                    // 流式响应完成后，添加 AI 消息到对话历史
                    String aiResponse = chatHistoryStringBuilder.toString();
                    chatHistoryService.addChatMessage(appId, aiResponse, ChatHistoryMessageTypeEnum.AI.getValue(), loginUser.getId());
                    // 异步构造 Vue/React 项目
                    String projectDirName = resolveProjectDirName(appId);
                    Path projectPath = Paths.get(AppConstant.CODE_OUTPUT_ROOT_DIR, projectDirName);
                    projectBuilder.buildProjectAsync(projectPath.toString());
                })
                .doOnError(error -> {
                    // 如果AI回复失败，也要记录错误消息
                    log.error("AI 流处理失败，appId: {}, error: {}", appId, error.getMessage(), error);
                    String errorMessage = "AI回复失败: " + error.getMessage();
                    chatHistoryService.addChatMessage(appId, errorMessage, ChatHistoryMessageTypeEnum.AI.getValue(), loginUser.getId());
                });
    }

    private String resolveProjectDirName(long appId) {
        try {
            App app = appService.getById(appId);
            if (app == null || StrUtil.isBlank(app.getCodeGenType())) {
                log.warn("无法获取 appId={} 的项目类型，使用默认目录名", appId);
                return "project_" + appId;
            }
            CodeGenTypeEnum codeGenTypeEnum = CodeGenTypeEnum.getEnumByValue(app.getCodeGenType());
            if (codeGenTypeEnum == null) {
                log.warn("未知的项目类型: {}, appId={}，使用默认目录名", app.getCodeGenType(), appId);
                return "project_" + appId;
            }
            return switch (codeGenTypeEnum) {
                case VUE_PROJECT -> "vue_project_" + appId;
                case REACT_PROJECT -> "react_project_" + appId;
                default -> "project_" + appId;
            };
        } catch (Exception e) {
            log.error("解析项目目录名失败，appId={}，错误: {}", appId, e.getMessage(), e);
            return "project_" + appId;
        }
    }

    /**
     * 解析并收集 TokenStream 数据
     */
    private String handleJsonMessageChunk(String chunk, StringBuilder chatHistoryStringBuilder, Set<String> seenToolIds, Map<String, String> toolArgumentsAccumulator) {
        // 解析 JSON
        StreamMessage streamMessage = JSONUtil.toBean(chunk, StreamMessage.class);
        StreamMessageTypeEnum typeEnum = StreamMessageTypeEnum.getEnumByValue(streamMessage.getType());
        switch (typeEnum) {
            case AI_RESPONSE -> {
                AiResponseMessage aiMessage = JSONUtil.toBean(chunk, AiResponseMessage.class);
                String data = aiMessage.getData();
                // 直接拼接响应
                chatHistoryStringBuilder.append(data);
                return data;
            }
            case TOOL_REQUEST -> {
                ToolRequestMessage toolRequestMessage = JSONUtil.toBean(chunk, ToolRequestMessage.class);
                String toolId = toolRequestMessage.getId();
                String toolName = toolRequestMessage.getName();
                log.info("处理工具请求: toolId={}, toolName={}", toolId, toolName);
                BaseTool tool = toolManager.getTool(toolName);
                log.info("获取工具实例: toolName={}, tool={}", toolName, tool != null ? tool.getClass().getSimpleName() : "null");
                if (toolId != null && !seenToolIds.contains(toolId)) {
                    seenToolIds.add(toolId);
                    if (tool != null) {
                        String response = tool.generateToolRequestResponse();
                        log.info("生成工具请求响应: {}", response);
                        chatHistoryStringBuilder.append(response);
                        return response;
                    } else {
                        log.warn("未找到工具: {}", toolName);
                        String fallbackResponse = String.format("\n\n[工具调用] %s\n\n", toolName);
                        chatHistoryStringBuilder.append(fallbackResponse);
                        return fallbackResponse;
                    }
                } else {
                    log.info("工具ID已存在或为空: toolId={}, seenToolIds={}", toolId, seenToolIds);
                    return "";
                }
            }
            case TOOL_EXECUTED -> {
                ToolExecutedMessage toolExecutedMessage = JSONUtil.toBean(chunk, ToolExecutedMessage.class);
                JSONObject jsonObject = JSONUtil.parseObj(toolExecutedMessage.getArguments());
                // 根据工具名称获取工具实例
                String toolName = toolExecutedMessage.getName();
                BaseTool tool = toolManager.getTool(toolName);
                if (tool != null) {
                    String result = tool.generateToolExecutedResult(jsonObject);
                    // 输出前端和要持久化的内容
                    String output = String.format("\n\n%s\n\n", result);
                    chatHistoryStringBuilder.append(output);
                    return output;
                } else {
                    log.warn("未找到工具: {}", toolName);
                    return "";
                }
            }
            default -> {
                log.error("不支持的消息类型: {}", typeEnum);
                return "";
            }
        }
    }

}


