package com.mashang.aicode.web.model.vo;

import lombok.Data;

import java.io.Serializable;
import java.util.Date;

@Data
public class SpaceUserVO implements Serializable {

    private Long id;

    private Long spaceId;

    private String spaceName;

    private Long userId;

    private String userName;

    private String userAvatar;

    private String role;

    private String roleText;

    private String permissions;

    private Date joinTime;
}
