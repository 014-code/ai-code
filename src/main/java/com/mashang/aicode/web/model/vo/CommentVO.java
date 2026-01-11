package com.mashang.aicode.web.model.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 评论视图对象
 * 用于返回给前端的评论信息，包含应用信息和用户信息
 *
 * @author makejava
 */
@Data
public class CommentVO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * id
     * 评论唯一标识
     */
    private Long id;

    /**
     * 应用ID
     * 评论所属的应用
     */
    private Long appId;

    /**
     * 应用信息
     * 包含应用的名称、封面等信息，用于论坛式展示
     */
    private AppVO app;

    /**
     * 父评论ID
     * 如果是主评论，则为null
     * 如果是回复评论，则为被回复的评论ID
     */
    private Long parentId;

    /**
     * 父评论信息
     * 被回复的评论信息，用于展示回复关系
     */
    private CommentVO parentComment;

    /**
     * 用户ID
     * 评论创建者的用户ID
     */
    private Long userId;

    /**
     * 评论用户信息
     * 包含评论者的昵称、头像等信息
     */
    private UserVO user;

    /**
     * 评论内容
     * 评论的具体内容
     */
    private String content;

    /**
     * 点赞数
     * 评论被点赞的次数
     */
    private Integer likeCount;

    /**
     * 回复数
     * 该评论收到的回复数量
     */
    private Integer replyCount;

    /**
     * 创建时间
     * 评论创建的时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     * 评论最后更新的时间
     */
    private LocalDateTime updateTime;

    /**
     * 是否为主评论
     * 根据parentId判断是否为主评论
     *
     * @return true表示主评论，false表示回复评论
     */
    public boolean isMainComment() {
        return parentId == null;
    }
}
