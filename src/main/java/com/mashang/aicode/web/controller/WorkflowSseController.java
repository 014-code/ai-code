package com.mashang.aicode.web.controller;

import com.mashang.aicode.web.langgraph4j.CodeGenWorkflow;
import com.mashang.aicode.web.langgraph4j.state.WorkflowContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/workflow")
@Slf4j
public class WorkflowSseController {


    @PostMapping("/execute")
    public WorkflowContext executeWorkflow(@RequestParam String prompt, @RequestParam(required = false) Long appId) {
        log.info("收到同步工作流执行请求: prompt={}, appId={}", prompt, appId);
        return new CodeGenWorkflow().executeWorkflow(prompt, appId);
    }


    @GetMapping(value = "/execute-flux", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> executeWorkflowWithFlux(@RequestParam String prompt, @RequestParam Long appId) {
        log.info("收到 Flux 工作流执行请求: prompt={}, appId={}", prompt, appId);
        return new CodeGenWorkflow().executeWorkflowWithFlux(prompt, appId);
    }
}


