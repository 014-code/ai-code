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
import java.util.HashSet;
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
        // 收集数据用于生成后端记忆格式
        StringBuilder chatHistoryStringBuilder = new StringBuilder();
        // 用于跟踪已经见过的工具ID，判断是否是第一次调用
        Set<String> seenToolIds = new HashSet<>();
        return originFlux.map(chunk -> {
                    // 解析每个 JSON 消息块
                    return handleJsonMessageChunk(chunk, chatHistoryStringBuilder, seenToolIds);
                }).filter(StrUtil::isNotEmpty) // 过滤空字串
                .doOnComplete(() -> {
                    // 流式响应完成后，添加 AI 消息到对话历史
                    String aiResponse = chatHistoryStringBuilder.toString();
                    chatHistoryService.addChatMessage(appId, aiResponse, ChatHistoryMessageTypeEnum.AI.getValue(), loginUser.getId());
                    // 异步构造 Vue/React 项目
                    String projectDirName = resolveProjectDirName(appId);
                    Path projectPath = Paths.get(AppConstant.CODE_OUTPUT_ROOT_DIR, projectDirName);
                    projectBuilder.buildProjectAsync(projectPath.toString());

                }).doOnError(error -> {
                    // 如果AI回复失败，也要记录错误消息
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
    private String handleJsonMessageChunk(String chunk, StringBuilder chatHistoryStringBuilder, Set<String> seenToolIds) {

        if (StrUtil.isBlank(chunk)) {
            return "";
        }

        log.info("块对象json是 {}", chunk);

        String normalizedChunk = StrUtil.trim(chunk);
        if (!JSONUtil.isJsonObj(normalizedChunk)) {
            chatHistoryStringBuilder.append(chunk);
            return chunk;
        }

        try {
            StreamMessage streamMessage = JSONUtil.toBean(normalizedChunk, StreamMessage.class);
            StreamMessageTypeEnum typeEnum = StreamMessageTypeEnum.getEnumByValue(streamMessage.getType());
            switch (typeEnum) {
                case AI_RESPONSE -> {
                    AiResponseMessage aiMessage = JSONUtil.toBean(normalizedChunk, AiResponseMessage.class);
                    String data = aiMessage.getData();
                    chatHistoryStringBuilder.append(data);
                    return data;
                }
                case TOOL_REQUEST -> {
                    ToolRequestMessage toolRequestMessage = JSONUtil.toBean(normalizedChunk, ToolRequestMessage.class);
                    String toolId = toolRequestMessage.getId();
                    String toolName = toolRequestMessage.getName();

                    if (toolId != null && !seenToolIds.contains(toolId)) {
                        seenToolIds.add(toolId);
                        BaseTool tool = toolManager.getTool(toolName);
                        return tool.generateToolRequestResponse();
                    }
                    return "";
                }
                case TOOL_EXECUTED -> {
                    ToolExecutedMessage toolExecutedMessage = JSONUtil.toBean(normalizedChunk, ToolExecutedMessage.class);
                    String toolName = toolExecutedMessage.getName();
                    JSONObject jsonObject = JSONUtil.parseObj(toolExecutedMessage.getArguments());

                    BaseTool tool = toolManager.getTool(toolName);
                    String result = tool.generateToolExecutedResult(jsonObject);

                    String output = String.format("\n\n%s\n\n", result);
                    chatHistoryStringBuilder.append(output);
                    return output;
                }
                default -> {
                    log.error("不支持的消息类型: {}", typeEnum);
                    return "";
                }
            }
        } catch (Exception parseException) {
            log.warn("解析 JSON 块失败，按普通文本处理: {}", parseException.getMessage());
            chatHistoryStringBuilder.append(chunk);
            return chunk;
        }
    }

}


