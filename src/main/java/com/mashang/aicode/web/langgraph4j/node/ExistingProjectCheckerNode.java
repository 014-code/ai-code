package com.mashang.aicode.web.langgraph4j.node;

import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.StrUtil;
import com.mashang.aicode.web.ai.model.enums.CodeGenTypeEnum;
import com.mashang.aicode.web.constant.AppConstant;
import com.mashang.aicode.web.langgraph4j.state.WorkflowContext;
import lombok.extern.slf4j.Slf4j;
import org.bsc.langgraph4j.action.AsyncNodeAction;
import org.bsc.langgraph4j.prebuilt.MessagesState;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;

import static org.bsc.langgraph4j.action.AsyncNodeAction.node_async;

/**
 * 现有项目检查节点
 * 检查项目目录是否存在，如果存在则读取现有代码信息并添加到 prompt 中
 */
@Slf4j
public class ExistingProjectCheckerNode {

    /**
     * 需要读取的代码文件后缀
     */
    private static final List<String> CODE_EXTENSIONS = Arrays.asList(
            ".html", ".htm", ".css", ".js", ".json", ".vue", ".ts", ".jsx", ".tsx", ".java", ".py"
    );

    /**
     * 需要跳过的目录
     */
    private static final List<String> SKIP_DIRS = Arrays.asList(
            "node_modules", ".git", "dist", "build", "target", ".idea", ".vscode", "coverage"
    );

    public static AsyncNodeAction<MessagesState<String>> create() {
        return node_async(state -> {
            WorkflowContext context = WorkflowContext.getContext(state);
            log.info("执行节点: 现有项目检查");

            Long appId = context.getAppId();
            CodeGenTypeEnum generationType = context.getGenerationType();
            String enhancedPrompt = context.getEnhancedPrompt();

            if (appId == null || appId == 0L) {
                log.info("appId 为空或为 0，跳过现有项目检查");
                context.setCurrentStep("现有项目检查");
                return WorkflowContext.saveContext(context);
            }

            // 根据项目类型构建项目目录路径
            String projectDirName = getProjectDirName(generationType, appId);
            Path projectPath = Paths.get(AppConstant.CODE_OUTPUT_ROOT_DIR, projectDirName);
            File projectDir = projectPath.toFile();

            if (!projectDir.exists() || !projectDir.isDirectory()) {
                log.info("项目目录不存在: {}，将创建新项目", projectPath);
                context.setCurrentStep("现有项目检查");
                return WorkflowContext.saveContext(context);
            }

            log.info("检测到现有项目目录: {}，开始读取现有代码信息", projectPath);

            // 读取现有项目信息
            String existingProjectInfo = readExistingProjectInfo(projectDir);

            if (StrUtil.isNotBlank(existingProjectInfo)) {
                // 将现有项目信息添加到 prompt 中
                StringBuilder updatedPrompt = new StringBuilder();
                updatedPrompt.append("## 重要提示：这是对现有项目的修改请求\n\n");
                updatedPrompt.append("当前项目已存在，你需要在现有代码基础上进行修改，而不是从零开始创建。\n\n");
                updatedPrompt.append("### 现有项目信息\n\n");
                updatedPrompt.append(existingProjectInfo);
                updatedPrompt.append("\n\n### 用户修改需求\n\n");
                updatedPrompt.append(enhancedPrompt);

                context.setEnhancedPrompt(updatedPrompt.toString());
                log.info("已更新 prompt，包含现有项目信息，总长度: {} 字符", updatedPrompt.length());
            } else {
                log.warn("项目目录存在但无法读取项目信息");
            }

            context.setCurrentStep("现有项目检查");
            return WorkflowContext.saveContext(context);
        });
    }

    /**
     * 根据项目类型和 appId 获取项目目录名
     */
    private static String getProjectDirName(CodeGenTypeEnum generationType, Long appId) {
        if (generationType == null) {
            return "project_" + appId;
        }
        return switch (generationType) {
            case VUE_PROJECT -> "vue_project_" + appId;
            case REACT_PROJECT -> "react_project_" + appId;
            case HTML -> "html_" + appId;
            case MULTI_FILE -> "multi_file_" + appId;
            default -> "project_" + appId;
        };
    }

