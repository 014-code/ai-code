package com.mashang.aicode.web.model.dto.space;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.io.Serializable;

@Data
public class SpaceAppRequest implements Serializable {

    @NotNull(message = "应用ID不能为空")
    private Long appId;

    @NotNull(message = "空间ID不能为空")
    private Long spaceId;
}
