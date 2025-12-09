package com.mashang.aicode.web.langgraph4j.node;

import com.mashang.aicode.web.ai.service.ImageCollectionService;
import com.mashang.aicode.web.langgraph4j.state.ImageCategoryEnum;
import com.mashang.aicode.web.langgraph4j.state.ImageResource;
import com.mashang.aicode.web.langgraph4j.state.WorkflowContext;
import com.mashang.aicode.web.utils.SpringContextUtil;
import lombok.extern.slf4j.Slf4j;
import org.bsc.langgraph4j.action.AsyncNodeAction;
import org.bsc.langgraph4j.prebuilt.MessagesState;

import java.util.Arrays;
import java.util.List;

import static org.bsc.langgraph4j.action.AsyncNodeAction.node_async;

/**
 * 图片收集节点
 */
@Slf4j
public class ImageCollectorNode {

    public static AsyncNodeAction<MessagesState<String>> create() {
        return node_async(state -> {
            WorkflowContext context = WorkflowContext.getContext(state);
            String originalPrompt = context.getOriginalPrompt();
            String imageListStr = "";
            try {

                ImageCollectionService imageCollectionService = SpringContextUtil.getBean(ImageCollectionService.class);

                imageListStr = imageCollectionService.collectImages(originalPrompt).toString();
                imageCollectionService.collectImages(originalPrompt);
            } catch (Exception e) {
                log.error("图片收集失败: {}", e.getMessage(), e);
            }

            context.setCurrentStep("图片收集");
            context.setImageListStr(imageListStr);
            return WorkflowContext.saveContext(context);
        });
    }
}




