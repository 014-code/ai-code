package com.mashang.aicode.web.langgraph4j.node;

import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.StrUtil;
import com.mashang.aicode.web.langgraph4j.ai.CodeQualityCheckService;
import com.mashang.aicode.web.langgraph4j.model.QualityResult;
import com.mashang.aicode.web.langgraph4j.state.WorkflowContext;
import com.mashang.aicode.web.utils.SpringContextUtil;
import lombok.extern.slf4j.Slf4j;
import org.bsc.langgraph4j.action.AsyncNodeAction;
import org.bsc.langgraph4j.prebuilt.MessagesState;

import java.io.File;
import java.util.Arrays;
import java.util.List;

import static org.bsc.langgraph4j.action.AsyncNodeAction.node_async;

/**
 * 代码质量检查工作节点
 */
@Slf4j
public class CodeQualityCheckNode {

    /**
     * 代码质量检查节点
     *
     * @return
     */
    public static AsyncNodeAction<MessagesState<String>> create() {
        return node_async(state -> {
            WorkflowContext context = WorkflowContext.getContext(state);
            log.info("执行节点: 代码质量检查");
            String generatedCodeDir = context.getGeneratedCodeDir();
            QualityResult qualityResult;
            try {
                //读取代码文件内容
                String codeContent = readAndConcatenateCodeFiles(generatedCodeDir);
                if (StrUtil.isBlank(codeContent)) {
                    log.warn("未找到可检查的代码文件");
                    qualityResult = QualityResult.builder().isValid(false).errors(List.of("未找到可检查的代码文件")).suggestions(List.of("请确保代码生成成功")).build();
                } else {

                    CodeQualityCheckService qualityCheckService = SpringContextUtil.getBean(CodeQualityCheckService.class);
                    //ai返回检查结果
                    qualityResult = qualityCheckService.checkCodeQuality(codeContent);
                    log.info("代码质量检查完成 - 是否通过: {}", qualityResult.getIsValid());
                }
            } catch (Exception e) {
                log.error("代码质量检查异常: {}", e.getMessage(), e);
                qualityResult = QualityResult.builder().isValid(true).build();

            }
            //有问题则构建出相关信息塞到建议里面，然后工作流往下执行就会调用代码修改
            String userMessage = buildUserMessage(context);
            qualityResult.setSuggestions(List.of(userMessage));
            context.setCurrentStep("代码质量检查");
            context.setQualityResult(qualityResult);
            return WorkflowContext.saveContext(context);
        });
    }

    /**
     * 需要检查的文件后缀
     */
    private static final List<String> CODE_EXTENSIONS = Arrays.asList(".html", ".htm", ".css", ".js", ".json", ".vue", ".ts", ".jsx", ".tsx");

    /**
     * 读取代码文件方法
     *
     * @param codeDir
     * @return
     */
    private static String readAndConcatenateCodeFiles(String codeDir) {
        if (StrUtil.isBlank(codeDir)) {
            return "";
        }
        File directory = new File(codeDir);
        if (!directory.exists() || !directory.isDirectory()) {
            log.error("代码目录不存在或不是目录: {}", codeDir);
            return "";
        }
        StringBuilder codeContent = new StringBuilder();
        codeContent.append("# 项目文件结构和代码内容\n\n");

        FileUtil.walkFiles(directory, file -> {

            if (shouldSkipFile(file, directory)) {
                return;
            }
            if (isCodeFile(file)) {
                String relativePath = FileUtil.subPath(directory.getAbsolutePath(), file.getAbsolutePath());
                codeContent.append("## 文件: ").append(relativePath).append("\n\n");
                String fileContent = FileUtil.readUtf8String(file);
                codeContent.append(fileContent).append("\n\n");
            }
        });
        return codeContent.toString();
    }

    /**
     * 是否跳过文件
     *
     * @param file
     * @param rootDir
     * @return
     */
    private static boolean shouldSkipFile(File file, File rootDir) {
        String relativePath = FileUtil.subPath(rootDir.getAbsolutePath(), file.getAbsolutePath());

        if (file.getName().startsWith(".")) {
            return true;
        }
        //跳过这些配置相关文件
        return relativePath.contains("node_modules" + File.separator) || relativePath.contains("dist" + File.separator) || relativePath.contains("target" + File.separator) || relativePath.contains(".git" + File.separator);
    }

    /**
     * 校验是否为代码文件
     *
     * @param file
     * @return
     */
    private static boolean isCodeFile(File file) {
        String fileName = file.getName().toLowerCase();
        return CODE_EXTENSIONS.stream().anyMatch(fileName::endsWith);
    }

    /**
     * 构造有问题代码内容和用户提示词
     *
     * @param context
     * @return
     */
    private static String buildUserMessage(WorkflowContext context) {
        String userMessage = context.getEnhancedPrompt();

        QualityResult qualityResult = context.getQualityResult();
        //如果有问题就进行拼接建议，没的话就返回ai给的原始建议内容
        if (isQualityCheckFailed(qualityResult)) {

            userMessage = buildErrorFixPrompt(qualityResult);
        }
        return userMessage;
    }

    /**
     * 校验代码是否有误，有的话就调用ai修改代码
     *
     * @param qualityResult
     * @return
     */
    private static boolean isQualityCheckFailed(QualityResult qualityResult) {
        return qualityResult != null && !qualityResult.getIsValid() && qualityResult.getErrors() != null && !qualityResult.getErrors().isEmpty();
    }

    /**
     * 修复错误提示词构造方法
     *
     * @param qualityResult
     * @return
     */
    private static String buildErrorFixPrompt(QualityResult qualityResult) {
        StringBuilder errorInfo = new StringBuilder();
        errorInfo.append("\n\n## 上次生成的代码存在以下问题，请修复：\n");

        qualityResult.getErrors().forEach(error -> errorInfo.append("- ").append(error).append("\n"));

        if (qualityResult.getSuggestions() != null && !qualityResult.getSuggestions().isEmpty()) {
            errorInfo.append("\n## 修复建议：\n");
            qualityResult.getSuggestions().forEach(suggestion -> errorInfo.append("- ").append(suggestion).append("\n"));
        }
        errorInfo.append("\n请根据上述问题和建议重新生成代码，确保修复所有提到的问题。");
        return errorInfo.toString();
    }


}


