package com.mashang.aicode.web.manager.cos;

import com.mashang.aicode.web.config.CosClientConfig;
import com.qcloud.cos.COSClient;
import com.qcloud.cos.model.PutObjectRequest;
import com.qcloud.cos.model.PutObjectResult;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.File;

@Component
@Slf4j
/**
 * cos通用操作类
 */ public class CosManager {

    @Resource
    private CosClientConfig cosClientConfig;

    @Resource
    private COSClient cosClient;


    public PutObjectResult putObject(String key, File file) {
        PutObjectRequest putObjectRequest = new PutObjectRequest(cosClientConfig.getBucket(), key, file);
        return cosClient.putObject(putObjectRequest);
    }


    public String uploadFile(String key, File file) {

        PutObjectResult result = putObject(key, file);
        if (result != null) {

            String url = String.format("%s/%s", cosClientConfig.getHost(), key);
            log.info("文件上传COS成功: {} -> {}", file.getName(), url);
            return url;
        } else {
            log.error("文件上传COS失败，返回结果为空");
            return null;
        }
    }
}


