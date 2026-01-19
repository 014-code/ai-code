package com.mashang.aicode.web.model.enums;

import cn.hutool.core.util.ObjUtil;
import lombok.Getter;

/**
 * 邀请状态枚举
 */
@Getter
public enum InviteStatusEnum {

    PENDING("待确认", "PENDING"),
    REGISTERED("已注册", "REGISTERED"),
    REWARDED("已奖励", "REWARDED"),
    REVOKED("已回收", "REVOKED");

    private final String text;
    private final String value;

    InviteStatusEnum(String text, String value) {
        this.text = text;
        this.value = value;
    }

    /**
     * 根据 value 获取枚举
     *
     * @param value 枚举值的value
     * @return 枚举值
     */
    public static InviteStatusEnum getEnumByValue(String value) {
        if (ObjUtil.isEmpty(value)) {
            return null;
        }
        for (InviteStatusEnum anEnum : InviteStatusEnum.values()) {
            if (anEnum.value.equals(value)) {
                return anEnum;
            }
        }
        return null;
    }
}
