package com.mashang.aicode.web.service;

import com.mashang.aicode.web.model.dto.friend.FriendListQueryDTO;
import com.mashang.aicode.web.model.dto.friend.FriendRequestSendDTO;
import com.mashang.aicode.web.model.entity.FriendRelation;
import com.mashang.aicode.web.model.entity.FriendRequest;
import com.mashang.aicode.web.model.vo.FriendRequestVO;
import com.mashang.aicode.web.model.vo.UserVO;
import com.mybatisflex.core.paginate.Page;

/**
 * 好友服务接口
 */
public interface FriendService {

    /**
     * 发送好友请求
     *
     * @param requestDTO 发送好友请求DTO
     * @param userId     当前用户ID
     * @return 好友请求
     */
    FriendRequest sendFriendRequest(FriendRequestSendDTO requestDTO, Long userId);

    /**
     * 接受好友请求
     *
     * @param requestId 请求ID
     * @param userId    当前用户ID
     * @return 是否成功
     */
    boolean acceptFriendRequest(Long requestId, Long userId);

    /**
     * 拒绝好友请求
     *
     * @param requestId 请求ID
     * @param userId    当前用户ID
     * @return 是否成功
     */
    boolean rejectFriendRequest(Long requestId, Long userId);

    /**
     * 获取收到的好友请求列表
     *
     * @param status  请求状态
     * @param pageNum 页码
     * @param pageSize 每页大小
     * @param userId  当前用户ID
     * @return 好友请求分页列表
     */
    Page<FriendRequestVO> getReceivedFriendRequests(String status, Integer pageNum, Integer pageSize, Long userId);

    /**
     * 获取好友列表
     *
     * @param queryDTO 查询DTO
     * @param userId   当前用户ID
     * @return 好友用户分页列表
     */
    Page<UserVO> getFriendList(FriendListQueryDTO queryDTO, Long userId);

    /**
     * 删除好友
     *
     * @param friendId 好友ID
     * @param userId   当前用户ID
     * @return 是否成功
     */
    boolean deleteFriend(Long friendId, Long userId);

    /**
     * 检查是否为好友
     *
     * @param userId   用户ID
     * @param friendId 好友ID
     * @return 是否为好友
     */
    boolean isFriend(Long userId, Long friendId);
}