package com.mashang.aicode.web.model.vo;

import lombok.Data;
import java.io.Serializable;

/**
 * 应用类型VO
 */
@Data
public class AppTypeVO implements Serializable {

    /**
     * 应用类型编码
     */
    private Integer code;
    
    /**
     * 应用类型名称
     */
    private String text;
    
    /**
     * 分类标识
     */
    private String category;
    
    /**
     * 分类名称
     */
    private String categoryName;

    private static final long serialVersionUID = 1L;
}