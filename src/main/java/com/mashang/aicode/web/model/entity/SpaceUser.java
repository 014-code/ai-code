package com.mashang.aicode.web.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Date;

/**
 * 空间成员实体类
 * 用于存储空间与用户的关联关系，包括用户角色和权限
 */
@TableName("space_user")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SpaceUser implements Serializable {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    @TableField("spaceId")
    private Long spaceId;
    @TableField("userId")
    private Long userId;
    @TableField("role")
    private String role;
    @TableField("permissions")
    private String permissions;
    @TableField("joinTime")
    private Date joinTime;
    @TableField("createTime")
    private Date createTime;
    @TableField("updateTime")
    private Date updateTime;
}
