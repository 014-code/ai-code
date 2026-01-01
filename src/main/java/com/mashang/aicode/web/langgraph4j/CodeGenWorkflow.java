package com.mashang.aicode.web.langgraph4j;

import cn.hutool.json.JSONUtil;
import com.mashang.aicode.web.ai.model.enums.CodeGenTypeEnum;
import com.mashang.aicode.web.exception.BusinessException;
import com.mashang.aicode.web.exception.ErrorCode;
import com.mashang.aicode.web.langgraph4j.model.QualityResult;
import com.mashang.aicode.web.langgraph4j.node.*;
import com.mashang.aicode.web.langgraph4j.state.WorkflowContext;
import lombok.extern.slf4j.Slf4j;
import org.bsc.langgraph4j.CompiledGraph;
import org.bsc.langgraph4j.GraphRepresentation;
import org.bsc.langgraph4j.GraphStateException;
import org.bsc.langgraph4j.NodeOutput;
import org.bsc.langgraph4j.prebuilt.MessagesState;
import org.bsc.langgraph4j.prebuilt.MessagesStateGraph;
import reactor.core.publisher.Flux;

import java.util.Map;

import static org.bsc.langgraph4j.StateGraph.END;
import static org.bsc.langgraph4j.StateGraph.START;
import static org.bsc.langgraph4j.action.AsyncEdgeAction.edge_async;

/**
 * 生成代码整套工作流
 */
@Slf4j
public class CodeGenWorkflow {

