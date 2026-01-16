package com.mashang.aicode.web.model.dto.friend;

import com.mashang.aicode.web.common.PageRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 好友请求查询DTO
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class FriendRequestQueryDTO extends PageRequest {

    /**
     * 请求状态：PENDING（待处理）、ACCEPTED（已接受）、REJECTED（已拒绝）
     */
    private String status;
}