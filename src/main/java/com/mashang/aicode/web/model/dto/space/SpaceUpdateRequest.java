package com.mashang.aicode.web.model.dto.space;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.io.Serializable;

@Data
public class SpaceUpdateRequest implements Serializable {

    @NotNull(message = "空间ID不能为空")
    private Long id;

    private String spaceName;

    private String description;
}
