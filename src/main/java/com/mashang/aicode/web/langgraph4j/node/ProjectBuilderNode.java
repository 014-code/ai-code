package com.mashang.aicode.web.langgraph4j.node;

import com.mashang.aicode.web.ai.core.builder.ProjectBuilder;
import com.mashang.aicode.web.ai.model.enums.CodeGenTypeEnum;
import com.mashang.aicode.web.exception.BusinessException;
import com.mashang.aicode.web.exception.ErrorCode;
import com.mashang.aicode.web.langgraph4j.state.WorkflowContext;
import com.mashang.aicode.web.utils.SpringContextUtil;
import lombok.extern.slf4j.Slf4j;
import org.bsc.langgraph4j.action.AsyncNodeAction;
import org.bsc.langgraph4j.prebuilt.MessagesState;

import java.io.File;

import static org.bsc.langgraph4j.action.AsyncNodeAction.node_async;

/**
 * 项目构建节点
 */
@Slf4j
public class ProjectBuilderNode {

    public static AsyncNodeAction<MessagesState<String>> create() {
        return node_async(state -> {
            WorkflowContext context = WorkflowContext.getContext(state);
            log.info("执行节点: 项目构建");


            String generatedCodeDir = context.getGeneratedCodeDir();
            CodeGenTypeEnum generationType = context.getGenerationType();
            String buildResultDir;

            if (generationType == CodeGenTypeEnum.VUE_PROJECT) {
                try {
                    ProjectBuilder vueBuilder = SpringContextUtil.getBean(ProjectBuilder.class);

                    boolean buildSuccess = vueBuilder.buildProject(generatedCodeDir);
                    if (buildSuccess) {

                        buildResultDir = generatedCodeDir + File.separator + "dist";
                        log.info("Vue 项目构建成功，dist 目录: {}", buildResultDir);
                    } else {
                        throw new BusinessException(ErrorCode.SYSTEM_ERROR, "Vue/React 项目构建失败");
                    }
                } catch (Exception e) {
                    log.error("Vue 项目构建异常: {}", e.getMessage(), e);
                    buildResultDir = generatedCodeDir;
                }
            } else {

                buildResultDir = generatedCodeDir;
            }


            context.setCurrentStep("项目构建");
            context.setBuildResultDir(buildResultDir);
            log.info("项目构建节点完成，最终目录: {}", buildResultDir);
            return WorkflowContext.saveContext(context);
        });
    }
}




