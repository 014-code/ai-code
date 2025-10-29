package com.mashang.aicode.web.model.dto.app;

import lombok.Data;

import java.io.Serializable;

/**
 * 应用添加请求
 */
@Data
public class AppAddRequest implements Serializable {

    /**
     * 应用名称
     */
    private String appName;

    /**
     * 应用描述
     */
    private String appDesc;

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

    private static final long serialVersionUID = 1L;
}