package com.mashang.aicode.web.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Date;

@TableName("code_snippet")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CodeSnippet implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("snippetName")
    private String snippetName;

    @TableField("snippetType")
    private String snippetType;

    @TableField("snippetCategory")
    private String snippetCategory;

    @TableField("snippetDesc")
    private String snippetDesc;

    @TableField("snippetCode")
    private String snippetCode;

    @TableField("usageScenario")
    private String usageScenario;

    @TableField("tags")
    private String tags;

    @TableField("isActive")
    private Integer isActive;

    @TableField("priority")
    private Integer priority;

    @TableField("creatorId")
    private Long creatorId;

    @TableField("createTime")
    private Date createTime;

    @TableField("updateTime")
    private Date updateTime;

    @TableLogic
    @TableField("isDelete")
    private Integer isDelete;
}
