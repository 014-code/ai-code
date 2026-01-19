package com.mashang.aicode.web.model.vo;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
public class UserPointVO implements Serializable {

    private Long id;

    private Long userId;

    private Integer totalPoints;

    private Integer availablePoints;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