    /**
     * 读取现有项目信息
     * 读取项目结构和关键文件内容
     */
    private static String readExistingProjectInfo(File projectDir) {
        StringBuilder info = new StringBuilder();
        info.append("### 项目目录结构\n\n");
        info.append("```\n");

        // 读取项目结构
        readDirectoryStructure(projectDir, projectDir, info, 0, 0);

        info.append("```\n\n");

        // 读取关键文件内容（限制文件数量和大小）
        info.append("### 关键文件内容\n\n");
        int fileCount = 0;
        int maxFiles = 10; // 最多读取 10 个关键文件
        int maxFileSize = 5000; // 每个文件最多 5000 字符

        List<File> allFiles = FileUtil.loopFiles(projectDir, file -> {
            if (shouldSkipFile(file, projectDir)) {
                return false;
            }
            return isCodeFile(file);
        });

        // 优先读取关键文件（package.json, 入口文件等）
        allFiles.sort((f1, f2) -> {
            String name1 = f1.getName().toLowerCase();
            String name2 = f2.getName().toLowerCase();
            int priority1 = getFilePriority(name1);
            int priority2 = getFilePriority(name2);
            if (priority1 != priority2) {
                return Integer.compare(priority2, priority1); // 优先级高的在前
            }
            return f1.getPath().compareTo(f2.getPath());
        });

        for (File file : allFiles) {
            if (fileCount >= maxFiles) {
                break;
            }
            try {
                String relativePath = FileUtil.subPath(projectDir.getAbsolutePath(), file.getAbsolutePath());
                String content = FileUtil.readUtf8String(file);
                
                // 限制文件大小
                if (content.length() > maxFileSize) {
                    content = content.substring(0, maxFileSize) + "\n\n... (文件内容过长，已截断)";
                }

                info.append("#### 文件: ").append(relativePath).append("\n\n");
                info.append("```\n");
                info.append(content);
                info.append("\n```\n\n");
                fileCount++;
            } catch (Exception e) {
                log.warn("读取文件失败: {}, 错误: {}", file.getAbsolutePath(), e.getMessage());
            }
        }

        if (fileCount == 0) {
            info.append("未找到可读取的代码文件\n\n");
        } else if (allFiles.size() > maxFiles) {
            info.append(String.format("\n注意：项目共有 %d 个代码文件，仅展示了前 %d 个关键文件。\n\n", allFiles.size(), maxFiles));
        }

        return info.toString();
    }

    /**
     * 读取目录结构
     */
    private static void readDirectoryStructure(File rootDir, File currentDir, StringBuilder info, int depth, int maxDepth) {
        if (depth > maxDepth && maxDepth > 0) {
            return;
        }

        File[] files = currentDir.listFiles();
        if (files == null) {
            return;
        }

        for (File file : files) {
            String fileName = file.getName();
            
            // 跳过隐藏文件和特定目录
            if (fileName.startsWith(".") || shouldSkipDir(fileName)) {
                continue;
            }

            String relativePath = FileUtil.subPath(rootDir.getAbsolutePath(), file.getAbsolutePath());
            String indent = "  ".repeat(depth);
            
            if (file.isDirectory()) {
                info.append(indent).append("📁 ").append(fileName).append("/\n");
                // 递归读取子目录（限制深度）
                if (depth < 3) { // 最多显示 3 层深度
                    readDirectoryStructure(rootDir, file, info, depth + 1, maxDepth);
                }
            } else {
                info.append(indent).append("📄 ").append(fileName).append("\n");
            }
        }
    }

    /**
     * 判断是否应该跳过文件
     */
    private static boolean shouldSkipFile(File file, File rootDir) {
        String relativePath = FileUtil.subPath(rootDir.getAbsolutePath(), file.getAbsolutePath());
        
        // 跳过隐藏文件
        if (file.getName().startsWith(".")) {
            return true;
        }
        
        // 跳过特定目录中的文件
        for (String skipDir : SKIP_DIRS) {
            if (relativePath.contains(skipDir + File.separator)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * 判断是否应该跳过目录
     */
    private static boolean shouldSkipDir(String dirName) {
        return SKIP_DIRS.contains(dirName);
    }

    /**
     * 判断是否为代码文件
     */
    private static boolean isCodeFile(File file) {
        String fileName = file.getName().toLowerCase();
        return CODE_EXTENSIONS.stream().anyMatch(fileName::endsWith);
    }

    /**
     * 获取文件优先级（用于排序）
     */
    private static int getFilePriority(String fileName) {
        if (fileName.equals("package.json") || fileName.equals("package-lock.json")) {
            return 10;
        }
        if (fileName.equals("vite.config.js") || fileName.equals("vite.config.ts")) {
            return 9;
        }
        if (fileName.equals("index.html")) {
            return 8;
        }
        if (fileName.contains("main.") || fileName.contains("app.") || fileName.contains("index.")) {
            return 7;
        }
        if (fileName.endsWith(".vue") || fileName.endsWith(".jsx") || fileName.endsWith(".tsx")) {
            return 6;
        }
        if (fileName.endsWith(".js") || fileName.endsWith(".ts")) {
            return 5;
        }
        return 1;
    }
}

