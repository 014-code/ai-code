package com.mashang.aicode.web.model.enums;

import cn.hutool.core.util.ObjUtil;
import lombok.Getter;

/**
 * 空间用户角色枚举
 * OWNER: 空间所有者，拥有所有权限
 * ADMIN: 空间管理员，拥有大部分管理权限
 * MEMBER: 空间成员，拥有基础使用权限
 */
@Getter
public enum SpaceUserRoleEnum {

    OWNER("所有者", "OWNER"),
    ADMIN("管理员", "ADMIN"),
    MEMBER("成员", "MEMBER");

    private final String text;
    private final String value;

    SpaceUserRoleEnum(String text, String value) {
        this.text = text;
        this.value = value;
    }

    /**
     * 根据值获取枚举
     *
     * @param value 枚举值
     * @return 枚举对象
     */
    public static SpaceUserRoleEnum getEnumByValue(String value) {
        if (ObjUtil.isEmpty(value)) {
            return null;
        }
        for (SpaceUserRoleEnum anEnum : SpaceUserRoleEnum.values()) {
            if (anEnum.value.equals(value)) {
                return anEnum;
            }
        }
        return null;
    }
}
