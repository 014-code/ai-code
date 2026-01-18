package com.mashang.aicode.web.ai.factory;

import com.mashang.aicode.web.ai.service.AppNameService;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.service.AiServices;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class AppNameServiceFactory {

    @Autowired
    private ApplicationContext applicationContext;

    public AppNameService createAppNameService() {
        ChatModel chatModel = applicationContext.getBean("routingChatModelPrototype", ChatModel.class);
        return AiServices.builder(AppNameService.class)
                .chatModel(chatModel)
                .build();
    }

    @Bean
    public AppNameService appNameService() {
        return createAppNameService();
    }
}
