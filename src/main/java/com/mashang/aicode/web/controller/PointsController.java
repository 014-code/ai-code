package com.mashang.aicode.web.controller;

import com.mashang.aicode.web.common.BaseResponse;
import com.mashang.aicode.web.common.ResultUtils;
import com.mashang.aicode.web.constant.PointsConstants;
import com.mashang.aicode.web.model.entity.PointsRecord;
import com.mashang.aicode.web.model.entity.User;
import com.mashang.aicode.web.model.entity.UserPoint;
import com.mashang.aicode.web.service.PointsRecordService;
import com.mashang.aicode.web.service.UserPointService;
import com.mashang.aicode.web.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 积分控制器（单模型版本）
 * 移除了多模型动态计算功能，使用固定的积分配置
 */
@Slf4j
@RestController
@RequestMapping("/points")
@Tag(name = "积分管理", description = "积分相关接口")
public class PointsController {

    @Resource
    private UserPointService userPointsService;

    @Resource
    private PointsRecordService pointsRecordService;

    @Resource
    private UserService userService;

    private static final int DEFAULT_POINTS_PER_KTOKEN = 1;

    private static final BigDecimal DEFAULT_QUALITY_SCORE = BigDecimal.ONE;

    /**
     * 获取用户积分概览
     */
    @GetMapping("/overview")
    @Operation(summary = "获取积分概览", description = "查询用户的积分统计信息")
    public BaseResponse<Map<String, Object>> getPointsOverview(HttpServletRequest request) {
        User loginUser = userService.getLoginUser(request);
        UserPoint userPoints = userPointsService.getOrCreateUserPoint(loginUser.getId());

        List<PointsRecord> allRecords = pointsRecordService.getUserPointsRecords(loginUser.getId(), null);
        int totalEarned = 0;
        int totalConsumed = 0;

        for (PointsRecord record : allRecords) {
            if (record.getPoints() > 0) {
                totalEarned += record.getPoints();
            } else {
                totalConsumed += Math.abs(record.getPoints());
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("availablePoints", userPoints != null ? userPoints.getAvailablePoints() : 0);
        result.put("totalEarned", totalEarned);
        result.put("totalConsumed", totalConsumed);

        return ResultUtils.success(result);
    }

    /**
     * 获取积分明细记录
     */
    @GetMapping("/records")
    @Operation(summary = "获取积分明细", description = "查询用户的积分变动记录")
    public BaseResponse<List<PointsRecord>> getPointsRecords(
            @Parameter(description = "积分类型（SIGN_IN/REGISTER/INVITE/GENERATE/FIRST_GENERATION）")
            @RequestParam(required = false) String type,
            HttpServletRequest request) {
        User loginUser = userService.getLoginUser(request);
        List<PointsRecord> records = pointsRecordService.getUserPointsRecords(loginUser.getId(), type);
        return ResultUtils.success(records);
    }

    /**
     * 获取当前用户积分
     */
    @GetMapping("/current")
    @Operation(summary = "获取当前积分", description = "查询用户当前可用积分")
    public BaseResponse<Map<String, Integer>> getCurrentPoints(HttpServletRequest request) {
        User loginUser = userService.getLoginUser(request);
        UserPoint userPoints = userPointsService.getOrCreateUserPoint(loginUser.getId());

        Map<String, Integer> result = new HashMap<>();
        result.put("availablePoints", userPoints != null ? userPoints.getAvailablePoints() : 0);
        result.put("frozenPoints", userPoints != null ? userPoints.getFrozenPoints() : 0);

        return ResultUtils.success(result);
    }

    /**
     * 预估生成消耗积分（单模型版本）
     */
    @GetMapping("/estimate")
    @Operation(summary = "预估消耗积分", description = "根据生成类型预估消耗的积分数量")
    public BaseResponse<Map<String, Object>> estimateGenerationCost(
            @Parameter(description = "生成类型（html, multi_file, vue_project, react_project）")
            @RequestParam(required = false, defaultValue = "html") String genType,
            HttpServletRequest request) {
        Map<String, Object> result = new HashMap<>();
        result.put("genType", genType);
        result.put("description", getGenTypeDescription(genType));

        int basePoints = PointsConstants.getPointsByGenType(genType);
        result.put("basePoints", basePoints);

        result.put("modelName", "默认模型");
        result.put("pointsPerKToken", DEFAULT_POINTS_PER_KTOKEN);
        result.put("qualityScore", DEFAULT_QUALITY_SCORE);

        int estimatedTokenUsage = 5000;
        result.put("estimatedTokenUsage", estimatedTokenUsage);

        int estimatedPoints = calculatePoints(estimatedTokenUsage);
        result.put("estimatedPoints", estimatedPoints);
        result.put("qualityScoreDescription", "标准质量");

        return ResultUtils.success(result);
    }

    /**
     * 计算积分（单模型版本）
     * 简化逻辑：固定的每K Token积分和默认质量系数
     */
    private int calculatePoints(int tokenCount) {
        int kTokens = (int) Math.ceil(tokenCount / 1000.0);
        return kTokens * DEFAULT_POINTS_PER_KTOKEN;
    }

    private String getQualityScoreDescription(BigDecimal qualityScore) {
        if (qualityScore == null) {
            return "标准质量";
        }
        if (qualityScore.compareTo(new BigDecimal("0.8")) < 0) {
            return "基础质量（积分优惠）";
        } else if (qualityScore.compareTo(new BigDecimal("1.2")) > 0) {
            return "高质量（积分溢价）";
        } else {
            return "标准质量";
        }
    }

    private String getGenTypeDescription(String genType) {
        if (genType == null) {
            return "HTML 单文件生成";
        }
        switch (genType.toLowerCase()) {
            case "html":
                return "HTML 单文件生成";
            case "multi_file":
                return "多文件项目生成";
            case "vue_project":
                return "Vue 项目生成";
            case "react_project":
                return "React 项目生成";
            default:
                return "HTML 单文件生成";
        }
    }
}
