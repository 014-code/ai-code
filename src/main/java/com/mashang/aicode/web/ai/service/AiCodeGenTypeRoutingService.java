package com.mashang.aicode.web.ai.service;

import com.mashang.aicode.web.ai.model.enums.CodeGenTypeEnum;
import com.mashang.aicode.web.model.enums.AppTypeEnum;
import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.V;

public interface AiCodeGenTypeRoutingService {

    /**
     * 智能路由选择方法
     *
     * @param userPrompt
     * @return
     */
    @SystemMessage(fromResource = "prompt/codegen-routing-system-prompt.txt")
    CodeGenTypeEnum routeCodeGenType(String userPrompt);

    /**
     * 智能应用类型选择方法
     *
     * @param appName 应用名称
     * @return
     */
    @SystemMessage(fromResource = "prompt/appname-routing-system-prompt.txt")
    @UserMessage("应用名称：{{appName}}，用户需求：{{userPrompt}}")
    AppTypeEnum routeAppType(@V("appName") String appName, @V("userPrompt") String userPrompt);
}


