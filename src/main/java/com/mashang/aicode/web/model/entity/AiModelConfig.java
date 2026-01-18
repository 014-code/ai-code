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

@TableName("ai_model_config")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AiModelConfig implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("model_key")
    private String modelKey;

    @TableField("model_name")
    private String modelName;

    @TableField("provider")
    private String provider;

    @TableField("base_url")
    private String baseUrl;

    @TableField("tier")
    private String tier;

    @TableField("points_per_k_token")
    private Integer pointsPerKToken;

    @TableField("description")
    private String description;

    @TableField("is_enabled")
    private Integer isEnabled;

    @TableField("sort_order")
    private Integer sortOrder;

    @TableField("create_time")
    private Date createTime;

    @TableField("update_time")
    private Date updateTime;

    @TableLogic
    @TableField("is_delete")
    private Integer isDelete;
}
