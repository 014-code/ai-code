package com.mashang.aicode.web.langgraph4j.ai;

import com.mashang.aicode.web.langgraph4j.model.ImageCollectionPlan;
import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;

public interface ImageCollectionPlanService {

    /**
     * ai各种图片收集服务
     *
     * @param userPrompt
     * @return
     */
    @SystemMessage(fromResource = "prompt/image-collection-plan-system-prompt.txt")
    ImageCollectionPlan planImageCollection(@UserMessage String userPrompt);
}


