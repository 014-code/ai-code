package com.mashang.aicode.web.ai.service;

import com.mashang.aicode.web.ai.model.HtmlCodeResult;
import com.mashang.aicode.web.ai.model.MultiFileCodeResult;
import dev.langchain4j.service.MemoryId;
import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import reactor.core.publisher.Flux;

public interface AiCodeGeneratorService {

    /**
     * 持久化记忆对话
     *
     * @param memoryId-当个会话id-即单个应用id
     * @param userMessage
     * @return
     */
    @SystemMessage(fromResource = "prompt/codegen-html-system-prompt.txt")
    HtmlCodeResult generateHtmlCode(@MemoryId int memoryId, @UserMessage String userMessage);

    /**
     * 生成代码方法接口
     *
     * @param userMessage
     * @return
     */
    String generateCode(String userMessage);

//    /**
//     * 单文件生成代码
//     * @param userMessage
//     * @return
//     */
//    @SystemMessage(fromResource = "prompt/codegen-html-system-prompt.txt")
//    HtmlCodeResult generateHtmlCode(String userMessage);


    /**
     * 多文件生成代码
     *
     * @param userMessage
     * @return
     */
    @SystemMessage(fromResource = "prompt/codegen-multi-file-system-prompt.txt")
    MultiFileCodeResult generateMultiFileCode(String userMessage);

    /**
     * 流式返回
     *
     * @param userMessage
     * @return
     */
    @SystemMessage(fromResource = "prompt/codegen-html-system-prompt.txt")
    Flux<String> generateHtmlCodeStream(String userMessage);

    /**
     * 流式返回
     *
     * @param userMessage
     * @return
     */
    @SystemMessage(fromResource = "prompt/codegen-multi-file-system-prompt.txt")
    Flux<String> generateMultiFileCodeStream(String userMessage);

    /**
     * 生成 Vue 项目代码（流式）
     *
     * @param userMessage 用户消息
     * @return 生成过程的流式响应
     */
    @SystemMessage(fromResource = "prompt/vue-project-system-prompt.txt")
    Flux<String> generateVueProjectCodeStream(
            //MemoryId对应后续生成vue项目的appid
            @MemoryId long appId, @UserMessage String userMessage
    );

    /**
     * 生成 React 项目代码（流式）
     *
     * @param userMessage 用户消息
     * @return 生成过程的流式响应
     */
    @SystemMessage(fromResource = "prompt/react-project-system-prompt.txt")
    Flux<String> generateReactProjectCodeStream(
            //MemoryId对应后续生成react项目的appid
            @MemoryId long appId, @UserMessage String userMessage
    );


}
