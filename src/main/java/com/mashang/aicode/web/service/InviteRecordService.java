package com.mashang.aicode.web.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.mashang.aicode.web.model.entity.InviteRecord;

import java.util.List;

public interface InviteRecordService extends IService<InviteRecord> {

    /**
     * 为用户生成邀请码
     *
     * @param userId 用户ID
     * @return 邀请码
     */
    String generateInviteCode(Long userId);

    /**
     * 绑定邀请关系（新用户注册时调用）
     *
     * @param inviteCode 邀请码
     * @param inviteeId 被邀请人ID
     * @param registerIp 注册IP
     * @param deviceId 设备ID
     * @return 是否绑定成功
     */
    boolean bindInvite(String inviteCode, Long inviteeId, String registerIp, String deviceId);

    /**
     * 发放邀请注册奖励
     *
     * @param inviteeId 被邀请人ID
     * @return 是否发放成功
     */
    boolean rewardInviteRegister(Long inviteeId);

    /**
     * 发放邀请首次生成奖励
     *
     * @param inviteeId 被邀请人ID
     * @return 是否发放成功
     */
    boolean rewardInviteFirstGenerate(Long inviteeId);

    /**
     * 检查邀请是否存在防刷风险
     *
     * @param registerIp 注册IP
     * @param deviceId 设备ID
     * @return 是否存在风险
     */
    boolean checkInviteAbuse(String registerIp, String deviceId);

    /**
     * 获取用户的邀请记录列表
     *
     * @param userId 用户ID
     * @return 邀请记录列表
     */
    List<InviteRecord> getUserInviteRecords(Long userId);

    /**
     * 获取用户的邀请码
     *
     * @param userId 用户ID
     * @return 邀请码
     */
    String getUserInviteCode(Long userId);

    /**
     * 回收超期未激活的邀请注册奖励
     *
     * @return 回收的邀请记录数量
     */
    int revokeExpiredInviteRewards();
}
