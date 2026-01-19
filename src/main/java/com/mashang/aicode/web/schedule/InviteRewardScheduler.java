package com.mashang.aicode.web.schedule;

import com.mashang.aicode.web.service.InviteRecordService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 邀请奖励回收定时任务
 */
@Slf4j
@Component
public class InviteRewardScheduler {

    @Resource
    private InviteRecordService inviteRecordService;

    /**
     * 每天凌晨2:30回收超期未激活的邀请奖励
     */
    @Scheduled(cron = "0 30 2 * * ?")
    public void revokeExpiredInviteRewards() {
        try {
            int revokedCount = inviteRecordService.revokeExpiredInviteRewards();
            if (revokedCount > 0) {
                log.info("邀请奖励回收任务完成，本次回收 {} 条记录", revokedCount);
            }
        } catch (Exception e) {
            log.error("邀请奖励回收任务执行失败", e);
        }
    }
}
