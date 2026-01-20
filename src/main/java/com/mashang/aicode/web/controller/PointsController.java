package com.mashang.aicode.web.controller;

import com.mashang.aicode.web.common.BaseResponse;
import com.mashang.aicode.web.common.ResultUtils;
import com.mashang.aicode.web.constant.PointsConstants;
import com.mashang.aicode.web.model.entity.AiModelConfig;
import com.mashang.aicode.web.model.entity.PointsRecord;
import com.mashang.aicode.web.model.entity.User;
import com.mashang.aicode.web.model.entity.UserPoint;
import com.mashang.aicode.web.service.AiModelConfigService;
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
 * 积分控制器
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

    @Resource
    private AiModelConfigService aiModelConfigService;

    /**
     * 获取用户积分概览
     *
     * @param request HTTP请求
     * @return 积分概览信息
     */
    @GetMapping("/overview")
    @Operation(summary = "获取积分概览", description = "查询用户的积分统计信息")
    public BaseResponse<Map<String, Object>> getPointsOverview(HttpServletRequest request) {
        User loginUser = userService.getLoginUser(request);
        UserPoint userPoints = userPointsService.getOrCreateUserPoint(loginUser.getId());

        // 计算累计获得和消耗
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
     *
     * @param type    积分类型（可选）
     * @param request HTTP请求
     * @return 积分记录列表
     */
    @GetMapping("/records")
    @Operation(summary = "获取积分明细", description = "查询用户的积分变动记录")
    public BaseResponse<List<PointsRecord>> getPointsRecords(
            @Parameter(description = "积分类型（SIGN_IN/REGISTER/INVITE/GENERATE/FIRST_GENERATE）")
            @RequestParam(required = false) String type,
            HttpServletRequest request) {
        User loginUser = userService.getLoginUser(request);
        List<PointsRecord> records = pointsRecordService.getUserPointsRecords(loginUser.getId(), type);
        return ResultUtils.success(records);
    }

    /**
     * 获取当前用户积分
     *
     * @param request HTTP请求
     * @return 当前可用积分
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
     * 预估生成消耗积分
     *
     * @param genType  生成类型（html, multi_file, vue_project, react_project）
     * @param modelKey 模型key（可选，用于精确计算）
     * @param request  HTTP请求
     * @return 预估消耗信息
     */
    @GetMapping("/estimate")
    @Operation(summary = "预估消耗积分", description = "根据生成类型和模型预估消耗的积分数量")
    public BaseResponse<Map<String, Object>> estimateGenerationCost(
            @Parameter(description = "生成类型（html, multi_file, vue_project, react_project）")
            @RequestParam(required = false, defaultValue = "html") String genType,
            @Parameter(description = "模型key（可选，用于精确计算）")
            @RequestParam(required = false) String modelKey,
            HttpServletRequest request) {
        Map<String, Object> result = new HashMap<>();
        result.put("genType", genType);
        result.put("description", getGenTypeDescription(genType));

        int basePoints = PointsConstants.getPointsByGenType(genType);
        result.put("basePoints", basePoints);

        if (modelKey != null && !modelKey.isEmpty()) {
            AiModelConfig modelConfig = aiModelConfigService.getByModelKey(modelKey);
            if (modelConfig != null) {
                result.put("modelKey", modelKey);
                result.put("modelName", modelConfig.getModelName());
                result.put("pointsPerKToken", modelConfig.getPointsPerKToken());
                result.put("qualityScore", modelConfig.getQualityScore());

                Integer estimatedTokenUsage = modelConfig.getAvgTokenUsage();
                result.put("estimatedTokenUsage", estimatedTokenUsage);

                if (estimatedTokenUsage != null && estimatedTokenUsage > 0) {
                    Integer estimatedPoints = aiModelConfigService.calculatePoints(modelKey, estimatedTokenUsage);
                    result.put("estimatedPoints", estimatedPoints);
                } else {
                    result.put("estimatedPoints", basePoints);
                    result.put("warning", "模型未配置平均Token使用量，使用基础积分");
                }

                BigDecimal qualityScore = modelConfig.getQualityScore();
                if (qualityScore != null) {
                    result.put("qualityScore", qualityScore);
                    result.put("qualityScoreDescription", getQualityScoreDescription(qualityScore));
                }
            } else {
                result.put("estimatedPoints", basePoints);
                result.put("warning", "模型配置不存在，使用基础积分");
            }
        } else {
            result.put("estimatedPoints", basePoints);
        }

        return ResultUtils.success(result);
    }

    private String getQualityScoreDescription(java.math.BigDecimal qualityScore) {
        if (qualityScore == null) {
            return "标准质量";
        }
        if (qualityScore.compareTo(new java.math.BigDecimal("0.8")) < 0) {
            return "基础质量（积分优惠）";
        } else if (qualityScore.compareTo(new java.math.BigDecimal("1.2")) > 0) {
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
