package com.mashang.aicode.web.model.enums;

import cn.hutool.core.util.ObjUtil;
import lombok.Getter;

/**
 * 积分状态枚举
 */
@Getter
public enum PointsStatusEnum {

    ACTIVE("有效", "ACTIVE"),
    EXPIRED("已过期", "EXPIRED"),
    CONSUMED("已消费", "CONSUMED"),
    PARTIAL_CONSUMED("部分消费", "PARTIAL_CONSUMED");

    private final String text;
    private final String value;

    PointsStatusEnum(String text, String value) {
        this.text = text;
        this.value = value;
    }

    /**
     * 根据 value 获取枚举
     *
     * @param value 枚举值的value
     * @return 枚举值
     */
    public static PointsStatusEnum getEnumByValue(String value) {
        if (ObjUtil.isEmpty(value)) {
            return null;
        }
        for (PointsStatusEnum anEnum : PointsStatusEnum.values()) {
            if (anEnum.value.equals(value)) {
                return anEnum;
            }
        }
        return null;
    }
}
