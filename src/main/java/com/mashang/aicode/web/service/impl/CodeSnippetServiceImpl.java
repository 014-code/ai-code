package com.mashang.aicode.web.service.impl;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mashang.aicode.web.mapper.CodeSnippetMapper;
import com.mashang.aicode.web.model.entity.CodeSnippet;
import com.mashang.aicode.web.service.CodeSnippetService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class CodeSnippetServiceImpl extends ServiceImpl<CodeSnippetMapper, CodeSnippet> implements CodeSnippetService {

    @Override
    public List<CodeSnippet> querySnippets(String snippetType, String category, List<String> tags) {
        QueryWrapper<CodeSnippet> wrapper = new QueryWrapper<>();

        if (StrUtil.isNotBlank(snippetType)) {
            wrapper.eq("snippetType", snippetType);
        }

        if (StrUtil.isNotBlank(category)) {
            wrapper.eq("snippetCategory", category);
        }

        if (tags != null && !tags.isEmpty()) {
            wrapper.and(w -> {
                for (String tag : tags) {
                    w.like("tags", tag);
                }
            });
        }

        wrapper.eq("isActive", 1);
        wrapper.eq("isDelete", 0);
        wrapper.orderByDesc("priority");
        wrapper.last("LIMIT 5");
        return list(wrapper);
    }

    @Override
    public String getSnippetAsReference(Long snippetId) {
        CodeSnippet snippet = getById(snippetId);
        if (snippet == null) {
            return null;
        }

        return String.format(
            "【代码片段参考】\n" +
            "名称：%s\n" +
            "类型：%s\n" +
            "场景：%s\n" +
            "代码：\n```\n%s\n```",
            snippet.getSnippetName(),
            snippet.getSnippetType(),
            snippet.getUsageScenario(),
            snippet.getSnippetCode()
        );
    }
}
