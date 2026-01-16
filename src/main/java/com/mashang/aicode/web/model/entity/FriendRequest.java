package com.mashang.aicode.web.model.entity;

import com.mybatisflex.annotation.Column;
import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.KeyType;
import com.mybatisflex.annotation.Table;
import com.mybatisflex.core.keygen.KeyGenerators;
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
@Table("friend_request")
public class FriendRequest implements Serializable {

    /**
     * 请求ID
     */
    @Id(keyType = KeyType.Generator, value = KeyGenerators.snowFlakeId)
    @Column("id")
    private Long id;

    /**
     * 请求方用户ID
     */
    @Column("requesterid")
    private Long requesterId;

    /**
     * 接收方用户ID
     */
    @Column("addresseeid")
    private Long addresseeId;

    /**
     * 请求状态：PENDING（待处理）、ACCEPTED（已接受）、REJECTED（已拒绝）
     */
    @Column("status")
    private String status;

    /**
     * 请求消息
     */
    @Column("message")
    private String message;

    /**
     * 创建时间
     */
    @Column("createtime")
    private Date createTime;

    /**
     * 更新时间
     */
    @Column("updatetime")
    private Date updateTime;

    /**
     * 是否删除（逻辑删除）
     */
    @Column(value = "isdelete", isLogicDelete = true)
    private Integer isDelete;
}