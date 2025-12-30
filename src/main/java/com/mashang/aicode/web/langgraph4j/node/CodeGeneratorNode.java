package com.mashang.aicode.web.langgraph4j.node;

import com.mashang.aicode.web.ai.core.AiCodeGeneratorFacade;
import com.mashang.aicode.web.ai.model.enums.CodeGenTypeEnum;
import com.mashang.aicode.web.constant.AppConstant;
import com.mashang.aicode.web.langgraph4j.state.WorkflowContext;
import com.mashang.aicode.web.monitor.MonitorContext;
import com.mashang.aicode.web.monitor.MonitorContextHolder;
import com.mashang.aicode.web.model.entity.App;
import com.mashang.aicode.web.service.AppService;
import com.mashang.aicode.web.utils.SpringContextUtil;
import lombok.extern.slf4j.Slf4j;
import org.bsc.langgraph4j.action.AsyncNodeAction;
import org.bsc.langgraph4j.prebuilt.MessagesState;
import reactor.core.publisher.Flux;

import java.time.Duration;

import static org.bsc.langgraph4j.action.AsyncNodeAction.node_async;

/**
 * 代码生成节点
 */
@Slf4j
public class CodeGeneratorNode {

    public static AsyncNodeAction<MessagesState<String>> create() {
        return node_async(state -> {
            WorkflowContext context = WorkflowContext.getContext(state);
            log.info("执行节点: 代码生成");


            String userMessage = context.getEnhancedPrompt();
            CodeGenTypeEnum generationType = context.getGenerationType();

            AiCodeGeneratorFacade codeGeneratorFacade = SpringContextUtil.getBean(AiCodeGeneratorFacade.class);
            log.info("开始生成代码，类型: {} ({})", generationType.getValue(), generationType.getText());

            Long appId = context.getAppId() != null ? context.getAppId() : 0L;
            log.info("使用 appId: {}", appId);

            // 设置监控上下文以便可观测性记录
            try {
                AppService appService = SpringContextUtil.getBean(AppService.class);
                App app = appService.getById(appId);
                if (app != null && app.getUserId() != null) {
                    MonitorContextHolder.setContext(
                            MonitorContext.builder()
                                    .userId(app.getUserId().toString())
                                    .appId(appId.toString())
                                    .build()
                    );
                    log.info("已设置监控上下文: userId={}, appId={}", app.getUserId(), appId);
                } else {
                    log.warn("无法获取应用信息，appId={}，将跳过监控记录", appId);
                }
            } catch (Exception e) {
                log.warn("设置监控上下文失败，将跳过监控记录: {}", e.getMessage());
            }

            try {
                Flux<String> codeStream = codeGeneratorFacade.generateAndSaveCodeStream(userMessage, generationType, appId);

                codeStream.blockLast(Duration.ofMinutes(10));
            } finally {
                // 清除监控上下文
                MonitorContextHolder.clearContext();
            }

            String generatedCodeDir = String.format("%s/%s_%s", AppConstant.CODE_OUTPUT_ROOT_DIR, generationType.getValue(), appId);
            log.info("AI 代码生成完成，生成目录: {}", generatedCodeDir);


            context.setCurrentStep("代码生成");
            context.setGeneratedCodeDir(generatedCodeDir);
            return WorkflowContext.saveContext(context);
        });
    }
}




