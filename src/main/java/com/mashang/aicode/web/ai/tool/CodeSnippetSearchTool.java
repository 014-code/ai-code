package com.mashang.aicode.web.ai.tool;

import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONObject;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.mashang.aicode.web.model.entity.CodeSnippet;
import com.mashang.aicode.web.service.CodeSnippetService;
import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;

import jakarta.annotation.Resource;

import java.util.List;

@Slf4j
@Component
public class CodeSnippetSearchTool extends BaseTool {

    @Resource
    private CodeSnippetService codeSnippetService;

    //spring-cache缓存用于减少同一参数调用时执行
    @Cacheable(
            value = "tool-results",
            key = "'codeSnippet:' + #snippetType + ':' + #snippetCategory + ':' + #snippetDesc + ':' + #usageScenario + ':' + #tags + ':' + #limit",
            unless = "#result == null || #result.isEmpty()"
    )
    @Tool("查询代码片段模板，根据类型、分类、描述、使用场景或标签搜索适合的代码模板")
    public List<CodeSnippet> searchCodeSnippets(
            @P("代码片段类型，如：component/layout/animation/utility等") String snippetType,
            @P("代码片段分类，如：css/vue/react等") String snippetCategory,
            @P("代码片段描述关键词，用于模糊搜索") String snippetDesc,
            @P("使用场景关键词，如：登录表单/商品列表/用户卡片等") String usageScenario,
            @P("标签，多个标签用逗号分隔，如：button,responsive,hover") String tags,
            @P("返回结果数量限制，默认10，最大50") Integer limit
    ) {

        QueryWrapper<CodeSnippet> queryWrapper = new QueryWrapper<>();

        if (StrUtil.isNotBlank(snippetType)) {
            queryWrapper.eq("snippetType", snippetType);
        }

        if (StrUtil.isNotBlank(snippetCategory)) {
            queryWrapper.eq("snippetCategory", snippetCategory);
        }

        if (StrUtil.isNotBlank(snippetDesc)) {
            queryWrapper.like("snippetDesc", snippetDesc);
        }

        if (StrUtil.isNotBlank(usageScenario)) {
            queryWrapper.like("usageScenario", usageScenario);
        }

        if (StrUtil.isNotBlank(tags)) {
            String[] tagArray = tags.split(",");
            queryWrapper.and(w -> {
                for (String tag : tagArray) {
                    w.like("tags", tag.trim());
                }
            });
        }

        queryWrapper.eq("isActive", 1);
        queryWrapper.eq("isDelete", 0);
        queryWrapper.orderByDesc("priority");
        queryWrapper.orderByDesc("createTime");

        if (limit == null || limit <= 0) {
            limit = 10;
        }
        if (limit > 50) {
            limit = 50;
        }
        queryWrapper.last("LIMIT " + limit);

        List<CodeSnippet> snippets = codeSnippetService.list(queryWrapper);
        log.info("查询代码片段，条件：type={}, category={}, desc={}, scenario={}, tags={}, 返回{}条结果",
                snippetType, snippetCategory, snippetDesc, usageScenario, tags, snippets.size());

        return snippets;
    }

    @Tool("根据代码片段类型查询模板，如：component/layout/animation/utility")
    public List<CodeSnippet> searchByType(
            @P("代码片段类型") String snippetType,
            @P("返回结果数量限制，默认10，最大50") Integer limit) {
        return searchCodeSnippets(snippetType, null, null, null, null, limit);
    }

    @Tool("根据标签查询代码片段模板，多个标签用逗号分隔")
    public List<CodeSnippet> searchByTags(
            @P("标签，如：button,responsive,hover") String tags,
            @P("返回结果数量限制，默认10，最大50") Integer limit) {
        return searchCodeSnippets(null, null, null, null, tags, limit);
    }

    @Tool("根据使用场景查询代码片段模板，如：登录表单/商品列表/用户卡片")
    public List<CodeSnippet> searchByScenario(
            @P("使用场景关键词") String usageScenario,
            @P("返回结果数量限制，默认10，最大50") Integer limit) {
        return searchCodeSnippets(null, null, null, usageScenario, null, limit);
    }

    @Override
    public String getToolName() {
        return "searchCodeSnippets";
    }

    @Override
    public String getDisplayName() {
        return "查询代码片段模板";
    }

    @Override
    public String generateToolExecutedResult(JSONObject arguments) {
        String snippetType = arguments.getStr("snippetType");
        String snippetCategory = arguments.getStr("snippetCategory");
        String snippetDesc = arguments.getStr("snippetDesc");
        String usageScenario = arguments.getStr("usageScenario");
        String tags = arguments.getStr("tags");
        Integer limit = arguments.getInt("limit");

        StringBuilder result = new StringBuilder();
        result.append(String.format("[工具调用] %s\n", getDisplayName()));

        if (StrUtil.isNotBlank(snippetType)) {
            result.append(String.format("- 类型: %s\n", snippetType));
        }
        if (StrUtil.isNotBlank(snippetCategory)) {
            result.append(String.format("- 分类: %s\n", snippetCategory));
        }
        if (StrUtil.isNotBlank(snippetDesc)) {
            result.append(String.format("- 描述关键词: %s\n", snippetDesc));
        }
        if (StrUtil.isNotBlank(usageScenario)) {
            result.append(String.format("- 使用场景: %s\n", usageScenario));
        }
        if (StrUtil.isNotBlank(tags)) {
            result.append(String.format("- 标签: %s\n", tags));
        }
        if (limit != null) {
            result.append(String.format("- 返回数量: %d\n", limit));
        }

        return result.toString();
    }
}
