package com.mashang.aicode.web.ai.core;

import com.mashang.aicode.web.ai.model.HtmlCodeResult;
import com.mashang.aicode.web.ai.model.MultiFileCodeResult;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 处理ai流式返回
 */
public class CodeParser {

    private static final Pattern HTML_CODE_PATTERN = Pattern.compile("```\\s*html\\b[^\\r\\n]*\\R?([\\s\\S]*?)\\R?```", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
    private static final Pattern CSS_CODE_PATTERN = Pattern.compile("```\\s*css\\b[^\\r\\n]*\\R?([\\s\\S]*?)\\R?```", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
    private static final Pattern JS_CODE_PATTERN = Pattern.compile("```\\s*(?:js|javascript)\\b[^\\r\\n]*\\R?([\\s\\S]*?)\\R?```", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);

    // Fallback patterns
    private static final Pattern HTML_DOCTYPE_BLOCK = Pattern.compile("<!DOCTYPE\\s+html[\\s\\S]*?</html>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
    private static final Pattern CSS_STYLE_TAG_INNER = Pattern.compile("<style[\\s\\S]*?>([\\s\\S]*?)</style>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
    private static final Pattern JS_SCRIPT_TAG_INNER = Pattern.compile("<script[\\s\\S]*?>([\\s\\S]*?)</script>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
    private static final Pattern CSS_LABEL_BLOCK = Pattern.compile("(?i)(?:^|\\R)css\\s*格式\\s*\\R([\\s\\S]*?)(?=(?:\\R```|\\R```\\s*js|\\Rjs\\s*格式|\\Z))", Pattern.DOTALL);
    private static final Pattern CSS_FENCE_OPEN_TO_EOF = Pattern.compile("```\\s*css\\b[^\\r\\n]*\\R?([\\s\\S]*)$", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
    private static final Pattern JS_FENCE_OPEN_TO_EOF = Pattern.compile("```\\s*(?:js|javascript)\\b[^\\r\\n]*\\R?([\\s\\S]*)$", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);


    public static HtmlCodeResult parseHtmlCode(String codeContent) {
        HtmlCodeResult result = new HtmlCodeResult();

        String htmlCode = extractHtmlCode(codeContent);
        if (htmlCode != null && !htmlCode.trim().isEmpty()) {
            result.setHtmlCode(htmlCode.trim());
        } else {

            result.setHtmlCode(codeContent.trim());
        }
        return result;
    }


    public static MultiFileCodeResult parseMultiFileCode(String codeContent) {
        MultiFileCodeResult result = new MultiFileCodeResult();

        String htmlCode = extractCodeByPattern(codeContent, HTML_CODE_PATTERN);
        if (isBlank(htmlCode)) {
            // try full HTML block
            String block = extractWholeMatch(codeContent, HTML_DOCTYPE_BLOCK);
            if (!isBlank(block)) {
                htmlCode = block;
            }
        }

        String cssCode = extractCodeByPattern(codeContent, CSS_CODE_PATTERN);
        if (isBlank(cssCode)) {
            String inner = extractCodeByPattern(codeContent, CSS_STYLE_TAG_INNER);
            if (isBlank(inner)) {
                inner = extractCodeByPattern(codeContent, CSS_LABEL_BLOCK);
            }
            if (isBlank(inner)) {
                inner = extractCodeByPattern(codeContent, CSS_FENCE_OPEN_TO_EOF);
            }
            cssCode = inner;
        }

        String jsCode = extractCodeByPattern(codeContent, JS_CODE_PATTERN);
        if (isBlank(jsCode)) {
            String inner = extractCodeByPattern(codeContent, JS_SCRIPT_TAG_INNER);
            if (isBlank(inner)) {
                inner = extractCodeByPattern(codeContent, JS_FENCE_OPEN_TO_EOF);
            }
            jsCode = inner;
        }

        if (!isBlank(htmlCode)) {
            result.setHtmlCode(htmlCode.trim());
        }

        if (!isBlank(cssCode)) {
            result.setCssCode(cssCode.trim());
        }

        if (!isBlank(jsCode)) {
            result.setJsCode(jsCode.trim());
        }
        return result;
    }


    private static String extractHtmlCode(String content) {
        Matcher matcher = HTML_CODE_PATTERN.matcher(content);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }


    private static String extractCodeByPattern(String content, Pattern pattern) {
        Matcher matcher = pattern.matcher(content);
        if (matcher.find()) {
            return matcher.groupCount() >= 1 ? matcher.group(1) : matcher.group(0);
        }
        return null;
    }

    private static String extractWholeMatch(String content, Pattern pattern) {
        Matcher matcher = pattern.matcher(content);
        if (matcher.find()) {
            return matcher.group(0);
        }
        return null;
    }

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}


