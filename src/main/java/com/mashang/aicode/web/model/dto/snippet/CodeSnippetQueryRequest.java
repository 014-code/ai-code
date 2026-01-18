package com.mashang.aicode.web.model.dto.snippet;

import lombok.Data;

import java.io.Serializable;

@Data
public class CodeSnippetQueryRequest implements Serializable {

    private String snippetType;

    private String snippetCategory;

    private String snippetDesc;

    private String usageScenario;

    private String tags;

    private Integer limit;

    private static final long serialVersionUID = 1L;
}
