package com.mashang.aicode.web.model.entity;

import java.util.Date;

import com.mybatisflex.annotation.Column;
import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.KeyType;
import com.mybatisflex.annotation.Table;
import com.mybatisflex.core.keygen.KeyGenerators;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * 应用(App)表实体类
 *
 * @author makejava
 * @since 2025-10-29 21:53:31
 */
@Table("app")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class App implements Serializable {
    //id
    @Id(keyType = KeyType.Generator, value = KeyGenerators.snowFlakeId)
    private Long id;
    //应用名称
    private String appname;
    //应用封面
    private String cover;
    //应用初始化的 prompt
    private String initprompt;
    //代码生成类型（枚举）
    private String codegentype;
    //部署标识
    private String deploykey;
    //部署时间
    private Date deployedtime;
    //优先级
    private Integer priority;
    //创建用户id
    private Long userid;
    //编辑时间
    private Date edittime;
    //创建时间
    private Date createtime;
    //更新时间
    private Date updatetime;
    //是否删除
    @Column(isLogicDelete = true)
    private Integer isdelete;

}

