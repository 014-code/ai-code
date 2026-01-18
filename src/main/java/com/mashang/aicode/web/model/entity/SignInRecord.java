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

@TableName("sign_in_record")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SignInRecord implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("userId")
    private Long userId;

    @TableField("signInDate")
    private Date signInDate;

    @TableField("continuousDays")
    private Integer continuousDays;

    @TableField("pointsEarned")
    private Integer pointsEarned;

    @TableField("createTime")
    private Date createTime;

    @TableLogic
    @TableField("isDelete")
    private Integer isDelete;
}
