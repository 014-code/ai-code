package com.mashang.aicode.web.langgraph4j.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

/**
 * 条件边检查类
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QualityResult implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    //是否校验
    private Boolean isValid;

    //校验错误信息
    private List<String> errors;

    //建议
    private List<String> suggestions;
}
