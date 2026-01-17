package com.mashang.aicode.web.model.entity;

import java.util.Date;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableLogic;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@TableName("forum_post")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ForumPost implements Serializable {
    @TableId(value = "id", type = IdType.ASSIGN_ID)
    private Long id;
    @TableField("title")
    private String title;
    @TableField("content")
    private String content;
    @TableField("appId")
    private Long appId;
    @TableField("userId")
    private Long userId;
    @TableField("viewCount")
    private Integer viewCount;
    @TableField("likeCount")
    private Integer likeCount;
    @TableField("commentCount")
    private Integer commentCount;
    @TableField("isPinned")
    private Integer isPinned;
    @TableField("createTime")
    private Date createTime;
    @TableField("updateTime")
    private Date updateTime;
    @TableLogic
    @TableField("isDelete")
    private Integer isDelete;

}
