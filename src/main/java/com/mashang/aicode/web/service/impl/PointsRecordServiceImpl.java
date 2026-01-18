package com.mashang.aicode.web.service.impl;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mashang.aicode.web.mapper.PointsRecordMapper;
import com.mashang.aicode.web.model.entity.PointsRecord;
import com.mashang.aicode.web.service.PointsRecordService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Date;

@Slf4j
@Service
public class PointsRecordServiceImpl extends ServiceImpl<PointsRecordMapper, PointsRecord> implements PointsRecordService {

    @Override
    public Page<PointsRecord> listPointsRecordByPage(Long userId, Integer current, Integer pageSize) {
        QueryWrapper<PointsRecord> wrapper = new QueryWrapper<>();
        wrapper.eq("userId", userId);
        wrapper.eq("isDelete", 0);
        wrapper.orderByDesc("createTime");
        Page<PointsRecord> page = new Page<>(current, pageSize);
        return page(page, wrapper);
    }

    @Override
    public Integer getUserBalance(Long userId) {
        QueryWrapper<PointsRecord> wrapper = new QueryWrapper<>();
        wrapper.eq("userId", userId);
        wrapper.eq("isDelete", 0);
        wrapper.orderByDesc("createTime");
        wrapper.last("LIMIT 1");
        PointsRecord record = getOne(wrapper);
        return record != null ? record.getBalance() : 0;
    }

    @Override
    public boolean addPoints(Long userId, Integer points, String type, String reason, Long relatedId) {
        Integer currentBalance = getUserBalance(userId);
        Integer newBalance = currentBalance + points;

        PointsRecord record = new PointsRecord();
        record.setUserId(userId);
        record.setPoints(points);
        record.setBalance(newBalance);
        record.setType(type);
        record.setReason(reason);
        record.setRelatedId(relatedId);
        record.setCreateTime(new Date());

        return save(record);
    }

    @Override
    public boolean deductPoints(Long userId, Integer points, String type, String reason, Long relatedId) {
        Integer currentBalance = getUserBalance(userId);
        if (currentBalance < points) {
            return false;
        }
        Integer newBalance = currentBalance - points;

        PointsRecord record = new PointsRecord();
        record.setUserId(userId);
        record.setPoints(-points);
        record.setBalance(newBalance);
        record.setType(type);
        record.setReason(reason);
        record.setRelatedId(relatedId);
        record.setCreateTime(new Date());

        return save(record);
    }
}
