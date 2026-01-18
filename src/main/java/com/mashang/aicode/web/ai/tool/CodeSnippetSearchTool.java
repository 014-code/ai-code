package com.mashang.aicode.web.ai.tool;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.mashang.aicode.web.model.entity.CodeSnippet;
import com.mashang.aicode.web.service.CodeSnippetService;
import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import jakarta.annotation.Resource;
import java.util.List;

@Slf4j
@Component
public class CodeSnippetSearchTool {

    @Resource
    private CodeSnippetService codeSnippetService;

    @Tool("查询代码片段模板，根据类型、分类、描述、使用场景或标签搜索适合的代码模板")
    public List<CodeSnippet> searchCodeSnippets(
            @P("代码片段类型，如：component/layout/animation/utility等") String snippetType,
            @P("代码片段分类，如：css/vue/react等") String snippetCategory,
            @P("代码片段描述关键词，用于模糊搜索") String snippetDesc,
            @P("使用场景关键词，如：登录表单/商品列表/用户卡片等") String usageScenario,
            @P("标签，多个标签用逗号分隔，如：button,responsive,hover") String tags,
            @P("返回结果数量限制，默认10，最大50") Integer limit) {
        
        QueryWrapper<CodeSnippet> queryWrapper = new QueryWrapper<>();
        
        if (StrUtil.isNotBlank(snippetType)) {
            queryWrapper.eq("snippet_type", snippetType);
        }
        
        if (StrUtil.isNotBlank(snippetCategory)) {
            queryWrapper.eq("snippet_category", snippetCategory);
        }
        
        if (StrUtil.isNotBlank(snippetDesc)) {
            queryWrapper.like("snippet_desc", snippetDesc);
        }
        
        if (StrUtil.isNotBlank(usageScenario)) {
            queryWrapper.like("usage_scenario", usageScenario);
        }
        
        if (StrUtil.isNotBlank(tags)) {
            String[] tagArray = tags.split(",");
            queryWrapper.and(w -> {
                for (String tag : tagArray) {
                    w.like("tags", tag.trim());
                }
            });
        }
        
        queryWrapper.eq("is_active", 1);
        queryWrapper.eq("is_delete", 0);
        queryWrapper.orderByDesc("priority");
        queryWrapper.orderByDesc("create_time");
        
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
}
