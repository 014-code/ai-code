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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;

@TableName("points_record")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PointsRecord implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("userId")
    private Long userId;

    @TableField("points")
    private Integer points;

    @TableField("balance")
    private Integer balance;

    @TableField("type")
    private String type;

    @TableField("reason")
    private String reason;

    @TableField("status")
    private String status;

    @TableField("remainingPoints")
    private Integer remainingPoints;

    @TableField("modelKey")
    private String modelKey;

    @TableField("tokenCount")
    private Integer tokenCount;

    @TableField("relatedId")
    private Long relatedId;

    @TableField("expireTime")
    private LocalDateTime expireTime;

    @TableField("createTime")
    private LocalDate createTime;

    @TableLogic
    @TableField("isDelete")
    private Integer isDelete;
}
