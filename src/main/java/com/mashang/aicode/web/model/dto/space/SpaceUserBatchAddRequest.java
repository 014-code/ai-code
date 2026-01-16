package com.mashang.aicode.web.model.dto.space;

import lombok.Data;
import java.util.List;

/**
 * 空间批量添加成员请求
 */
@Data
public class SpaceUserBatchAddRequest {

    /**
     * 空间ID
     */
    private Long spaceId;

    /**
     * 用户ID列表
     */
    private List<Long> userIds;

    /**
     * 角色
     */
    private String role;
}