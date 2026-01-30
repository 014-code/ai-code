package com.mashang.aicode.web.langgraph4j.node;

import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONUtil;
import com.mashang.aicode.web.ai.core.AiCodeGeneratorFacade;
import com.mashang.aicode.web.ai.model.enums.CodeGenTypeEnum;
import com.mashang.aicode.web.constant.AppConstant;
import com.mashang.aicode.web.langgraph4j.WorkflowContextHolder;
import com.mashang.aicode.web.langgraph4j.state.WorkflowContext;
import com.mashang.aicode.web.monitor.MonitorContext;
import com.mashang.aicode.web.monitor.MonitorContextHolder;
import com.mashang.aicode.web.model.entity.App;
import com.mashang.aicode.web.model.entity.User;
import com.mashang.aicode.web.service.AppService;
import com.mashang.aicode.web.service.UserService;
import com.mashang.aicode.web.utils.SpringContextUtil;
import lombok.extern.slf4j.Slf4j;
import org.bsc.langgraph4j.action.AsyncNodeAction;
import org.bsc.langgraph4j.prebuilt.MessagesState;
import reactor.core.publisher.Flux;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.function.Consumer;

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

            // 使用增强提示词作为发给 AI 的用户消息
            String userMessage = context.getEnhancedPrompt();
            CodeGenTypeEnum generationType = context.getGenerationType();
            // 获取 AI 代码生成外观服务
            AiCodeGeneratorFacade codeGeneratorFacade = SpringContextUtil.getBean(AiCodeGeneratorFacade.class);

            // 获取用户服务
            UserService userService = SpringContextUtil.getBean(UserService.class);

            // 获取用户信息
            User user = userService.getById(context.getUserId());

            log.info("开始生成代码，类型: {} ({})", generationType.getValue(), generationType.getText());
            // 先使用固定的 appId (后续再整合到业务中)
            // 调用流式代码生成，传入用户ID和用户信息
            Flux<String> codeStream = codeGeneratorFacade.generateAndSaveCodeStream(userMessage, generationType, context.getAppId(), context.getSseMessageCallback(), context.getUserId(), user);
            // 同步等待流式输出完成
            codeStream.blockLast(Duration.ofMinutes(10)); // 最多等待 10 分钟
            // 根据类型设置生成目录
            String generatedCodeDir = String.format("%s/%s_%s", AppConstant.CODE_OUTPUT_ROOT_DIR, generationType.getValue(), context.getAppId());
            log.info("AI 代码生成完成，生成目录: {}", generatedCodeDir);

            // 更新状态
            context.setCurrentStep("代码生成");
            context.setGeneratedCodeDir(generatedCodeDir);
            return WorkflowContext.saveContext(context);
        });
    }
}




