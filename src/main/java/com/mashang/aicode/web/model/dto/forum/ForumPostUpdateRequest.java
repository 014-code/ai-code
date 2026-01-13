package com.mashang.aicode.web.model.dto.forum;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class ForumPostUpdateRequest implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;

    private String title;

    private String content;

    private Long appId;

    private Integer isPinned;

}
