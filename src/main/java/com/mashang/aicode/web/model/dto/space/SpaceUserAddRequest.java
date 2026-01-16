package com.mashang.aicode.web.model.dto.space;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.io.Serializable;

@Data
public class SpaceUserAddRequest implements Serializable {

    @NotNull(message = "空间ID不能为空")
    private Long spaceId;

    @NotNull(message = "用户ID不能为空")
    private Long userId;

    @NotBlank(message = "角色不能为空")
    private String role;
}
