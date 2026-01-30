import request from '@/utils/request';
import type { EstimateCostParams, PointsRecordsParams } from '@/api/params/pointsParams';
import type {
  PointsEstimateVO,
  PointsAccountVO,
  PointsRecordVO,
  PointsStatisticsVO,
  PointsRechargeVO,
  PointsPackageVO,
  SignInVO,
  SignInRecordVO,
} from '@/api/vo/pointsVO';
import type { PageResponseVO } from '@/api/vo';

/**
 * 预估生成费用
 */
export async function estimateGenerationCost(params: EstimateCostParams = {}) {
  return request.get<EstimateCostParams, PageResponseVO<PointsEstimateVO>>('/points/estimate', { params });
}

/**
 * 获取积分概览
 */
export async function getPointsOverview() {
  return request.get<void, PageResponseVO<{ availablePoints: number; totalEarned: number; totalConsumed: number }>>('/points/overview');
}

/**
 * 获取积分记录
 */
export async function getPointsRecords(params?: PointsRecordsParams) {
  return request.get<PointsRecordsParams, PageResponseVO<PointsRecordVO[]>>('/points/records', { params });
}

/**
 * 获取当前积分
 */
export async function getCurrentPoints() {
  return request.get<void, PageResponseVO<{ availablePoints: number; frozenPoints: number }>>('/points/current');
}

/**
 * 获取积分账户
 */
export async function getPointsAccount() {
  return request.get<void, PageResponseVO<PointsAccountVO>>('/points/account');
}

/**
 * 获取积分统计
 */
export async function getPointsStatistics() {
  return request.get<void, PageResponseVO<PointsStatisticsVO>>('/points/statistics');
}

/**
 * 获取积分套餐列表
 */
export async function listPointsPackages() {
  return request.get<void, PageResponseVO<PointsPackageVO[]>>('/points/packages');
}

/**
 * 分页获取积分记录
 */
export async function getPointsRecordsByPage(params: PointsRecordsParams) {
  return request.get<PointsRecordsParams, PageResponseVO<PageResponseVO<PointsRecordVO>>>('/points/records/page', { params });
}

/**
 * 签到
 */
export async function signIn() {
  return request.post<void, PageResponseVO<SignInVO>>('/points/signin', {});
}

/**
 * 获取签到记录
 */
export async function getSignInRecord() {
  return request.get<void, PageResponseVO<SignInRecordVO[]>>('/points/signin/record');
}

/**
 * 获取签到统计
 */
export async function getSignInStats() {
  return request.get<void, PageResponseVO<{ consecutiveDays: number; totalRewardPoints: number }>>('/points/signin/stats');
}
