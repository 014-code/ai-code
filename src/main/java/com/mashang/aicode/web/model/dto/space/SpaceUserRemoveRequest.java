package com.mashang.aicode.web.model.dto.space;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.io.Serializable;

@Data
public class SpaceUserRemoveRequest implements Serializable {

    @NotNull(message = "空间ID不能为空")
    private Long spaceId;

    @NotNull(message = "用户ID不能为空")
    private Long userId;
}
