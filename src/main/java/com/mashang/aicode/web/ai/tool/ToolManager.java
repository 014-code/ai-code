package com.mashang.aicode.web.ai.tool;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class ToolManager {


    private final Map<String, BaseTool> toolMap = new HashMap<>();


    @Resource
    private BaseTool[] tools;


    @PostConstruct
    public void initTools() {
        for (BaseTool tool : tools) {
            toolMap.put(tool.getToolName(), tool);
            log.info("注册工具: {} -> {}", tool.getToolName(), tool.getDisplayName());
        }
        log.info("工具管理器初始化完成，共注册 {} 个工具", toolMap.size());
    }


    public BaseTool getTool(String toolName) {
        return toolMap.get(toolName);
    }


    public BaseTool[] getAllTools() {
        return tools;
    }
}


