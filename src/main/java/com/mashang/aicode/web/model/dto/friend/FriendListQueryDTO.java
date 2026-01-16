package com.mashang.aicode.web.model.dto.friend;

import com.mashang.aicode.web.common.PageRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 好友列表查询DTO
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class FriendListQueryDTO extends PageRequest {
}