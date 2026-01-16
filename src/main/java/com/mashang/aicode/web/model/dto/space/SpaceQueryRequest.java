package com.mashang.aicode.web.model.dto.space;

import lombok.Data;

import java.io.Serializable;

@Data
public class SpaceQueryRequest implements Serializable {

    private Long id;

    private String spaceName;

    private Integer spaceType;

    private Long ownerId;

    private Integer current;

    private Integer pageSize;

    private String sortField;

    private String sortOrder;
}
