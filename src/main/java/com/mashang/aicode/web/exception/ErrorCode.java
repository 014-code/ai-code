package com.mashang.aicode.web.exception;

import lombok.Getter;

@Getter
public enum ErrorCode {

    SUCCESS(0, "ok"),
    PARAMS_ERROR(40000, "请求参数错误"),
    NOT_LOGIN_ERROR(40100, "未登录"),
    NO_AUTH_ERROR(40101, "无权限"),
    TOO_MANY_REQUEST(42900, "请求过于频繁"),
    NOT_FOUND_ERROR(40400, "请求数据不存在"),
    FORBIDDEN_ERROR(40300, "禁止访问"),
    SYSTEM_ERROR(50000, "系统内部异常"),
    OPERATION_ERROR(50001, "操作失败"),
    EMAIL_FORMAT_ERROR(40001, "邮箱格式错误"),
    EMAIL_SEND_FREQUENT(40002, "邮箱验证码发送过于频繁"),
    EMAIL_SEND_ERROR(40003, "邮箱验证码发送失败"),
    EMAIL_CODE_INVALID(40004, "邮箱验证码无效或已过期"),
    EMAIL_EXISTS(40005, "邮箱已被注册");

    /**
     * 状态码
     */
    private final int code;

    /**
     * 信息
     */
    private final String message;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }

}