package com.mashang.aicode.web.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.mashang.aicode.web.model.entity.SignInRecord;

import java.util.Map;

/**
 * 签到记录 服务层
 */
public interface SignInRecordService extends IService<SignInRecord> {

    /**
     * 用户每日签到
     *
     * @param userId 用户ID
     * @return 签到结果（包含获得的积分、连续签到天数等信息）
     */
    Map<String, Object> dailySignIn(Long userId);

    /**
     * 检查用户今日是否已签到
     *
     * @param userId 用户ID
     * @return 是否已签到
     */
    boolean hasSignedInToday(Long userId);

    /**
     * 获取用户当前连续签到天数
     *
     * @param userId 用户ID
     * @return 连续签到天数
     */
    Integer getContinuousDays(Long userId);

    /**
     * 获取用户签到状态信息
     *
     * @param userId 用户ID
     * @return 签到状态信息（是否已签到、连续天数等）
     */
    Map<String, Object> getSignInStatus(Long userId);

}
