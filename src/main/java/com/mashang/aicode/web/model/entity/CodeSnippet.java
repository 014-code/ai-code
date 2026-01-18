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

    @TableField("snippet_name")
    private String snippetName;

    @TableField("snippet_type")
    private String snippetType;

    @TableField("snippet_category")
    private String snippetCategory;

    @TableField("snippet_desc")
    private String snippetDesc;

    @TableField("snippet_code")
    private String snippetCode;

    @TableField("usage_scenario")
    private String usageScenario;

    @TableField("tags")
    private String tags;

    @TableField("is_active")
    private Integer isActive;

    @TableField("priority")
    private Integer priority;

    @TableField("creator_id")
    private Long creatorId;

    @TableField("create_time")
    private Date createTime;

    @TableField("update_time")
    private Date updateTime;

    @TableLogic
    @TableField("is_delete")
    private Integer isDelete;
}
