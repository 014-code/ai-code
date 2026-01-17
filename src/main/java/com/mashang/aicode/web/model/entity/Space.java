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

/**
 * 空间实体类
 * 用于存储个人空间和团队空间的信息
 */
@TableName("space")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Space implements Serializable {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    @TableField("spaceName")
    private String spaceName;
    @TableField("spaceType")
    private Integer spaceType;
    @TableField("ownerId")
    private Long ownerId;
    @TableField("description")
    private String description;
    @TableField("memberCount")
    private Integer memberCount;
    @TableField("appCount")
    private Integer appCount;
    @TableField("createTime")
    private Date createTime;
    @TableField("updateTime")
    private Date updateTime;
    @TableLogic
    @TableField("isDelete")
    private Integer isDelete;
}
