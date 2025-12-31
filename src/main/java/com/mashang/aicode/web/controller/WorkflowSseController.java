package com.mashang.aicode.web.controller;

import cn.hutool.json.JSONUtil;
import com.mashang.aicode.web.ai.model.enums.CodeGenTypeEnum;
import com.mashang.aicode.web.constant.AppConstant;
import com.mashang.aicode.web.langgraph4j.CodeGenWorkflow;
import com.mashang.aicode.web.langgraph4j.state.WorkflowContext;
import com.mashang.aicode.web.model.entity.App;
import com.mashang.aicode.web.model.entity.User;
import com.mashang.aicode.web.service.AppService;
import com.mashang.aicode.web.service.UserService;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

@RestController
@RequestMapping("/workflow")
@Slf4j
public class WorkflowSseController {

    @Resource
    private AppService appService;

    @Resource
    private UserService userService;

    @PostMapping("/execute")
    public WorkflowContext executeWorkflow(@RequestParam String prompt, 
                                          @RequestParam(required = false) Long appId,
                                          HttpServletRequest request) {
        log.info("收到同步工作流执行请求: prompt={}, appId={}", prompt, appId);
    
        
        return new CodeGenWorkflow().executeWorkflow(prompt, appId);
    }


    @GetMapping(value = "/execute-flux", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> executeWorkflowWithFlux(@RequestParam String prompt, 
                                                                  @RequestParam(required = false) Long appId,
                                                                  HttpServletRequest request) {
        log.info("收到 Flux 工作流执行请求: prompt={}, appId={}", prompt, appId);
        
        // 检查是否是修改现有项目的请求
        if (isModifyExistingProject(appId)) {
            log.info("检测到是修改现有项目，直接调用 AI 服务，跳过工作流");
            // 获取当前登录用户
            User loginUser = userService.getLoginUser(request);
            Flux<String> contentFlux = appService.chatToGenCode(appId, prompt, loginUser);
            return contentFlux
                    .map(chunk -> {
                        Map<String, String> wrapper = Map.of("d", chunk);
                        String jsonData = JSONUtil.toJsonStr(wrapper);
                        return ServerSentEvent.<String>builder()
                                .data(jsonData)
                                .build();
                    })
                    .concatWith(Mono.just(
                            // 发送结束事件
                            ServerSentEvent.<String>builder()
                                    .event("done")
                                    .data("")
                                    .build()
                    ));
        }
        
        // 不是修改项目，走工作流
        // 工作流返回的是字符串格式的 SSE（"event: xxx\ndata: xxx\n\n"），需要转换为 ServerSentEvent
        Flux<String> workflowFlux = new CodeGenWorkflow().executeWorkflowWithFlux(prompt, appId);
        return workflowFlux.flatMap(content -> {
            // 工作流返回的格式是 "event: xxx\ndata: xxx\n\n"，可能包含多行
            // 需要解析并转换为 ServerSentEvent
            if (content.contains("event: ") && content.contains("data: ")) {
                String[] lines = content.split("\n");
                String eventType = null;
                StringBuilder dataBuilder = new StringBuilder();
                boolean inData = false;
                
                for (String line : lines) {
                    if (line.startsWith("event: ")) {
                        eventType = line.substring(7).trim();
                    } else if (line.startsWith("data: ")) {
                        inData = true;
                        String dataLine = line.substring(6);
                        if (dataBuilder.length() > 0) {
                            dataBuilder.append("\n");
                        }
                        dataBuilder.append(dataLine);
                    } else if (inData && !line.trim().isEmpty()) {
                        // 多行数据
                        dataBuilder.append("\n").append(line);
                    }
                }
                
                ServerSentEvent.Builder<String> builder = ServerSentEvent.builder();
                if (eventType != null && !eventType.isEmpty()) {
                    builder.event(eventType);
                }
                String data = dataBuilder.toString();
                if (!data.isEmpty()) {
                    builder.data(data);
                }
                return Mono.just(builder.build());
            } else {
                // 如果不是标准 SSE 格式，直接作为数据返回
                return Mono.just(ServerSentEvent.<String>builder().data(content).build());
            }
        });
    }

    /**
     * 判断是否是修改现有项目的请求
     * @param appId 应用ID
     * @return true 如果是修改现有项目，false 如果是新建项目
     */
    private boolean isModifyExistingProject(Long appId) {
        if (appId == null || appId == 0L) {
            return false;
        }
        
        try {
            App app = appService.getById(appId);
            if (app == null || app.getCodeGenType() == null) {
                return false;
            }
            
            CodeGenTypeEnum codeGenType = CodeGenTypeEnum.getEnumByValue(app.getCodeGenType());
            if (codeGenType == null) {
                return false;
            }
            
            // 根据项目类型构建项目目录路径
            String projectDirName = getProjectDirName(codeGenType, appId);
            Path projectPath = Paths.get(AppConstant.CODE_OUTPUT_ROOT_DIR, projectDirName);
            File projectDir = projectPath.toFile();
            
            // 如果项目目录存在，说明是修改现有项目
            return projectDir.exists() && projectDir.isDirectory();
        } catch (Exception e) {
            log.warn("检查项目是否存在时出错: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 根据项目类型和 appId 获取项目目录名
     */
    private String getProjectDirName(CodeGenTypeEnum generationType, Long appId) {
        return switch (generationType) {
            case VUE_PROJECT -> "vue_project_" + appId;
            case REACT_PROJECT -> "react_project_" + appId;
            case HTML -> "html_" + appId;
            case MULTI_FILE -> "multi_file_" + appId;
            default -> "project_" + appId;
        };
    }
}


