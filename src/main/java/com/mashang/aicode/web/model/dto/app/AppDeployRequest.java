package com.mashang.aicode.web.model.dto.app;

import lombok.Data;

import java.io.Serializable;

@Data
public class AppDeployRequest implements Serializable {


    private Long appId;

    private static final long serialVersionUID = 1L;
}


