/**
 * 积分视图对象类型定义
 */

/**
 * 积分账户信息视图对象
 */
export type PointsAccountVO = {
  id: number;
  userId: number;
  totalPoints: number;
  usedPoints: number;
  remainingPoints: number;
  frozenPoints: number;
  createTime: string;
  updateTime?: string;
};

/**
 * 积分记录视图对象
 */
export type PointsRecordVO = {
  id: number;
  userId: number;
  points: number;
  type: string;
  sourceType: string;
  sourceId?: string;
  description: string;
  balance: number;
  createTime: string;
};

/**
 * 积分流水视图对象
 */
export type PointsFlowVO = {
  id: number;
  userId: number;
  points: number;
  flowType: string;
  businessType: string;
  orderNo?: string;
  description: string;
  beforeBalance: number;
  afterBalance: number;
  createTime: string;
};

/**
 * 积分预估结果视图对象
 */
export type PointsEstimateVO = {
  genType: string;
  estimatedTokens: number;
  estimatedPoints: number;
  modelName?: string;
  unitPrice: number;
};

/**
 * 积分充值记录视图对象
 */
export type PointsRechargeVO = {
  id: number;
  userId: number;
  orderNo: string;
  rechargePoints: number;
  payAmount: number;
  payType: string;
  payStatus: number;
  createTime: string;
  payTime?: string;
};

/**
 * 积分消费记录视图对象
 */
export type PointsConsumeVO = {
  id: number;
  userId: number;
  consumePoints: number;
  businessType: string;
  businessId?: string;
  description: string;
  createTime: string;
};

/**
 * 积分套餐视图对象
 */
export type PointsPackageVO = {
  id: number;
  packageName: string;
  points: number;
  originalPrice: number;
  currentPrice: number;
  description?: string;
  sortOrder: number;
  status: number;
};

/**
 * 积分统计信息视图对象
 */
export type PointsStatisticsVO = {
  totalPoints: number;
  usedPoints: number;
  remainingPoints: number;
  todayConsumed: number;
  monthConsumed: number;
  totalRecharge: number;
  rank: number;
};

/**
 * 积分变动通知视图对象
 */
export type PointsNotificationVO = {
  id: number;
  userId: number;
  title: string;
  message: string;
  pointsChange: number;
  readStatus: number;
  createTime: string;
};

/**
 * 签到视图对象
 */
export type SignInVO = {
  id: number;
  userId: number;
  signInDate: string;
  rewardPoints: number;
  consecutiveDays: number;
  isExtraReward: boolean;
  createTime: string;
};

/**
 * 签到记录视图对象
 */
export type SignInRecordVO = {
  id: number;
  userId: number;
  signInDate: string;
  rewardPoints: number;
  consecutiveDays: number;
  createTime: string;
};

/**
 * 邀请奖励视图对象
 */
export type InviteRewardVO = {
  id: number;
  inviterId: number;
  inviteeId: number;
  rewardPoints: number;
  inviteeFirstRecharge: boolean;
  createTime: string;
};
