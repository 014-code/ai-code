package com.mashang.aicode.web.manager.websocket.model.enums;

import lombok.Getter;

/**
 * 消息类型枚举
 */
@Getter
public enum DialogueMessageTypeEnum {

    INFO("发送通知", "INFO"),
    ERROR("发送错误", "ERROR"),
    ENTER_EDIT("进入编辑状态", "进入编辑状态"),
    EXIT_EDIT("退出编辑状态", "退出编辑状态"),
    EDIT_ACTION("执行编辑操作", "执行编辑操作"),
    SEND_MESSAGE("发送消息", "发送消息"),
    AI_RESPONSE("AI回复", "AI回复"),
    HOVER_ELEMENT("触摸元素", "触摸元素"),
    SELECT_ELEMENT("选择元素", "选择元素"),
    CLEAR_ELEMENT("清除元素", "清除元素"),
    DEPLOY_PROJECT("部署项目", "部署项目"),
    STOP_RESPONSE("停止回复", "停止回复");

    private final String text;
    private final String value;

    DialogueMessageTypeEnum(String text, String value) {
        this.text = text;
        this.value = value;
    }

    /**
     * 根据 value 获取枚举
     */
    public static DialogueMessageTypeEnum getEnumByValue(String value) {
        if (value == null || value.isEmpty()) {
            return null;
        }
        for (DialogueMessageTypeEnum typeEnum : DialogueMessageTypeEnum.values()) {
            if (typeEnum.value.equals(value)) {
                return typeEnum;
            }
        }
        return null;
    }
}
