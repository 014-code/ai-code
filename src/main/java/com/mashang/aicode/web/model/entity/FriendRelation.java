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
 * 好友关系实体类
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("friend_relation")
public class FriendRelation implements Serializable {

    /**
     * 关系ID
     */
    @Id(keyType = KeyType.Generator, value = KeyGenerators.snowFlakeId)
    @Column("id")
    private Long id;

    /**
     * 用户ID（发起方）
     */
    @Column("userId")
    private Long userId;

    /**
     * 好友ID（接收方）
     */
    @Column("friendId")
    private Long friendId;

    /**
     * 关系状态：PENDING（待处理）、ACCEPTED（已接受）、REJECTED（已拒绝）
     */
    @Column("status")
    private String status;

    /**
     * 创建时间
     */
    @Column("createTime")
    private Date createTime;

    /**
     * 更新时间
     */
    @Column("updateTime")
    private Date updateTime;

    /**
     * 是否删除（逻辑删除）
     */
    @Column(value = "isDelete", isLogicDelete = true)
    private Integer isDelete;
}