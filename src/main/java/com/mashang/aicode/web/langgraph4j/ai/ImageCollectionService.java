package com.mashang.aicode.web.langgraph4j.ai;

import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;

/**
 * ai图片收集服务
 */
public interface ImageCollectionService {


    @SystemMessage(fromResource = "prompt/image-collection-system-prompt.txt")
    String collectImages(@UserMessage String userPrompt);
}


