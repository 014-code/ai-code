package com.mashang.aicode.web.model.vo;

import lombok.Data;

import java.io.Serializable;
import java.util.Date;

@Data
public class SpaceVO implements Serializable {

    private Long id;

    private String spaceName;

    private Integer spaceType;

    private String spaceTypeText;

    private Long ownerId;

    private String ownerName;

    private String description;

    private Integer memberCount;

    private Integer appCount;

    private Date createTime;

    private Date updateTime;
}
