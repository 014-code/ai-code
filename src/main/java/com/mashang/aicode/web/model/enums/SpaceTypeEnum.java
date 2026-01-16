package com.mashang.aicode.web.model.enums;

import cn.hutool.core.util.ObjUtil;
import lombok.Getter;

/**
 * 空间类型枚举
 */
@Getter
public enum SpaceTypeEnum {

    PERSONAL("个人空间", 1),
    TEAM("团队空间", 2);

    private final String text;
    private final Integer value;

    SpaceTypeEnum(String text, Integer value) {
        this.text = text;
        this.value = value;
    }

    /**
     * 根据值获取枚举
     *
     * @param value 枚举值
     * @return 枚举对象
     */
    public static SpaceTypeEnum getEnumByValue(Integer value) {
        if (ObjUtil.isEmpty(value)) {
            return null;
        }
        for (SpaceTypeEnum anEnum : SpaceTypeEnum.values()) {
            if (anEnum.value.equals(value)) {
                return anEnum;
            }
        }
        return null;
    }
}
