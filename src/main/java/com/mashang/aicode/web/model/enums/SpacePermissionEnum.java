package com.mashang.aicode.web.model.enums;

import cn.hutool.core.util.ObjUtil;
import lombok.Getter;

/**
 * 空间权限枚举
 * 定义空间内不同角色可以执行的操作权限
 */
@Getter
public enum SpacePermissionEnum {

    APP_MANAGE("应用管理", "APP_MANAGE"),
    MEMBER_MANAGE("成员管理", "MEMBER_MANAGE"),
    SPACE_MANAGE("空间管理", "SPACE_MANAGE"),
    VIEW_APP("查看应用", "VIEW_APP"),
    EDIT_APP("编辑应用", "EDIT_APP"),
    DELETE_APP("删除应用", "DELETE_APP");

    private final String text;
    private final String value;

    SpacePermissionEnum(String text, String value) {
        this.text = text;
        this.value = value;
    }

    /**
     * 根据值获取枚举
     *
     * @param value 枚举值
     * @return 枚举对象
     */
    public static SpacePermissionEnum getEnumByValue(String value) {
        if (ObjUtil.isEmpty(value)) {
            return null;
        }
        for (SpacePermissionEnum anEnum : SpacePermissionEnum.values()) {
            if (anEnum.value.equals(value)) {
                return anEnum;
            }
        }
        return null;
    }
}
