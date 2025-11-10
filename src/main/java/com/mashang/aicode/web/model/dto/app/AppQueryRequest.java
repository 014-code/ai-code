package com.mashang.aicode.web.model.dto.app;

import com.mashang.aicode.web.common.PageRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;

/**
 * 应用查询请求
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class AppQueryRequest extends PageRequest implements Serializable {

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
     * 代码生成类型（html / multi_file / vue_project / react_project）
     */
    private String codeGenType;

    /**
     * 创建用户 id
     */
    private Long userId;

    /**
     * 是否精选（0-否，1-是）
     */
    private Integer isFeatured;

    /**
     * 搜索关键词（用于名称和描述模糊搜索）
     */
    private String searchKey;

    private static final long serialVersionUID = 1L;
}