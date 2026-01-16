package com.mashang.aicode.web.model.entity;

import com.mybatisflex.annotation.Column;
import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.KeyType;
import com.mybatisflex.annotation.Table;
import com.mybatisflex.core.keygen.KeyGenerators;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Date;

/**
 * 空间成员实体类
 * 用于存储空间与用户的关联关系，包括用户角色和权限
 */
@Table("space_user")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SpaceUser implements Serializable {
    @Id(keyType = KeyType.Generator, value = KeyGenerators.snowFlakeId)
    @Column("id")
    private Long id;
    @Column("spaceId")
    private Long spaceId;
    @Column("userId")
    private Long userId;
    @Column("role")
    private String role;
    @Column("permissions")
    private String permissions;
    @Column("joinTime")
    private Date joinTime;
    @Column("createTime")
    private Date createTime;
    @Column("updateTime")
    private Date updateTime;
}
