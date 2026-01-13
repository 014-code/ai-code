package com.mashang.aicode.web.model.entity;

import java.util.Date;

import com.mybatisflex.annotation.Column;
import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.KeyType;
import com.mybatisflex.annotation.Table;
import com.mybatisflex.core.keygen.KeyGenerators;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Table("forum_post")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ForumPost implements Serializable {
    @Id(keyType = KeyType.Generator, value = KeyGenerators.snowFlakeId)
    @Column("id")
    private Long id;
    @Column("title")
    private String title;
    @Column("content")
    private String content;
    @Column("appId")
    private Long appId;
    @Column("userId")
    private Long userId;
    @Column("viewCount")
    private Integer viewCount;
    @Column("likeCount")
    private Integer likeCount;
    @Column("commentCount")
    private Integer commentCount;
    @Column("isPinned")
    private Integer isPinned;
    @Column("createTime")
    private Date createTime;
    @Column("updateTime")
    private Date updateTime;
    @Column(value = "isDelete", isLogicDelete = true)
    private Integer isDelete;

}