    /**
     * 定义工作流配置
     *
     * @return
     */
    public CompiledGraph<MessagesState<String>> createWorkflow() {
        try {
            return new MessagesStateGraph<String>()
                    .addNode("image_collector", ImageCollectorNode.create())
                    .addNode("prompt_enhancer", PromptEnhancerNode.create())
                    .addNode("router", RouterNode.create())
                    //检查之前是否已经存在该项目节点-不然ai没法在原有项目上修改
                    .addNode("existing_project_checker", ExistingProjectCheckerNode.create())
                    .addNode("code_generator", CodeGeneratorNode.create())
                    .addNode("project_builder", ProjectBuilderNode.create())
                    .addNode("code_quality_check", CodeQualityCheckNode.create())

                    .addEdge(START, "image_collector")
                    .addEdge("image_collector", "prompt_enhancer")
                    .addEdge("prompt_enhancer", "router")
                    .addEdge("router", "existing_project_checker")
                    .addEdge("existing_project_checker", "code_generator")

                    // code_generator 只输出到 code_quality_check
                    .addEdge("code_generator", "code_quality_check")

                    // code_quality_check 决定下一步
                    .addConditionalEdges("code_quality_check",
                            edge_async(this::routeAfterQualityCheck),
                            Map.of(
                                    "build", "project_builder",
                                    "skip_build", END,
                                    "fail", "code_generator"  // 回到 code_generator 重试
                            ))

                    // project_builder 完成后结束
                    .addEdge("project_builder", END)

                    .compile();
        } catch (GraphStateException e) {
            log.error("工作流创建失败", e);
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "工作流创建失败: " + e.getMessage());
        }
    }

    /**
     * 执行工作流方法
     *
     * @param originalPrompt
     * @return
     */
    public WorkflowContext executeWorkflow(String originalPrompt, Long appId) {
        CompiledGraph<MessagesState<String>> workflow = createWorkflow();


        WorkflowContext initialContext = WorkflowContext.builder()
                .originalPrompt(originalPrompt)
                .appId(appId != null ? appId : 0L)
                .currentStep("初始化")
                .build();

        GraphRepresentation graph = workflow.getGraph(GraphRepresentation.Type.MERMAID);
        log.info("工作流图:\n{}", graph.content());
        log.info("开始执行代码生成工作流");

        WorkflowContext finalContext = null;
        int stepCounter = 1;
        for (NodeOutput<MessagesState<String>> step : workflow.stream(
                Map.of(WorkflowContext.WORKFLOW_CONTEXT_KEY, initialContext))) {
            log.info("--- 第 {} 步完成 ---", stepCounter);

            WorkflowContext currentContext = WorkflowContext.getContext(step.state());
            if (currentContext != null) {
                finalContext = currentContext;
                log.info("当前步骤上下文: {}", currentContext);
            }
            stepCounter++;
        }
        log.info("代码生成工作流执行完成！");
        return finalContext;
    }

    /**
     * 是否需要进行npm构建
     *
     * @param state
     * @return
     */
    private String routeBuildOrSkip(MessagesState<String> state) {
        WorkflowContext context = WorkflowContext.getContext(state);
        CodeGenTypeEnum generationType = context.getGenerationType();
        //原生类跳过项目构建这个节点
        if (generationType == CodeGenTypeEnum.HTML || generationType == CodeGenTypeEnum.MULTI_FILE) {
            return "skip_build";
        }

        return "build";
    }

    /**
     * 通过校验结果对返回是否需要重新生成代码
     *
     * @param state
     * @return
     */
    private String routeAfterQualityCheck(MessagesState<String> state) {
        WorkflowContext context = WorkflowContext.getContext(state);
        QualityResult qualityResult = context.getQualityResult();

        if (qualityResult == null || !qualityResult.getIsValid()) {
            log.error("代码质检失败，需要重新生成代码");
            return "fail";
        }

        log.info("代码质检通过，继续后续流程");
        return routeBuildOrSkip(state);
    }

    /**
     * 工作流sse输出方法
     *
     * @param originalPrompt
     * @return
     */
    public Flux<String> executeWorkflowWithFlux(String originalPrompt, Long appId) {
        return Flux.push(sink -> {
            Thread.startVirtualThread(() -> {
                try {
                    WorkflowContextHolder.setContext(WorkflowContextHolder.WorkflowContext.builder()
                            .sseMessageCallback(message -> sink.next(message))
                            .build());

                    CompiledGraph<MessagesState<String>> workflow = createWorkflow();
                    WorkflowContext initialContext = WorkflowContext.builder()
                            .originalPrompt(originalPrompt)
                            .appId(appId != null ? appId : 0L)
                            .currentStep("初始化")
                            .build();
                    sink.next(formatSseEvent("workflow_start", "开始执行代码生成工作流"));
                    GraphRepresentation graph = workflow.getGraph(GraphRepresentation.Type.MERMAID);
                    log.info("工作流图:\n{}", graph.content());

                    int stepCounter = 1;
                    for (NodeOutput<MessagesState<String>> step : workflow.stream(
                            Map.of(WorkflowContext.WORKFLOW_CONTEXT_KEY, initialContext))) {
                        log.info("--- 第 {} 步完成 ---", stepCounter);
                        WorkflowContext currentContext = WorkflowContext.getContext(step.state());
                        if (currentContext != null) {
                            String sseEvent = formatSseEvent("step_completed", 
                                    "第 " + stepCounter + " 步完成: " + currentContext.getCurrentStep());
                            sink.next(sseEvent);
                            log.info("当前步骤上下文: {}", currentContext);
                        }
                        stepCounter++;
                    }
                    sink.next(formatSseEvent("workflow_completed", "代码生成工作流执行完成！"));
                    log.info("代码生成工作流执行完成！");
                    sink.complete();
                } catch (Exception e) {
                    log.error("工作流执行失败: {}", e.getMessage(), e);
                    sink.next(formatSseEvent("workflow_error", Map.of(
                            "error", e.getMessage(),
                            "message", "工作流执行失败"
                    )));
                    sink.error(e);
                } finally {
                    WorkflowContextHolder.clearContext();
                }
            });
        });
    }


    /**
     * sse信息格式化方法
     *
     * @param eventType
     * @param data
     * @return
     */
    private String formatSseEvent(String eventType, Object data) {
        try {
            String jsonData;
            if (data instanceof String) {
                jsonData = JSONUtil.toJsonStr(Map.of("message", data));
            } else {
                jsonData = JSONUtil.toJsonStr(data);
            }
            return "event: " + eventType + "\ndata: " + jsonData + "\n\n";
        } catch (Exception e) {
            log.error("格式化 SSE 事件失败: {}", e.getMessage(), e);
            return "event: error\ndata: {\"error\":\"格式化失败\"}\n\n";
        }
    }


}




