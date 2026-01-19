package com.mashang.aicode.web.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

@TableName("ai_model_config")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AiModelConfig implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("modelKey")
    private String modelKey;

    @TableField("modelName")
    private String modelName;

    @TableField("provider")
    private String provider;

    @TableField("baseUrl")
    private String baseUrl;

    @TableField("tier")
    private String tier;

    @TableField("pointsPerKToken")
    private Integer pointsPerKToken;

    @TableField("description")
    private String description;

    @TableField("isEnabled")
    private Integer isEnabled;

    @TableField("sortOrder")
    private Integer sortOrder;

    @TableField("qualityScore")
    private BigDecimal qualityScore;

    @TableField("successRate")
    private BigDecimal successRate;

    @TableField("avgTokenUsage")
    private Integer avgTokenUsage;

    @TableField("userRating")
    private BigDecimal userRating;

    @TableField("createTime")
    private Date createTime;

    @TableField("updateTime")
    private Date updateTime;

    @TableLogic
    @TableField("isDelete")
    private Integer isDelete;
}
