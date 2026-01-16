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
 * 空间实体类
 * 用于存储个人空间和团队空间的信息
 */
@Table("space")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Space implements Serializable {
    @Id(keyType = KeyType.Generator, value = KeyGenerators.snowFlakeId)
    @Column("id")
    private Long id;
    @Column("spaceName")
    private String spaceName;
    @Column("spaceType")
    private Integer spaceType;
    @Column("ownerId")
    private Long ownerId;
    @Column("description")
    private String description;
    @Column("memberCount")
    private Integer memberCount;
    @Column("appCount")
    private Integer appCount;
    @Column("createTime")
    private Date createTime;
    @Column("updateTime")
    private Date updateTime;
    @Column(value = "isDelete", isLogicDelete = true)
    private Integer isDelete;
}
