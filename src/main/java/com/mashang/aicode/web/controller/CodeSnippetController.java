package com.mashang.aicode.web.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.mashang.aicode.web.annotation.AuthCheck;
import com.mashang.aicode.web.common.BaseResponse;
import com.mashang.aicode.web.common.ResultUtils;
import com.mashang.aicode.web.constant.UserConstant;
import com.mashang.aicode.web.exception.ErrorCode;
import com.mashang.aicode.web.exception.ThrowUtils;
import com.mashang.aicode.web.model.dto.snippet.CodeSnippetQueryRequest;
import com.mashang.aicode.web.model.entity.CodeSnippet;
import com.mashang.aicode.web.service.CodeSnippetService;
import jakarta.annotation.Resource;
import org.apache.commons.lang3.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/codeSnippet")
public class CodeSnippetController {

    @Resource
    private CodeSnippetService codeSnippetService;

    @PostMapping("/add")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Long> addCodeSnippet(@RequestBody CodeSnippet codeSnippet) {
        ThrowUtils.throwIf(codeSnippet == null, ErrorCode.PARAMS_ERROR);
        boolean result = codeSnippetService.save(codeSnippet);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return ResultUtils.success(codeSnippet.getId());
    }

    @PostMapping("/update")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> updateCodeSnippet(@RequestBody CodeSnippet codeSnippet) {
        ThrowUtils.throwIf(codeSnippet == null || codeSnippet.getId() == null, ErrorCode.PARAMS_ERROR);
        boolean result = codeSnippetService.updateById(codeSnippet);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return ResultUtils.success(true);
    }

    @PostMapping("/delete")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> deleteCodeSnippet(@RequestBody CodeSnippet codeSnippet) {
        ThrowUtils.throwIf(codeSnippet == null || codeSnippet.getId() == null, ErrorCode.PARAMS_ERROR);
        boolean result = codeSnippetService.removeById(codeSnippet.getId());
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return ResultUtils.success(true);
    }

    @GetMapping("/get/{id}")
    public BaseResponse<CodeSnippet> getCodeSnippet(@PathVariable Long id) {
        ThrowUtils.throwIf(id == null, ErrorCode.PARAMS_ERROR);
        CodeSnippet codeSnippet = codeSnippetService.getById(id);
        ThrowUtils.throwIf(codeSnippet == null, ErrorCode.NOT_FOUND_ERROR);
        return ResultUtils.success(codeSnippet);
    }

    @GetMapping("/list")
    public BaseResponse<List<CodeSnippet>> getCodeSnippets(
            @RequestParam(required = false) String snippetType,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String tags) {
        QueryWrapper<CodeSnippet> queryWrapper = new QueryWrapper<>();
        if (snippetType != null) {
            queryWrapper.eq("snippet_type", snippetType);
        }
        if (category != null) {
            queryWrapper.eq("snippet_category", category);
        }
        if (tags != null && !tags.isEmpty()) {
            String[] tagArray = tags.split(",");
            queryWrapper.and(w -> {
                for (String tag : tagArray) {
                    w.like("tags", tag);
                }
            });
        }
        queryWrapper.eq("is_active", 1);
        queryWrapper.eq("is_delete", 0);
        queryWrapper.orderByDesc("priority");
        queryWrapper.last("LIMIT 20");
        List<CodeSnippet> snippets = codeSnippetService.list(queryWrapper);
        return ResultUtils.success(snippets);
    }

    @PostMapping("/search")
    public BaseResponse<List<CodeSnippet>> searchCodeSnippets(@RequestBody CodeSnippetQueryRequest request) {
        QueryWrapper<CodeSnippet> queryWrapper = new QueryWrapper<>();
        
        if (StringUtils.isNotBlank(request.getSnippetType())) {
            queryWrapper.eq("snippet_type", request.getSnippetType());
        }
        
        if (StringUtils.isNotBlank(request.getSnippetCategory())) {
            queryWrapper.eq("snippet_category", request.getSnippetCategory());
        }
        
        if (StringUtils.isNotBlank(request.getSnippetDesc())) {
            queryWrapper.like("snippet_desc", request.getSnippetDesc());
        }
        
        if (StringUtils.isNotBlank(request.getUsageScenario())) {
            queryWrapper.like("usage_scenario", request.getUsageScenario());
        }
        
        if (StringUtils.isNotBlank(request.getTags())) {
            String[] tagArray = request.getTags().split(",");
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
        
        Integer limit = request.getLimit();
        if (limit == null || limit <= 0) {
            limit = 20;
        }
        if (limit > 100) {
            limit = 100;
        }
        queryWrapper.last("LIMIT " + limit);
        
        List<CodeSnippet> snippets = codeSnippetService.list(queryWrapper);
        return ResultUtils.success(snippets);
    }
}
