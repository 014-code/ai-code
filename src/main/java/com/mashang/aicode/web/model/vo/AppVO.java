package com.mashang.aicode.web.model.vo;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 应用视图对象
 */
@Data
public class AppVO implements Serializable {

    /**
     * id
     */
    private Long id;

    /**
     * 应用名称
     */
    private String appName;
    /**
     * 应用类型
     */
    private String appType;
    /**
     * 应用描述
     */
    private String appDesc;

    //浏览量
    private Long pageViews;

    /**
     * 应用图标
     */
    private String appIcon;

    /**
     * 应用封面
     */
    private String appCover;

    /**
     * 初始化提示词
     */
    private String initPrompt;

    /**
     * 生成项目类型
     */
    private String codeGenType;

    /**
     * 创建用户 id
     */
    private Long userId;

    /**
     * 创建用户信息
     */
    private UserVO user;

    /**
     * 应用封面
     */
    private String cover;

    /**
     * 部署标识
     */
    private String deployKey;


    /**
     * 优先级（越大越靠前）
     */
    private Integer priority;

    /**
     * 是否精选（0-否，1-是）
     */
    private Integer isFeatured;

    /**
     * 编辑时间
     */
    private LocalDateTime editTime;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;

    private static final long serialVersionUID = 1L;
}