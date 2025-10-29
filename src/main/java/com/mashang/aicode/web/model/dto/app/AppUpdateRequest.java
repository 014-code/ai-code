package com.mashang.aicode.web.model.dto.app;

import lombok.Data;

import java.io.Serializable;

/**
 * 应用更新请求
 */
@Data
public class AppUpdateRequest implements Serializable {

    /**
     * id
     */
    private Long id;

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
     * 优先级
     */
    private Integer priority;

    private static final long serialVersionUID = 1L;
}