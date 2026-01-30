import request from '@/utils/request';
import type { UserPointsVO, PointsAccountVO, PointsStatisticsVO } from '@/api/vo/pointsVO';
import type { PageResponseVO } from '@/api/vo';

/**
 * 获取用户积分
 */
export async function getUserPoint(
  params: { userId: number },
  options?: { [key: string]: unknown },
) {
  return request.get<{ userId: number }, PageResponseVO<UserPointsVO>>('/user/points/get/' + params.userId, options);
}

/**
 * 获取当前用户积分
 */
export async function getCurrentUserPoint(options?: { [key: string]: unknown }) {
  return request.get<void, PageResponseVO<UserPointsVO>>('/user/points/current', options);
}

/**
 * 获取用户积分账户
 */
export async function getUserPointsAccount() {
  return request.get<void, PageResponseVO<PointsAccountVO>>('/user/points/account');
}

/**
 * 获取用户积分统计
 */
export async function getUserPointsStatistics() {
  return request.get<void, PageResponseVO<PointsStatisticsVO>>('/user/points/statistics');
}

/**
 * 获取用户积分历史
 */
export async function getUserPointsHistory(pageNum: number = 1, pageSize: number = 10) {
  return request.get<{ pageNum: number; pageSize: number }, PageResponseVO<UserPointsVO[]>>('/user/points/history', {
    params: { pageNum, pageSize }
  });
}
