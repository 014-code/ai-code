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

@TableName("email_verification_code")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmailVerificationCode implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("email")
    private String email;

    @TableField("code")
    private String code;

    @TableField("type")
    private String type;

    @TableField("expireTime")
    private Date expireTime;

    @TableField("verified")
    private Integer verified;

    @TableField("createTime")
    private Date createTime;

    @TableField("updateTime")
    private Date updateTime;

    @TableLogic
    @TableField("isDelete")
    private Integer isDelete;
}
