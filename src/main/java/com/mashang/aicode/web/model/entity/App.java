package com.mashang.aicode.web.model.entity;

import java.util.Date;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
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
@TableName("app")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class App implements Serializable {
    //id
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    //应用名称
    @TableField("appName")
    private String appName;
    //应用类型
    @TableField("appType")
    private String appType;
    //浏览量
    @TableField("pageViews")
    private Long pageViews;
    //应用封面
    @TableField("cover")
    private String cover;
    //应用初始化的 prompt
    @TableField("initPrompt")
    private String initPrompt;
    //代码生成类型（枚举）
    @TableField("codeGenType")
    private String codeGenType;
    //部署标识
    @TableField("deployKey")
    private String deployKey;
    //部署时间
    @TableField("deployedTime")
    private Date deployedTime;
    //优先级
    @TableField("priority")
    private Integer priority;
    //创建用户id
    @TableField("userId")
    private Long userId;
    //所属空间id
    @TableField("spaceId")
    private Long spaceId;
    //编辑时间
    @TableField("editTime")
    private Date editTime;
    //创建时间
    @TableField("createTime")
    private Date createTime;
    //更新时间
    @TableField("updateTime")
    private Date updateTime;
    //是否删除
    @TableLogic
    @TableField("isDelete")
    private Integer isDelete;

}

