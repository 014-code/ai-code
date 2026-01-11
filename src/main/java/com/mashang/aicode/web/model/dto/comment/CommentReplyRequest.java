package com.mashang.aicode.web.model.dto.comment;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

/**
 * 评论回复请求
 * 用于回复某条具体评论，或者回复应用的评论（主评论）
 *
 * @author makejava
 */
@Data
public class CommentReplyRequest implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 父评论ID
     * 被回复的评论ID，如果是回复应用的主评论，则为应用的主评论ID
     */
    private Long parentId;

    /**
     * 回复内容
     * 回复的具体内容
     */
    private String content;

    /**
     * 回复的用户ID
     * 被回复的用户ID（可选）
     */
    private Long replyUserId;
}
