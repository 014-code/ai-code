package com.mashang.aicode.web.model.dto.comment;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

/**
 * 评论添加请求
 * 用于为指定应用添加新评论
 *
 * @author makejava
 */
@Data
public class CommentAddRequest implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 应用ID
     * 评论所属的应用
     */
    private Long appId;

    /**
     * 评论内容
     * 评论的具体内容
     */
    private String content;
}
