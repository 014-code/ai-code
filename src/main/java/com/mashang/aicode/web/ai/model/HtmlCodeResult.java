package com.mashang.aicode.web.ai.model;

import dev.langchain4j.model.output.structured.Description;
import lombok.Data;

/**
 * 单文件生成响应类
 */
@Description("生成 HTML 代码文件的结果")
@Data
public class HtmlCodeResult {

    @Description("HTML代码")
    private String htmlCode;

    @Description("生成代码的描述")
    private String description;
}




