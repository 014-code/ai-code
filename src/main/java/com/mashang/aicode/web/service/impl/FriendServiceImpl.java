package com.mashang.aicode.web.service.impl;

import com.mashang.aicode.web.exception.BusinessException;
import com.mashang.aicode.web.exception.ErrorCode;
import com.mashang.aicode.web.mapper.FriendRelationMapper;
import com.mashang.aicode.web.mapper.FriendRequestMapper;
import com.mashang.aicode.web.mapper.UserMapper;
import com.mashang.aicode.web.model.dto.friend.FriendListQueryDTO;
import com.mashang.aicode.web.model.dto.friend.FriendRequestSendDTO;
import com.mashang.aicode.web.model.entity.FriendRelation;
import com.mashang.aicode.web.model.entity.FriendRequest;
import com.mashang.aicode.web.model.entity.User;
import com.mashang.aicode.web.model.vo.FriendRequestVO;
import com.mashang.aicode.web.model.vo.UserVO;
import com.mashang.aicode.web.service.FriendService;
import com.mashang.aicode.web.service.UserService;
import com.mybatisflex.core.paginate.Page;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * 好友服务实现类
 */
@Service
@Slf4j
public class FriendServiceImpl implements FriendService {

    @Resource
    private FriendRequestMapper friendRequestMapper;

    @Resource
    private FriendRelationMapper friendRelationMapper;

    @Resource
    private UserMapper userMapper;

    @Resource
    private UserService userService;

