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

@TableName("invite_record")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class InviteRecord implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("inviterId")
    private Long inviterId;

    @TableField("inviteeId")
    private Long inviteeId;

    @TableField("inviteCode")
    private String inviteCode;

    @TableField("registerIp")
    private String registerIp;

    @TableField("deviceId")
    private String deviceId;

    @TableField("status")
    private String status;

    @TableField("inviterPoints")
    private Integer inviterPoints;

    @TableField("inviteePoints")
    private Integer inviteePoints;

    @TableField("createTime")
    private Date createTime;

    @TableField("registerTime")
    private Date registerTime;

    @TableField("rewardTime")
    private Date rewardTime;

    @TableLogic
    @TableField("isDelete")
    private Integer isDelete;
}
