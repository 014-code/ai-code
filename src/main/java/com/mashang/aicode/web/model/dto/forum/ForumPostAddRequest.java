package com.mashang.aicode.web.model.dto.forum;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class ForumPostAddRequest implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String title;

    private String content;

    private Long appId;

}
