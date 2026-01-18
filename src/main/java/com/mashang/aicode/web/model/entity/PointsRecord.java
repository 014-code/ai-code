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

@TableName("points_record")
@Data
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

    @TableField("relatedId")
    private Long relatedId;

    @TableField("expireTime")
    private Date expireTime;

    @TableField("createTime")
    private Date createTime;

    @TableLogic
    @TableField("isDelete")
    private Integer isDelete;
}
