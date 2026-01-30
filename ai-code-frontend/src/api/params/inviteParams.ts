/**
 * 邀请记录查询参数
 */
export type InviteRecordQueryParams = {
  pageNum: number;
  pageSize: number;
  status?: string;
};

/**
 * 使用邀请码参数
 */
export type UseInviteCodeParams = {
  inviteCode: string;
};

/**
 * 生成邀请码参数
 */
export type GenerateInviteCodeParams = {
  expireDays?: number;
};

/**
 * 获取我的邀请码参数
 */
export type GetMyInviteCodeParams = {
  userId: number;
};

/**
 * 邀请成员参数
 */
export type InviteMemberParams = {
  spaceId: number;
  invitedUserId: number;
  role?: string;
};
