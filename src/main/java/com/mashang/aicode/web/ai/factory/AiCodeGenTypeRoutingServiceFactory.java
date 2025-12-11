package com.mashang.aicode.web.ai.factory;

import com.mashang.aicode.web.ai.service.AiCodeGenTypeRoutingService;
import com.mashang.aicode.web.utils.SpringContextUtil;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.service.AiServices;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * ai智能路由服务工厂类
 */
@Slf4j
@Configuration
public class AiCodeGenTypeRoutingServiceFactory {


    public AiCodeGenTypeRoutingService createAiCodeGenTypeRoutingService() {

        ChatModel chatModel = SpringContextUtil.getBean("routingChatModelPrototype", ChatModel.class);
        return AiServices.builder(AiCodeGenTypeRoutingService.class)
                .chatModel(chatModel)
                .build();
    }


    @Bean
    public AiCodeGenTypeRoutingService aiCodeGenTypeRoutingService() {
        return createAiCodeGenTypeRoutingService();
    }
}




