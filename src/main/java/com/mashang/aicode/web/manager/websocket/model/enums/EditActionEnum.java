package com.mashang.aicode.web.manager.websocket.model.enums;

import lombok.Getter;

/**
 * 协同编辑操作枚举
 */
@Getter
public enum EditActionEnum {

    SEND_MESSAGE("发送消息", "SEND_MESSAGE"),
    HOVER_ELEMENT("触摸元素", "HOVER_ELEMENT"),
    SELECT_ELEMENT("选择元素", "SELECT_ELEMENT"),
    DEPLOY_PROJECT("部署项目", "DEPLOY_PROJECT"),
    STOP_RESPONSE("停止回复", "STOP_RESPONSE");

    private final String text;
    private final String value;

    EditActionEnum(String text, String value) {
        this.text = text;
        this.value = value;
    }

    public static EditActionEnum getEnumByValue(String value) {
        if (value == null || value.isEmpty()) {
            return null;
        }
        for (EditActionEnum actionEnum : EditActionEnum.values()) {
            if (actionEnum.value.equals(value)) {
                return actionEnum;
            }
        }
        return null;
    }
}