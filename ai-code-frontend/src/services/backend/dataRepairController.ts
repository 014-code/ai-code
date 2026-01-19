/**
 * 数据修复相关API接口
 * 提供数据修复功能，仅管理员可访问
 */
import request from '@/utils/request';

/**
 * 为所有现有用户初始化积分账户
 * @param options 额外配置
 * @returns Promise<API.BaseResponseMapStringObject>
 */
export async function initializePointsForAllUsers(options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseMapStringObject>('/admin/data-repair/init-points', null, options);
}

/**
 * 为单个用户初始化积分
 * @param params 查询参数
 * @param options 额外配置
 * @returns Promise<API.BaseResponseBoolean>
 */
export async function initializePointsForUser(
  params: { userId: number; points?: number },
  options?: { [key: string]: any },
) {
  return request.post<any, API.BaseResponseBoolean>(
    '/admin/data-repair/init-points/' + params.userId,
    null,
    { params: { points: params.points }, ...options },
  );
}

/**
 * 为全部管理员账号发放积分
 * @param params 查询参数
 * @param options 额外配置
 * @returns Promise<API.BaseResponseMapStringObject>
 */
export async function grantPointsForAdmins(
  params: { points?: number },
  options?: { [key: string]: any },
) {
  return request.post<any, API.BaseResponseMapStringObject>(
    '/admin/data-repair/grant-admin-points',
    null,
    { params: { points: params.points }, ...options },
  );
}
