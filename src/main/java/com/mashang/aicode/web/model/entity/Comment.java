package com.mashang.aicode.web.model.entity;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

import com.mybatisflex.annotation.Column;
import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.KeyType;
import com.mybatisflex.annotation.Table;
import com.mybatisflex.core.keygen.KeyGenerators;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 评论(Comment)表实体类
 * 用于存储用户对应用的评论信息
 *
 * @author makejava
 */
@Table("comment")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Comment implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * id
     * 评论唯一标识
     */
    @Id(keyType = KeyType.Generator, value = KeyGenerators.snowFlakeId)
    @Column("id")
    private Long id;

    /**
     * 应用ID
     * 评论所属的应用
     */
    @Column("appId")
    private Long appId;

    /**
     * 父评论ID
     * 如果是主评论，则为null
     * 如果是回复评论，则为被回复的评论ID
     */
    @Column("parentId")
    private Long parentId;

    /**
     * 用户ID
     * 评论创建者的用户ID
     */
    @Column("userId")
    private Long userId;

    /**
     * 评论内容
     * 评论的具体内容
     */
    private String content;

    /**
     * 点赞数
     * 评论被点赞的次数
     */
    @Column("likeCount")
    private Integer likeCount;

    /**
     * 回复数
     * 该评论收到的回复数量
     */
    @Column("replyCount")
    private Integer replyCount;

    /**
     * 创建时间
     * 评论创建的时间
     */
    @Column("createTime")
    private LocalDateTime createTime;

    /**
     * 更新时间
     * 评论最后更新的时间
     */
    @Column("updateTime")
    private LocalDateTime updateTime;

    /**
     * 是否删除
     * 逻辑删除标识：0-未删除，1-已删除
     */
    @Column(value = "isDelete", isLogicDelete = true)
    private Integer isDelete;
}
