import request from '@/utils/request';
import type { GetInviteRecordsParams, BindInviteCodeParams } from '@/api/params/inviteParams';
import type {
  InviteRecordVO,
  InviteStatisticsVO,
  InviteLinkVO,
  InviteRewardRuleVO,
  InviteLeaderboardVO,
  InviteeVO,
} from '@/api/vo/inviteVO';
import type { PageResponseVO } from '@/api/vo';

export interface InviteCodeResponse {
  inviteCode: string;
  inviteUrl: string;
}

/**
 * 获取邀请码
 */
export async function getInviteCode() {
  return request.get<void, PageResponseVO<InviteCodeResponse>>('/invite/code');
}

/**
 * 获取邀请记录
 */
export async function getInviteRecords(params?: GetInviteRecordsParams) {
  return request.get<GetInviteRecordsParams, PageResponseVO<InviteRecordVO[]>>('/invite/records', { params });
}

/**
 * 绑定邀请码
 */
export async function bindInviteCode(body: BindInviteCodeParams) {
  return request.post<BindInviteCodeParams, PageResponseVO<boolean>>('/user/bind/inviteCode', body);
}

/**
 * 获取邀请统计
 */
export async function getInviteStatistics() {
  return request.get<void, PageResponseVO<InviteStatisticsVO>>('/invite/statistics');
}

/**
 * 创建邀请链接
 */
export async function createInviteLink(validDays?: number, maxUseCount?: number) {
  return request.post<{ validDays?: number; maxUseCount?: number }, PageResponseVO<InviteLinkVO>>('/invite/link/create', { validDays, maxUseCount });
}

/**
 * 获取邀请奖励规则
 */
export async function getInviteRewardRules() {
  return request.get<void, PageResponseVO<InviteRewardRuleVO[]>>('/invite/rules');
}

/**
 * 获取邀请排行榜
 */
export async function getInviteLeaderboard(limit?: number) {
  return request.get<number | undefined, PageResponseVO<InviteLeaderboardVO[]>>('/invite/leaderboard', { params: { limit } });
}

/**
 * 获取被邀请人列表
 */
export async function getInvitees(pageNum: number = 1, pageSize: number = 10) {
  return request.get<{ pageNum: number; pageSize: number }, PageResponseVO<InviteeVO[]>>('/invitees', {
    params: { pageNum, pageSize }
  });
}

/**
 * 获取我的被邀请人
 */
export async function getMyInvitees() {
  return request.get<void, PageResponseVO<InviteeVO[]>>('/invitees/my');
}
