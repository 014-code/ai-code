package com.mashang.aicode.web.ai.tool;

import cn.hutool.json.JSONObject;
import com.mashang.aicode.web.ai.model.enums.CodeGenTypeEnum;
import com.mashang.aicode.web.constant.AppConstant;
import com.mashang.aicode.web.model.entity.App;
import com.mashang.aicode.web.service.AppService;
import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;
import dev.langchain4j.agent.tool.ToolMemoryId;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.nio.file.Paths;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
public class CommandTool extends BaseTool {

    private final AppService appService;

    public CommandTool(@Lazy AppService appService) {
        this.appService = appService;
    }

    @Tool("执行终端命令工具")
    public String executeCommand(@P("要执行的命令，如 'npm install' 或 'cd project'") String command, @ToolMemoryId Long appId) {
        try {
            log.info("执行命令: {}", command);

            // 根据操作系统选择命令执行方式
            ProcessBuilder processBuilder;
            if (System.getProperty("os.name").toLowerCase().contains("win")) {
                processBuilder = new ProcessBuilder("cmd.exe", "/c", command);
            } else {
                processBuilder = new ProcessBuilder("sh", "-c", command);
            }

            // 设置工作目录
            if (appId != null) {
                String projectDirName = getProjectDirName(appId);
                File projectDir = Paths.get(AppConstant.CODE_OUTPUT_ROOT_DIR, projectDirName).toFile();
                processBuilder.directory(projectDir);
                log.info("设置工作目录: {}", projectDir.getAbsolutePath());
            }

            processBuilder.redirectErrorStream(true);
            Process process = processBuilder.start();

            // 读取命令输出
            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }

            // 等待命令执行完成（最多10分钟）
            boolean finished = process.waitFor(10, TimeUnit.MINUTES);
            if (!finished) {
                process.destroyForcibly();
                return "错误：命令执行超时（10分钟）";
            }

            int exitCode = process.exitValue();
            String result = "命令执行完成。退出码: " + exitCode + "\n输出:\n" + output.toString();

            log.info("命令执行结果: 退出码={}", exitCode);
            return result;

        } catch (Exception e) {
            log.error("执行命令时发生异常", e);
            return "错误：执行命令失败 - " + e.getMessage();
        }
    }

    private String getProjectDirName(Long appId) {
        try {
            App app = appService.getById(appId);
            if (app == null || app.getCodeGenType() == null) {
                log.warn("无法获取 appId={} 的项目类型，使用默认目录名", appId);
                return "project_" + appId;
            }

            String codeGenType = app.getCodeGenType();
            CodeGenTypeEnum codeGenTypeEnum = CodeGenTypeEnum.getEnumByValue(codeGenType);

            if (codeGenTypeEnum == null) {
                log.warn("未知的代码生成类型: {}，使用默认目录名", codeGenType);
                return "project_" + appId;
            }

            return codeGenTypeEnum.getValue() + "_" + appId;

        } catch (Exception e) {
            log.error("获取项目目录名时发生异常", e);
            return "project_" + appId;
        }
    }

    @Override
    public String getToolName() {
        return "executeCommand";
    }

    @Override
    public String getDisplayName() {
        return "执行命令";
    }

    @Override
    public String generateToolExecutedResult(JSONObject arguments) {
        String command = arguments.getStr("command");
        return String.format("[工具调用] %s %s", getDisplayName(), command);
    }
}