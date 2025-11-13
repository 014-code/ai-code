package com.mashang.aicode.web.config;

import com.qcloud.cos.COSClient;
import com.qcloud.cos.ClientConfig;
import com.qcloud.cos.auth.BasicCOSCredentials;
import com.qcloud.cos.auth.COSCredentials;
import com.qcloud.cos.region.Region;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "cos.client")
@Data
/**
 * cos初始化配置
 */
public class CosClientConfig {


    private String host;


    private String secretId;


    private String secretKey;


    private String region;


    private String bucket;

    @Bean
    public COSClient cosClient() {

        COSCredentials cred = new BasicCOSCredentials(secretId, secretKey);

        ClientConfig clientConfig = new ClientConfig(new Region(region));

        return new COSClient(cred, clientConfig);
    }
}


