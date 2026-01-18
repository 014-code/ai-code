package com.mashang.aicode.web.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mashang.aicode.web.annotation.AuthCheck;
import com.mashang.aicode.web.common.BaseResponse;
import com.mashang.aicode.web.common.ResultUtils;
import com.mashang.aicode.web.constant.UserConstant;
import com.mashang.aicode.web.exception.ErrorCode;
import com.mashang.aicode.web.exception.ThrowUtils;
import com.mashang.aicode.web.model.entity.PointsRecord;
import com.mashang.aicode.web.service.PointsRecordService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pointsRecord")
public class PointsRecordController {

    @Resource
    private PointsRecordService pointsRecordService;

    @PostMapping("/add")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Long> addPointsRecord(@RequestBody PointsRecord pointsRecord) {
        ThrowUtils.throwIf(pointsRecord == null, ErrorCode.PARAMS_ERROR);
        boolean result = pointsRecordService.save(pointsRecord);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return ResultUtils.success(pointsRecord.getId());
    }

    @PostMapping("/update")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> updatePointsRecord(@RequestBody PointsRecord pointsRecord) {
        ThrowUtils.throwIf(pointsRecord == null || pointsRecord.getId() == null, ErrorCode.PARAMS_ERROR);
        boolean result = pointsRecordService.updateById(pointsRecord);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return ResultUtils.success(true);
    }

    @PostMapping("/delete")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> deletePointsRecord(@RequestBody PointsRecord pointsRecord) {
        ThrowUtils.throwIf(pointsRecord == null || pointsRecord.getId() == null, ErrorCode.PARAMS_ERROR);
        boolean result = pointsRecordService.removeById(pointsRecord.getId());
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return ResultUtils.success(true);
    }

    @GetMapping("/get/{id}")
    public BaseResponse<PointsRecord> getPointsRecord(@PathVariable Long id) {
        ThrowUtils.throwIf(id == null, ErrorCode.PARAMS_ERROR);
        PointsRecord pointsRecord = pointsRecordService.getById(id);
        ThrowUtils.throwIf(pointsRecord == null, ErrorCode.NOT_FOUND_ERROR);
        return ResultUtils.success(pointsRecord);
    }

    @GetMapping("/list/page")
    public BaseResponse<Page<PointsRecord>> listPointsRecordByPage(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        QueryWrapper<PointsRecord> queryWrapper = new QueryWrapper<>();
        if (userId != null) {
            queryWrapper.eq("userId", userId);
        }
        if (type != null && !type.isEmpty()) {
            queryWrapper.eq("type", type);
        }
        queryWrapper.orderByDesc("createTime");
        Page<PointsRecord> page = pointsRecordService.page(new Page<>(current, pageSize), queryWrapper);
        return ResultUtils.success(page);
    }
}
