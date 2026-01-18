package com.mashang.aicode.web.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.mashang.aicode.web.model.entity.InviteRecord;

public interface InviteRecordService extends IService<InviteRecord> {

    InviteRecord getByInviteCode(String inviteCode);

    InviteRecord getByInviterAndInvitee(Long inviterId, Long inviteeId);

    boolean updateStatus(Long id, String status);
}
