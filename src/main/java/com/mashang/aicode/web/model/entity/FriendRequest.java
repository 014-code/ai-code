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
 * 好友请求实体类
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("friend_request")
public class FriendRequest implements Serializable {

    /**
     * 请求ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 请求方用户ID
     */
    @TableField("requesterid")
    private Long requesterId;

    /**
     * 接收方用户ID
     */
    @TableField("addresseeid")
    private Long addresseeId;

    /**
     * 请求状态：PENDING（待处理）、ACCEPTED（已接受）、REJECTED（已拒绝）
     */
    @TableField("status")
    private String status;

    /**
     * 请求消息
     */
    @TableField("message")
    private String message;

    /**
     * 创建时间
     */
    @TableField("createtime")
    private Date createTime;

    /**
     * 更新时间
     */
    @TableField("updatetime")
    private Date updateTime;

    /**
     * 是否删除（逻辑删除）
     */
    @TableLogic
    @TableField("isdelete")
    private Integer isDelete;
}