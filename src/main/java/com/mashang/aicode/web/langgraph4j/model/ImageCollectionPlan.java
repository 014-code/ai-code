package com.mashang.aicode.web.langgraph4j.model;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

/**
 * 各种收集到的图片实体类
 */
@Data
public class ImageCollectionPlan implements Serializable {


    private List<ImageSearchTask> contentImageTasks;


    private List<IllustrationTask> illustrationTasks;


    private List<DiagramTask> diagramTasks;


    private List<LogoTask> logoTasks;


    public record ImageSearchTask(String query) implements Serializable {
    }


    public record IllustrationTask(String query) implements Serializable {
    }


    public record DiagramTask(String mermaidCode, String description) implements Serializable {
    }


    public record LogoTask(String description) implements Serializable {
    }
}


