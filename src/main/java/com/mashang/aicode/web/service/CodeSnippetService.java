package com.mashang.aicode.web.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.IService;
import com.mashang.aicode.web.model.entity.CodeSnippet;

import java.util.List;

public interface CodeSnippetService extends IService<CodeSnippet> {

    List<CodeSnippet> querySnippets(String snippetType, String category, List<String> tags);

    String getSnippetAsReference(Long snippetId);
}
