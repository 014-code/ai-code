package com.mashang.aicode.web.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

/**
 * Web MVC 配置 - 静态资源映射
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 映射部署目录的静态资源
        String deployDirPath = System.getProperty("user.dir") + File.separator + "tmp" + File.separator + "code_deploy";
        registry.addResourceHandler("/deploy/**")
                .addResourceLocations("file:" + deployDirPath + File.separator);

        // 映射输出目录的静态资源（用于预览）
        String outputDirPath = System.getProperty("user.dir") + File.separator + "tmp" + File.separator + "code_output";
        registry.addResourceHandler("/output/**")
                .addResourceLocations("file:" + outputDirPath + File.separator);
    }
}