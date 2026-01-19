package com.mashang.aicode.web.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.mashang.aicode.web.model.entity.UserPoint;

public interface UserPointService extends IService<UserPoint> {
    
    UserPoint getUserPointByUserId(Long userId);

    /**
     * 获取用户积分信息，如果不存在则创建
     *
     * @param userId 用户ID
     * @return 用户积分对象
     */
    UserPoint getOrCreateUserPoint(Long userId);

    /**
     * 增加用户积分
     *
     * @param userId 用户ID
     * @param points 积分数量
     * @param type 积分类型
     * @param reason 变动原因
     * @param relatedId 关联ID（可选）
     * @return 是否成功
     */
    boolean addPoints(Long userId, Integer points, String type, String reason, Long relatedId);

    /**
     * 扣减用户积分
     *
     * @param userId 用户ID
     * @param points 积分数量
     * @param type 积分类型
     * @param reason 变动原因
     * @param relatedId 关联ID（可选）
     * @return 是否成功
     */
    boolean deductPoints(Long userId, Integer points, String type, String reason, Long relatedId);

    /**
     * 扣减用户积分（AI生成专用，包含模型和token信息）
     *
     * @param userId 用户ID
     * @param points 积分数量
     * @param type 积分类型
     * @param reason 变动原因
     * @param relatedId 关联ID（可选）
     * @param modelKey 使用的模型key
     * @param tokenCount 消耗的token数量
     * @return 是否成功
     */
    boolean deductPointsWithModel(Long userId, Integer points, String type, String reason,
                                  Long relatedId, String modelKey, Integer tokenCount);

    /**
     * 查询用户当前可用积分
     *
     * @param userId 用户ID
     * @return 可用积分数量
     */
    Integer getAvailablePoints(Long userId);

    /**
     * 检查用户积分是否充足
     *
     * @param userId 用户ID
     * @param points 需要的积分数量
     * @return 是否充足
     */
    boolean checkPointsSufficient(Long userId, Integer points);
}
