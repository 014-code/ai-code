/**
 * 邀请视图对象类型定义
 */

/**
 * 邀请记录视图对象
 */
export type InviteRecordVO = {
  id: number;
  inviterId: number;
  inviter?: import('./userVO').UserSimpleVO;
  inviteeId: number;
  invitee?: import('./userVO').UserSimpleVO;
  inviteCode: string;
  status: number;
  rewardPoints: number;
  registerTime: string;
  rewardTime?: string;
  createTime: string;
};

/**
 * 邀请统计视图对象
 */
export type InviteStatisticsVO = {
  totalInvites: number;
  successfulInvites: number;
  pendingInvites: number;
  totalRewardPoints: number;
  pendingRewardPoints: number;
  rank: number;
};

/**
 * 我的邀请视图对象
 */
export type MyInviteVO = {
  id: number;
  inviteeId: number;
  invitee?: import('./userVO').UserSimpleVO;
  status: number;
  rewardPoints: number;
  registerTime: string;
  rewardTime?: string;
};

/**
 * 邀请链接视图对象
 */
export type InviteLinkVO = {
  id: number;
  inviteCode: string;
  inviteUrl: string;
  qrCodeUrl?: string;
  validDays: number;
  useCount: number;
  maxUseCount?: number;
  status: number;
  createTime: string;
  expiresTime?: string;
};

/**
 * 邀请奖励规则视图对象
 */
export type InviteRewardRuleVO = {
  id: number;
  ruleName: string;
  registerRewardPoints: number;
  firstRechargeRewardPoints: number;
  firstRechargeThreshold: number;
  validDays: number;
  status: number;
  createTime: string;
};

/**
 * 邀请排行榜视图对象
 */
export type InviteLeaderboardVO = {
  rank: number;
  userId: number;
  user?: import('./userVO').UserSimpleVO;
  successfulInvites: number;
  totalRewardPoints: number;
};

/**
 * 被邀请人视图对象
 */
export type InviteeVO = {
  id: number;
  userId: number;
  user?: import('./userVO').UserSimpleVO;
  inviteCode: string;
  registerTime: string;
  firstRechargeTime?: string;
  firstRechargeAmount?: number;
  status: number;
};

/**
 * 邀请通知视图对象
 */
export type InviteNotificationVO = {
  id: number;
  type: string;
  inviterId: number;
  inviter?: import('./userVO').UserSimpleVO;
  rewardPoints: number;
  message: string;
  readStatus: number;
  createTime: string;
};

/**
 * 邀请海报视图对象
 */
export type InvitePosterVO = {
  id: number;
  posterUrl: string;
  posterName: string;
  description?: string;
  isDefault: boolean;
  sortOrder: number;
};

/**
 * 邀请分享视图对象
 */
export type InviteShareVO = {
  shareTitle: string;
  shareDesc: string;
  shareUrl: string;
  shareIcon?: string;
  sharePoster?: string;
};
