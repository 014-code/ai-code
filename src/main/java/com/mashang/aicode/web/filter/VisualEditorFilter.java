package com.mashang.aicode.web.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * 可视化编辑器过滤器
 * 当URL包含 visualEdit=true 参数时，在HTML中注入基础消息监听器脚本
 */
@Component
@Order(1)
public class VisualEditorFilter implements Filter {

    // 基础消息监听器脚本 - 用于接收 INJECT_SCRIPT 消息
    private static final String BOOTSTRAP_SCRIPT = """
        <script>
        (function() {
          if (window.__visualEditorBootstrapSetup) return;
          window.__visualEditorBootstrapSetup = true;
          
          console.log('VisualEditor: Bootstrap message listener setup');
          
          window.addEventListener('message', function(event) {
            if (event.data && event.data.type === 'INJECT_SCRIPT' && event.data.script) {
              try {
                console.log('VisualEditor: Received INJECT_SCRIPT message');
                eval(event.data.script);
                console.log('VisualEditor: Script executed successfully');
              } catch (error) {
                console.error('VisualEditor: Script evaluation error:', error);
              }
            }
          });
        })();
        </script>
        """;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String requestURI = httpRequest.getRequestURI();
        String visualEdit = httpRequest.getParameter("visualEdit");
        
        // 检查是否是静态资源请求（/deploy/** 或 /output/**）
        // 注意：由于context-path是/api，实际路径可能是 /api/deploy/** 或直接 /deploy/**
        boolean isStaticResource = requestURI.contains("/deploy/") || requestURI.contains("/output/");
        
        if (isStaticResource) {
            System.out.println("VisualEditorFilter: Static resource request - URI=" + requestURI + ", visualEdit=" + visualEdit);
        }
        
        // 检查是否有 visualEdit 参数
        if (!"true".equals(visualEdit)) {
            // 没有 visualEdit 参数，直接放行
            chain.doFilter(request, response);
            return;
        }
        
        // 只处理静态资源请求（/deploy/** 和 /output/** 路径）
        if (!isStaticResource) {
            chain.doFilter(request, response);
            return;
        }

        // 包装响应以便读取和修改内容
        ContentCachingResponseWrapper wrappedResponse = new ContentCachingResponseWrapper(httpResponse);
        
        try {
            chain.doFilter(request, wrappedResponse);
        } finally {
            // 获取响应内容
            byte[] content = wrappedResponse.getContentAsByteArray();
            
            if (content.length > 0) {
                String contentType = wrappedResponse.getContentType();
                
                // 只处理HTML响应
                if (contentType != null && contentType.contains("text/html")) {
                    String html = new String(content, StandardCharsets.UTF_8);
                    
                    // 检查是否已经注入过脚本（避免重复注入）
                    if (!html.contains("__visualEditorBootstrapSetup")) {
                        // 在 </head> 之前注入脚本（优先）
                        String modifiedHtml;
                        if (html.contains("</head>")) {
                            modifiedHtml = html.replace("</head>", BOOTSTRAP_SCRIPT + "</head>");
                        } else if (html.contains("</body>")) {
                            // 如果没有 </head>，在 </body> 之前注入
                            modifiedHtml = html.replace("</body>", BOOTSTRAP_SCRIPT + "</body>");
                        } else {
                            // 如果都没有，在开头添加
                            modifiedHtml = BOOTSTRAP_SCRIPT + html;
                        }
                        
                        // 更新响应内容
                        byte[] modifiedContent = modifiedHtml.getBytes(StandardCharsets.UTF_8);
                        wrappedResponse.setContentLength(modifiedContent.length);
                        wrappedResponse.getOutputStream().write(modifiedContent);
                        
                        System.out.println("VisualEditorFilter: ✅ Successfully injected bootstrap script into HTML response");
                        System.out.println("VisualEditorFilter: Modified content length: " + modifiedContent.length + " bytes");
                    }
                }
            }
            
            // 将修改后的响应内容写入原始响应
            wrappedResponse.copyBodyToResponse();
        }
    }
}

