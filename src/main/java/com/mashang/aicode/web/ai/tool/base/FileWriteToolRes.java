package com.mashang.aicode.web.ai.tool.base;

import cn.hutool.core.io.FileUtil;
import cn.hutool.json.JSONObject;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class FileWriteToolRes extends BaseTool {


    @Override
    public String getToolName() {
        return "writeFile";
    }

    @Override
    public String getDisplayName() {
        return "写入文件";
    }

    @Override
    public String generateToolExecutedResult(JSONObject arguments) {
        String relativeFilePath = arguments.getStr("relativeFilePath");
        String suffix = FileUtil.getSuffix(relativeFilePath);
        String content = arguments.getStr("content");
        return String.format("""
                [工具调用] %s %s
                ```%s
                %s
                ```
                """, getDisplayName(), relativeFilePath, suffix, content);
    }
}


