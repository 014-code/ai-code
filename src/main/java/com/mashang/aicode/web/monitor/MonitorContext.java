package com.mashang.aicode.web.monitor;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;

/**
 * 监控上下文
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonitorContext implements Serializable {
    //用户id
    private String userId;
    //应用id
    private String appId;
    //模型key
    private String modelKey;

    @Serial
    private static final long serialVersionUID = 1L;
}