    /**
     * 发送好友请求
     */
    @Override
    public FriendRequest sendFriendRequest(FriendRequestSendDTO requestDTO, Long userId) {
        Long addresseeId = requestDTO.getAddresseeId();

        // 检查是否发送给自己
        if (userId.equals(addresseeId)) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "不能向自己发送好友请求");
        }

        // 检查接收方是否存在
        User addressee = userMapper.selectOneById(addresseeId);
        if (addressee == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "用户不存在");
        }

        // 检查是否已经是好友
        FriendRelation existingRelation = friendRelationMapper.selectByUserIdAndFriendId(userId, addresseeId);
        if (existingRelation != null && "ACCEPTED".equals(existingRelation.getStatus())) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "已经是好友关系");
        }

        // 检查是否已经有未处理的请求
        FriendRequest existingRequest = friendRequestMapper.selectByRequesterAndAddressee(userId, addresseeId, "PENDING");
        if (existingRequest != null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "已经发送过好友请求，等待对方处理");
        }

        // 创建好友请求
        Date now = new Date();
        FriendRequest friendRequest = FriendRequest.builder()
                .requesterId(userId)
                .addresseeId(addresseeId)
                .status("PENDING")
                .message(requestDTO.getMessage())
                .createTime(now)
                .updateTime(now)
                .build();

        if (friendRequestMapper.insert(friendRequest) < 1) {
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "发送好友请求失败");
        }

        return friendRequest;
    }

    /**
     * 接受好友请求
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean acceptFriendRequest(Long requestId, Long userId) {
        // 查询好友请求
        FriendRequest friendRequest = friendRequestMapper.selectOneById(requestId);
        if (friendRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "好友请求不存在");
        }

        // 检查是否是接收方
        if (!friendRequest.getAddresseeId().equals(userId)) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR, "无权处理此请求");
        }

        // 检查请求状态
        if (!"PENDING".equals(friendRequest.getStatus())) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "好友请求状态错误");
        }

        // 更新请求状态
        friendRequest.setStatus("ACCEPTED");
        friendRequest.setUpdateTime(new Date());
        if (!friendRequestMapper.updateById(friendRequest)) {
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "更新请求状态失败");
        }

        Long requesterId = friendRequest.getRequesterId();

        // 创建双向好友关系
        createFriendRelation(userId, requesterId);
        createFriendRelation(requesterId, userId);

        return true;
    }

    /**
     * 拒绝好友请求
     */
    @Override
    public boolean rejectFriendRequest(Long requestId, Long userId) {
        // 查询好友请求
        FriendRequest friendRequest = friendRequestMapper.selectOneById(requestId);
        if (friendRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "好友请求不存在");
        }

        // 检查是否是接收方
        if (!friendRequest.getAddresseeId().equals(userId)) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR, "无权处理此请求");
        }

        // 检查请求状态
        if (!"PENDING".equals(friendRequest.getStatus())) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "好友请求状态错误");
        }

        // 更新请求状态
        friendRequest.setStatus("REJECTED");
        friendRequest.setUpdateTime(new Date());
        if (!friendRequestMapper.updateById(friendRequest)) {
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "更新请求状态失败");
        }

        return true;
    }

    /**
     * 获取收到的好友请求列表
     */
    @Override
    public Page<FriendRequestVO> getReceivedFriendRequests(String status, Integer pageNum, Integer pageSize, Long userId) {
        // 计算偏移量
        Integer offset = (pageNum - 1) * pageSize;

        // 查询请求列表
        List<FriendRequest> requests = friendRequestMapper.selectRequestsByAddresseeId(userId, status, offset, pageSize);
        Integer total = friendRequestMapper.countRequestsByAddresseeId(userId, status);

        // 构建VO列表
        List<FriendRequestVO> requestVOs = new ArrayList<>();
        for (FriendRequest request : requests) {
            FriendRequestVO requestVO = new FriendRequestVO();
            requestVO.setId(request.getId());
            requestVO.setMessage(request.getMessage());
            requestVO.setStatus(request.getStatus());
            requestVO.setCreateTime(request.getCreateTime());

            // 查询请求方用户信息
            User requester = userMapper.selectOneById(request.getRequesterId());
            if (requester != null) {
                UserVO userVO = userService.getUserVO(requester);
                requestVO.setRequester(userVO);
            }

            requestVOs.add(requestVO);
        }

        // 构建分页结果
        Page<FriendRequestVO> page = new Page<>(pageNum, pageSize, total);
        page.setRecords(requestVOs);

        return page;
    }

    /**
     * 获取好友列表
     */
    @Override
    public Page<UserVO> getFriendList(FriendListQueryDTO queryDTO, Long userId) {
        Integer pageNum = queryDTO.getPageNum();
        Integer pageSize = queryDTO.getPageSize();

        // 计算偏移量
        Integer offset = (pageNum - 1) * pageSize;

        // 查询好友关系列表
        List<FriendRelation> relations = friendRelationMapper.selectFriendsByUserId(userId, "ACCEPTED", offset, pageSize);
        Integer total = friendRelationMapper.countFriendsByUserId(userId, "ACCEPTED");

        // 构建用户VO列表
        List<UserVO> userVOs = new ArrayList<>();
        for (FriendRelation relation : relations) {
            User friend = userMapper.selectOneById(relation.getFriendId());
            if (friend != null) {
                UserVO userVO = userService.getUserVO(friend);
                userVOs.add(userVO);
            }
        }

        // 构建分页结果
        Page<UserVO> page = new Page<>(pageNum, pageSize, total);
        page.setRecords(userVOs);

        return page;
    }

    /**
     * 删除好友
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteFriend(Long friendId, Long userId) {
        // 删除双向好友关系
        deleteFriendRelation(userId, friendId);
        deleteFriendRelation(friendId, userId);

        return true;
    }

    /**
     * 检查是否为好友
     */
    @Override
    public boolean isFriend(Long userId, Long friendId) {
        FriendRelation relation = friendRelationMapper.selectByUserIdAndFriendId(userId, friendId);
        return relation != null && "ACCEPTED".equals(relation.getStatus());
    }

    /**
     * 创建好友关系
     */
    private void createFriendRelation(Long userId, Long friendId) {
        Date now = new Date();
        FriendRelation friendRelation = FriendRelation.builder()
                .userId(userId)
                .friendId(friendId)
                .status("ACCEPTED")
                .createTime(now)
                .updateTime(now)
                .build();

        if (friendRelationMapper.insert(friendRelation) < 1) {
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "创建好友关系失败");
        }
    }

    /**
     * 删除好友关系
     */
    private void deleteFriendRelation(Long userId, Long friendId) {
        FriendRelation relation = friendRelationMapper.selectByUserIdAndFriendId(userId, friendId);
        if (relation != null) {
            friendRelationMapper.deleteById(relation.getId());
        }
    }
}