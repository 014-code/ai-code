package com.mashang.aicode.web.ai.service;

import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.V;

public interface AppNameService {

    @SystemMessage(fromResource = "prompt/app-name-system-prompt.txt")
    @UserMessage("用户需求：{{userPrompt}}")
    String generateAppName(@V("userPrompt") String userPrompt);
}
