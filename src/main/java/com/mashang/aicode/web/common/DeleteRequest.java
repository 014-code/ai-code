package com.mashang.aicode.web.common;

import lombok.Data;

import java.io.Serializable;

/**
 * 删除请求包装类
 */
@Data
public class DeleteRequest implements Serializable {

    /**
     * id
     */
    private Long id;

    /**
     * 额外参数
     */
    private String extra;

    private static final long serialVersionUID = 1L;
}