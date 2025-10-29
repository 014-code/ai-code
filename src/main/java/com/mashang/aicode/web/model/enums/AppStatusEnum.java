package com.mashang.aicode.web.model.enums;

import cn.hutool.core.util.ObjUtil;
import lombok.Getter;

/**
 * 应用状态枚举
 */
@Getter
public enum AppStatusEnum {

    NORMAL("正常", 0),
    FEATURED("精选", 1);

    private final String text;

    private final Integer value;

    AppStatusEnum(String text, Integer value) {
        this.text = text;
        this.value = value;
    }

    /**
     * 根据 value 获取枚举
     *
     * @param value 枚举值的value
     * @return 枚举值
     */
    public static AppStatusEnum getEnumByValue(Integer value) {
        if (ObjUtil.isEmpty(value)) {
            return null;
        }
        for (AppStatusEnum anEnum : AppStatusEnum.values()) {
            if (anEnum.value.equals(value)) {
                return anEnum;
            }
        }
        return null;
    }
}