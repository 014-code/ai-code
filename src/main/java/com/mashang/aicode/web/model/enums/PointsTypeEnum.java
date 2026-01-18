package com.mashang.aicode.web.model.enums;

import cn.hutool.core.util.ObjUtil;
import lombok.Getter;

/**
 * 积分类型枚举
 */
@Getter
public enum PointsTypeEnum {

    SIGN_IN("签到", "SIGN_IN"),
    REGISTER("注册", "REGISTER"),
    FIRST_GENERATE("首次生成", "FIRST_GENERATE"),
    INVITE("邀请", "INVITE"),
    GENERATE("生成应用", "GENERATE"),
    AI_GENERATE("AI生成扣费", "AI_GENERATE"),
    REFUND("返还", "REFUND"),
    EXPIRE_REMINDER("到期提醒", "EXPIRE_REMINDER"),
    EXPIRE("过期", "EXPIRE"),
    ADMIN_ADJUST("管理员调整", "ADMIN_ADJUST");

    private final String text;
    private final String value;

    PointsTypeEnum(String text, String value) {
        this.text = text;
        this.value = value;
    }

    /**
     * 根据 value 获取枚举
     *
     * @param value 枚举值的value
     * @return 枚举值
     */
    public static PointsTypeEnum getEnumByValue(String value) {
        if (ObjUtil.isEmpty(value)) {
            return null;
        }
        for (PointsTypeEnum anEnum : PointsTypeEnum.values()) {
            if (anEnum.value.equals(value)) {
                return anEnum;
            }
        }
        return null;
    }
}
