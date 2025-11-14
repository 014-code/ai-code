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

/**
 * 应用(App)表实体类
 *
 * @author makejava
 * @since 2025-10-29 21:53:31
 */
@Table("app")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class App implements Serializable {
    //id
    @Id(keyType = KeyType.Generator, value = KeyGenerators.snowFlakeId)
    @Column("id")
    private Long id;
    //应用名称
    @Column("appName")
    private String appName;
    //应用类型
    @Column("appType")
    private String appType;
    //浏览量
    @Column("pageViews")
    private Long pageViews;
    //应用封面
    @Column("cover")
    private String cover;
    //应用初始化的 prompt
    @Column("initPrompt")
    private String initPrompt;
    //代码生成类型（枚举）
    @Column("codeGenType")
    private String codeGenType;
    //部署标识
    @Column("deployKey")
    private String deployKey;
    //部署时间
    @Column("deployedTime")
    private Date deployedTime;
    //优先级
    @Column("priority")
    private Integer priority;
    //创建用户id
    @Column("userId")
    private Long userId;
    //编辑时间
    @Column("editTime")
    private Date editTime;
    //创建时间
    @Column("createTime")
    private Date createTime;
    //更新时间
    @Column("updateTime")
    private Date updateTime;
    //是否删除
    @Column(value = "isDelete", isLogicDelete = true)
    private Integer isDelete;

}

