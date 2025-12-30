package com.mashang.aicode.web.model.vo;

import lombok.Data;

import java.io.Serializable;

/**
 * 预设提示词视图对象
 */
@Data
public class PresetPromptVO implements Serializable {
    
    /**
     * 标签名称
     */
    private String label;
    
    /**
     * 提示词内容
     */
    private String prompt;
    
    private static final long serialVersionUID = 1L;
}
