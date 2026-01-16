package com.mashang.aicode.web.model.dto.space;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.io.Serializable;

@Data
public class SpaceAddRequest implements Serializable {

    @NotBlank(message = "空间名称不能为空")
    private String spaceName;

    @NotNull(message = "空间类型不能为空")
    private Integer spaceType;

    private String description;
}
