import request from '@/utils/request';
import type { PageResponseVO } from '@/api/vo';

export interface InitializePointsResult {
  successCount: number;
  failCount: number;
  errors?: string[];
}

export interface GrantPointsResult {
  adminCount: number;
  totalPoints: number;
  successCount: number;
  failCount: number;
}

/**
 * 为所有用户初始化积分账户
 */
export async function initializePointsForAllUsers(options?: { [key: string]: unknown }) {
  return request.post<void, PageResponseVO<InitializePointsResult>>('/admin/data-repair/init-points', null, options);
}

/**
 * 为单个用户初始化积分
 */
export async function initializePointsForUser(
  params: { userId: number; points?: number },
  options?: { [key: string]: unknown },
) {
  return request.post<{ points?: number }, PageResponseVO<boolean>>(
    '/admin/data-repair/init-points/' + params.userId,
    { points: params.points },
    options,
  );
}

/**
 * 为管理员批量发放积分
 */
export async function grantPointsForAdmins(
  params: { points?: number },
  options?: { [key: string]: unknown },
) {
  return request.post<{ points?: number }, PageResponseVO<GrantPointsResult>>(
    '/admin/data-repair/grant-admin-points',
    { points: params.points },
    options,
  );
}

/**
 * 修复用户积分数据
 */
export async function repairUserPoints(userId: number) {
  return request.post<number, PageResponseVO<boolean>>('/admin/data-repair/repair-points', { userId });
}

/**
 * 同步积分记录
 */
export async function syncPointsRecords(userId: number) {
  return request.post<number, PageResponseVO<boolean>>('/admin/data-repair/sync-records', { userId });
}
