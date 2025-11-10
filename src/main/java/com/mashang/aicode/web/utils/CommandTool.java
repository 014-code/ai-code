package com.mashang.aicode.web.utils;

import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;
import dev.langchain4j.agent.tool.ToolMemoryId;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
public class CommandTool {

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

            // 设置工作目录（可选，根据appId设置特定目录）
            if (appId != null) {
                processBuilder.directory(new java.io.File("/path/to/workspace/" + appId));
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
}