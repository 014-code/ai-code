package com.mashang.aicode.web.model.dto.comment;

import com.mashang.aicode.web.common.PageRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;
import java.io.Serializable;

/**
 * 评论查询请求
 * 用于查询所有评论或查询某个应用的评论，支持分页和排序
 *
 * @author makejava
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class CommentQueryRequest extends PageRequest implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * id
     * 评论唯一标识
     */
    private Long id;

    /**
     * 应用ID
     * 评论所属的应用，用于筛选特定应用的评论
     */
    private Long appId;

    /**
     * 父评论ID
     * 用于筛选特定评论的回复
     */
    private Long parentId;

    /**
     * 用户ID
     * 评论创建者的用户ID，用于筛选特定用户的评论
     */
    private Long userId;

    /**
     * 评论内容
     * 用于模糊搜索评论内容
     */
    private String content;

    /**
     * 排序字段（createTime-创建时间，likeCount-点赞数，replyCount-回复数）
     */
    private String sortField;

    /**
     * 排序方式（asc-升序，desc-降序）
     */
    private String sortOrder;
}
