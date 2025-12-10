package com.mashang.aicode.web.langgraph4j.node;

import com.mashang.aicode.web.ai.service.ImageCollectionService;
import com.mashang.aicode.web.langgraph4j.ai.ImageCollectionPlanService;
import com.mashang.aicode.web.langgraph4j.model.ImageCollectionPlan;
import com.mashang.aicode.web.langgraph4j.state.ImageCategoryEnum;
import com.mashang.aicode.web.langgraph4j.state.ImageResource;
import com.mashang.aicode.web.langgraph4j.state.WorkflowContext;
import com.mashang.aicode.web.langgraph4j.tools.ImageSearchTool;
import com.mashang.aicode.web.langgraph4j.tools.LogoGeneratorTool;
import com.mashang.aicode.web.langgraph4j.tools.MermaidDiagramTool;
import com.mashang.aicode.web.langgraph4j.tools.UndrawIllustrationTool;
import com.mashang.aicode.web.utils.SpringContextUtil;
import lombok.extern.slf4j.Slf4j;
import org.bsc.langgraph4j.action.AsyncNodeAction;
import org.bsc.langgraph4j.prebuilt.MessagesState;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.CompletableFuture;

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
            List<ImageResource> collectedImages = new ArrayList<>();

            try {

                ImageCollectionPlanService planService = SpringContextUtil.getBean(ImageCollectionPlanService.class);
                ImageCollectionPlan plan = planService.planImageCollection(originalPrompt);
                log.info("获取到图片收集计划，开始并发执行");


                List<CompletableFuture<List<ImageResource>>> futures = new ArrayList<>();

                //网页内容图片收集
                if (plan.getContentImageTasks() != null) {
                    ImageSearchTool imageSearchTool = SpringContextUtil.getBean(ImageSearchTool.class);
                    for (ImageCollectionPlan.ImageSearchTask task : plan.getContentImageTasks()) {
                        futures.add(CompletableFuture.supplyAsync(() ->
                                imageSearchTool.searchContentImages(task.query())));
                    }
                }

                if (plan.getIllustrationTasks() != null) {
                    UndrawIllustrationTool illustrationTool = SpringContextUtil.getBean(UndrawIllustrationTool.class);
                    for (ImageCollectionPlan.IllustrationTask task : plan.getIllustrationTasks()) {
                        futures.add(CompletableFuture.supplyAsync(() ->
                                illustrationTool.searchIllustrations(task.query())));
                    }
                }

                //架构图收集
                if (plan.getDiagramTasks() != null) {
                    MermaidDiagramTool diagramTool = SpringContextUtil.getBean(MermaidDiagramTool.class);
                    for (ImageCollectionPlan.DiagramTask task : plan.getDiagramTasks()) {
                        futures.add(CompletableFuture.supplyAsync(() ->
                                diagramTool.generateMermaidDiagram(task.mermaidCode(), task.description())));
                    }
                }

                //logo图收集
                if (plan.getLogoTasks() != null) {
                    LogoGeneratorTool logoTool = SpringContextUtil.getBean(LogoGeneratorTool.class);
                    for (ImageCollectionPlan.LogoTask task : plan.getLogoTasks()) {
                        futures.add(CompletableFuture.supplyAsync(() ->
                                logoTool.generateLogos(task.description())));
                    }
                }


                CompletableFuture<Void> allTasks = CompletableFuture.allOf(
                        futures.toArray(new CompletableFuture[0]));
                allTasks.join();

                for (CompletableFuture<List<ImageResource>> future : futures) {
                    List<ImageResource> images = future.get();
                    if (images != null) {
                        collectedImages.addAll(images);
                    }
                }
                log.info("并发图片收集完成，共收集到 {} 张图片", collectedImages.size());
            } catch (Exception e) {
                log.error("图片收集失败: {}", e.getMessage(), e);
            }

            context.setCurrentStep("图片收集");
            context.setImageList(collectedImages);
            return WorkflowContext.saveContext(context);
        });
    }
}






