package com.mashang.aicode.web.ai.tool;

import cn.hutool.json.JSONObject;

public abstract class BaseTool {


    public abstract String getToolName();


    public abstract String getDisplayName();


    public String generateToolRequestResponse() {
        return String.format("\n\n[选择工具] %s\n\n", getDisplayName());
    }


    public abstract String generateToolExecutedResult(JSONObject arguments);
}


