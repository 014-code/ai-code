package com.mashang.aicode.web.model.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
public class ForumPostSimpleVO implements Serializable {

	@Serial
	private static final long serialVersionUID = 1L;

	private Long id;

	private String title;

	private Long appId;

	private AppVO app;

	private Long userId;

	private UserVO user;

	private Integer viewCount;

	private Integer likeCount;

	private Integer commentCount;

	private Integer isPinned;

	private LocalDateTime createTime;

	private LocalDateTime updateTime;

}
