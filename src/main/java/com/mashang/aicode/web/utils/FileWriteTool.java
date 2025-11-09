package com.mashang.aicode.web.utils;

import com.mashang.aicode.web.ai.model.enums.CodeGenTypeEnum;
import com.mashang.aicode.web.constant.AppConstant;
import com.mashang.aicode.web.model.entity.App;
import com.mashang.aicode.web.service.AppService;
import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;
import dev.langchain4j.agent.tool.ToolMemoryId;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;

/**
 * 写文件工具类
 */
@Slf4j
@Component
public class FileWriteTool {

    private final AppService appService;

    public FileWriteTool(@Lazy AppService appService) {
        this.appService = appService;
    }

    @Tool("写入文件到指定路径")
    public String writeFile(
            @P("文件的相对路径")
            String relativeFilePath,
            @P("要写入文件的内容")
            String content,
            //从ai对话上下文记忆中获取到名称为appId的参数
            @ToolMemoryId Long appId
    ) {
        try {
            Path path = Paths.get(relativeFilePath);
            if (!path.isAbsolute()) {
                // 根据 appId 查询项目类型，确定目录名
                String projectDirName = getProjectDirName(appId);
                Path projectRoot = Paths.get(AppConstant.CODE_OUTPUT_ROOT_DIR, projectDirName);
                path = projectRoot.resolve(relativeFilePath);
            }
            // 创建父目录（如果不存在）
            Path parentDir = path.getParent();
            if (parentDir != null) {
                Files.createDirectories(parentDir);
            }
            // 写入文件内容
            Files.write(path, content.getBytes(),
                    StandardOpenOption.CREATE,
                    StandardOpenOption.TRUNCATE_EXISTING);
            log.info("成功写入文件: {}", path.toAbsolutePath());
            // 注意要返回相对路径，不能让 AI 把文件绝对路径返回给用户
            return "文件写入成功: " + relativeFilePath;
        } catch (IOException e) {
            String errorMessage = "文件写入失败: " + relativeFilePath + ", 错误: " + e.getMessage();
            log.error(errorMessage, e);
            return errorMessage;
        } catch (Exception e) {
            String errorMessage = "文件写入失败: " + relativeFilePath + ", 错误: " + e.getMessage();
            log.error(errorMessage, e);
            return errorMessage;
        }
    }

    /**
     * 根据 appId 获取项目目录名
     * @param appId 应用ID
     * @return 项目目录名，格式为：{项目类型}_{appId}
     */
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
                log.warn("未知的项目类型: {}, appId={}，使用默认目录名", codeGenType, appId);
                return "project_" + appId;
            }
            
            // 根据项目类型返回对应的目录名
            return switch (codeGenTypeEnum) {
                case VUE_PROJECT -> "vue_project_" + appId;
                case REACT_PROJECT -> "react_project_" + appId;
                default -> {
                    log.warn("项目类型 {} 不支持文件写入工具，appId={}", codeGenType, appId);
                    yield "project_" + appId;
                }
            };
        } catch (Exception e) {
            log.error("获取项目目录名失败，appId={}, 错误: {}", appId, e.getMessage(), e);
            // 发生异常时使用默认目录名
            return "project_" + appId;
        }
    }

}
