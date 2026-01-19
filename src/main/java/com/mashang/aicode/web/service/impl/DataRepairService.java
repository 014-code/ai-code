package com.mashang.aicode.web.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.mashang.aicode.web.model.entity.User;
import com.mashang.aicode.web.model.entity.UserPoint;
import com.mashang.aicode.web.model.enums.PointsTypeEnum;
import com.mashang.aicode.web.model.enums.UserRoleEnum;
import com.mashang.aicode.web.service.UserPointService;
import com.mashang.aicode.web.service.UserService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 数据修复服务 - 为现有用户初始化积分
 */
@Service
@Slf4j
public class DataRepairService {

    @Resource
    private UserService userService;

    @Resource
    private UserPointService userPointsService;

    // 初始赠送积分数量
    private static final int INITIAL_POINTS = 100;

    /**
     * 为所有现有用户初始化积分账户
     * @return 成功初始化的用户数量
     */
    @Transactional(rollbackFor = Exception.class)
    public int initializePointsForExistingUsers() {
        log.info("[数据修复] 开始为现有用户初始化积分账户");

        int successCount = 0;
        int skipCount = 0;
        int errorCount = 0;

        try {
            // 查询所有用户
            QueryWrapper<User> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("isDelete", 0);
            queryWrapper.orderByAsc("id");

            List<User> allUsers = userService.list(queryWrapper);
            log.info("[数据修复] 共找到 {} 个用户", allUsers.size());

            for (User user : allUsers) {
                try {
                    // 检查用户是否已有积分账户
                    UserPoint existingPoints = getUserPoints(user.getId());

                    if (existingPoints != null) {
                        // 已有积分账户，跳过
                        skipCount++;
                        log.debug("[数据修复] 用户 {} 已有积分账户，跳过", user.getId());
                        continue;
                    }

                    // 创建积分账户并赠送初始积分
                    boolean success = userPointsService.addPoints(
                            user.getId(),
                            INITIAL_POINTS,
                            PointsTypeEnum.REGISTER.getValue(),
                            "老用户积分初始化奖励",
                            null
                    );

                    if (success) {
                        successCount++;
                        log.info("[数据修复] 用户 {} 初始化积分成功，赠送 {} 积分", user.getId(), INITIAL_POINTS);
                    } else {
                        errorCount++;
                        log.error("[数据修复] 用户 {} 初始化积分失败", user.getId());
                    }

                } catch (Exception e) {
                    errorCount++;
                    log.error("[数据修复] 用户 {} 初始化积分时出错: {}", user.getId(), e.getMessage(), e);
                }
            }

            log.info("[数据修复] 完成！成功: {}, 跳过: {}, 失败: {}, 总计: {}",
                    successCount, skipCount, errorCount, allUsers.size());

            return successCount;

        } catch (Exception e) {
            log.error("[数据修复] 批量初始化积分时出错: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * 获取用户积分账户（不自动创建）
     */
    private UserPoint getUserPoints(Long userId) {
        QueryWrapper<UserPoint> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("userId", userId);
        queryWrapper.eq("isDelete", 0);
        return userPointsService.getOne(queryWrapper);
    }

    /**
     * 为单个用户初始化积分
     * @param userId 用户ID
     * @param points 赠送积分数量（如果为null，使用默认值）
     * @return 是否成功
     */
    @Transactional(rollbackFor = Exception.class)
    public boolean initializePointsForUser(Long userId, Integer points) {
        if (points == null) {
            points = INITIAL_POINTS;
        }

        try {
            // 检查用户是否已有积分账户
            UserPoint existingPoints = getUserPoints(userId);

            if (existingPoints != null) {
                log.warn("[数据修复] 用户 {} 已有积分账户，无需初始化", userId);
                return false;
            }

            // 创建积分账户并赠送初始积分
            boolean success = userPointsService.addPoints(
                    userId,
                    points,
                    PointsTypeEnum.REGISTER.getValue(),
                    "积分账户初始化",
                    null
            );

            if (success) {
                log.info("[数据修复] 用户 {} 初始化积分成功，赠送 {} 积分", userId, points);
            }

            return success;

        } catch (Exception e) {
            log.error("[数据修复] 用户 {} 初始化积分时出错: {}", userId, e.getMessage(), e);
            return false;
        }
    }

    /**
     * 为管理员账号发放积分
     *
     * @param points 发放积分数量
     * @return 成功发放的管理员数量
     */
    @Transactional(rollbackFor = Exception.class)
    public int grantPointsForAdmins(Integer points) {
        int grantPoints = (points == null || points <= 0) ? INITIAL_POINTS : points;

        QueryWrapper<User> adminQuery = new QueryWrapper<>();
        adminQuery.eq("userRole", UserRoleEnum.ADMIN.getValue());
        adminQuery.eq("isDelete", 0);

        List<User> adminUsers = userService.list(adminQuery);
        if (adminUsers.isEmpty()) {
            log.warn("[数据修复] 未找到管理员账号，无法发放积分");
            return 0;
        }

        int successCount = 0;
        for (User admin : adminUsers) {
            try {
                boolean added = userPointsService.addPoints(
                        admin.getId(),
                        grantPoints,
                        PointsTypeEnum.ADMIN_ADJUST.getValue(),
                        "管理员手动补发积分",
                        null
                );
                if (added) {
                    successCount++;
                    log.info("[数据修复] 管理员 {} 发放 {} 积分成功", admin.getId(), grantPoints);
                }
            } catch (Exception e) {
                log.error("[数据修复] 管理员 {} 发放积分失败: {}", admin.getId(), e.getMessage(), e);
            }
        }

        return successCount;
    }
}
