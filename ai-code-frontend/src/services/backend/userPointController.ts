/**
 * 用户积分相关API接口
 * 提供用户积分查询功能
 */
import request from '@/utils/request';

/**
 * 获取用户积分信息
 * @param params 查询参数
 * @param options 额外配置
 * @returns Promise<API.BaseResponseUserPoint>
 */
export async function getUserPoint(
  params: { userId: number },
  options?: { [key: string]: any },
) {
  return request.get<any, API.BaseResponseUserPoint>('/user/points/get/' + params.userId, options);
}

/**
 * 获取当前用户的积分信息
 * @param options 额外配置
 * @returns Promise<API.BaseResponseUserPoint>
 */
export async function getCurrentUserPoint(options?: { [key: string]: any }) {
  return request.get<any, API.BaseResponseUserPoint>('/user/points/current', options);
}
