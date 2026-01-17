package com.mashang.aicode.web.model.entity;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableLogic;
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
@TableName("comment")
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
    @TableId(value = "id", type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 应用ID
     * 评论所属的应用
     */
    @TableField("appId")
    private Long appId;

    @TableField("commentType")
    private Integer commentType;

    @TableField("parentId")
    private Long parentId;

    /**
     * 用户ID
     * 评论创建者的用户ID
     */
    @TableField("userId")
    private Long userId;

    /**
     * 评论内容
     * 评论的具体内容
     */
    @TableField("content")
    private String content;

    /**
     * 点赞数
     * 评论被点赞的次数
     */
    @TableField("likeCount")
    private Integer likeCount;

    /**
     * 回复数
     * 该评论收到的回复数量
     */
    @TableField("replyCount")
    private Integer replyCount;

    /**
     * 创建时间
     * 评论创建的时间
     */
    @TableField("createTime")
    private LocalDateTime createTime;

    /**
     * 更新时间
     * 评论最后更新的时间
     */
    @TableField("updateTime")
    private LocalDateTime updateTime;

    /**
     * 是否删除
     * 逻辑删除标识：0-未删除，1-已删除
     */
    @TableLogic
    @TableField("isDelete")
    private Integer isDelete;
}
