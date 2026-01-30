/**
 * 用户视图对象类型定义
 */

/**
 * 用户基本信息视图对象
 */
export type UserVO = {
  id: number;
  userAccount: string;
  userName?: string;
  userAvatar?: string;
  userProfile?: string;
  email?: string;
  userRole: string;
  userStatus: number;
  createTime: string;
  updateTime?: string;
};

/**
 * 用户详情信息视图对象
 */
export type UserDetailVO = UserVO & {
  lastLoginTime?: string;
  totalPoints?: number;
  usedPoints?: number;
  remainingPoints?: number;
  invitationCode?: string;
  invitedCount?: number;
};

/**
 * 用户登录响应视图对象
 */
export type UserLoginVO = {
  id: number;
  userAccount: string;
  userName?: string;
  userAvatar?: string;
  email?: string;
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
};

/**
 * 用户注册响应视图对象
 */
export type UserRegisterVO = {
  id: number;
  userAccount: string;
  userName?: string;
  userAvatar?: string;
  accessToken: string;
};

/**
 * 用户积分信息视图对象
 */
export type UserPointsVO = {
  userId: number;
  totalPoints: number;
  usedPoints: number;
  remainingPoints: number;
  pointsBalance: number;
};

/**
 * 用户邀请信息视图对象
 */
export type UserInviteVO = {
  inviterId: number;
  inviterAccount: string;
  inviteCode: string;
  invitedCount: number;
  rewardPoints: number;
};

/**
 * 用户统计信息视图对象
 */
export type UserStatisticsVO = {
  totalApps: number;
  totalConversations: number;
  totalCodeSnippets: number;
  totalPointsSpent: number;
  joinDays: number;
};

/**
 * 用户简要信息视图对象（用于列表展示）
 */
export type UserSimpleVO = {
  id: number;
  userAccount: string;
  userName?: string;
  userAvatar?: string;
};
