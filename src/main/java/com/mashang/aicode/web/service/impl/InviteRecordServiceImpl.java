package com.mashang.aicode.web.service.impl;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mashang.aicode.web.mapper.InviteRecordMapper;
import com.mashang.aicode.web.model.entity.InviteRecord;
import com.mashang.aicode.web.service.InviteRecordService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class InviteRecordServiceImpl extends ServiceImpl<InviteRecordMapper, InviteRecord> implements InviteRecordService {

    @Override
    public InviteRecord getByInviteCode(String inviteCode) {
        QueryWrapper<InviteRecord> wrapper = new QueryWrapper<>();
        wrapper.eq("inviteCode", inviteCode);
        wrapper.eq("isDelete", 0);
        return getOne(wrapper);
    }

    @Override
    public InviteRecord getByInviterAndInvitee(Long inviterId, Long inviteeId) {
        QueryWrapper<InviteRecord> wrapper = new QueryWrapper<>();
        wrapper.eq("inviterId", inviterId);
        wrapper.eq("inviteeId", inviteeId);
        wrapper.eq("isDelete", 0);
        return getOne(wrapper);
    }

    @Override
    public boolean updateStatus(Long id, String status) {
        InviteRecord record = new InviteRecord();
        record.setId(id);
        record.setStatus(status);
        return updateById(record);
    }
}
