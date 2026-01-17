package com.mashang.aicode.web.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.io.Serializable;
import java.util.Date;

/**
 * 好友关系实体类
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("friend_relation")
public class FriendRelation implements Serializable {

    /**
     * 关系ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 用户ID（发起方）
     */
    @TableField("userId")
    private Long userId;

    /**
     * 好友ID（接收方）
     */
    @TableField("friendId")
    private Long friendId;

    /**
     * 关系状态：PENDING（待处理）、ACCEPTED（已接受）、REJECTED（已拒绝）
     */
    @TableField("status")
    private String status;

    /**
     * 创建时间
     */
    @TableField("createTime")
    private Date createTime;

    /**
     * 更新时间
     */
    @TableField("updateTime")
    private Date updateTime;

    /**
     * 是否删除（逻辑删除）
     */
    @TableLogic
    @TableField("isDelete")
    private Integer isDelete;
}