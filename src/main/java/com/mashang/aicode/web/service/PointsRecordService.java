package com.mashang.aicode.web.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.mashang.aicode.web.model.entity.PointsRecord;

public interface PointsRecordService extends IService<PointsRecord> {

    Page<PointsRecord> listPointsRecordByPage(Long userId, Integer current, Integer pageSize);

    Integer getUserBalance(Long userId);

    boolean addPoints(Long userId, Integer points, String type, String reason, Long relatedId);

    boolean deductPoints(Long userId, Integer points, String type, String reason, Long relatedId);
}
