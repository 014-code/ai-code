package com.mashang.aicode.web.ai.service;

import com.mashang.aicode.web.langgraph4j.state.ImageResource;
import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;

import java.util.List;

/**
 * ai图片收集服务
 */
public interface ImageCollectionService {

    @SystemMessage(fromResource = "prompt/image-collection-system-prompt.txt")
    List<ImageResource> collectImages(@UserMessage String userPrompt);

}
