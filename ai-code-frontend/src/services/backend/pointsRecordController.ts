import request from '@/utils/request';
import type { PointsRecordAddParams, PointsRecordUpdateParams, DeleteParams, PointsRecordListParams } from '@/api/params/pointsParams';
import type { PointsRecordVO, PointsFlowVO } from '@/api/vo/pointsVO';
import type { PageResponseVO } from '@/api/vo';

/**
 * 添加积分记录
 */
export async function addPointsRecord(body: PointsRecordAddParams, options?: { [key: string]: unknown }) {
  return request.post<PointsRecordAddParams, PageResponseVO<number>>('/pointsRecord/add', body, options);
}

/**
 * 更新积分记录
 */
export async function updatePointsRecord(body: PointsRecordUpdateParams, options?: { [key: string]: unknown }) {
  return request.post<PointsRecordUpdateParams, PageResponseVO<boolean>>('/pointsRecord/update', body, options);
}

/**
 * 删除积分记录
 */
export async function deletePointsRecord(body: DeleteParams, options?: { [key: string]: unknown }) {
  return request.post<DeleteParams, PageResponseVO<boolean>>('/pointsRecord/delete', body, options);
}

/**
 * 根据ID获取积分记录
 */
export async function getPointsRecord(id: string, options?: { [key: string]: unknown }) {
  return request.get<string, PageResponseVO<PointsRecordVO>>(`/pointsRecord/get/${id}`, options);
}

/**
 * 分页查询积分记录
 */
export async function listPointsRecordByPage(params: PointsRecordListParams, options?: { [key: string]: unknown }) {
  return request.get<PointsRecordListParams, PageResponseVO<PageResponseVO<PointsRecordVO>>>('/pointsRecord/list/page', { params, ...options });
}

/**
 * 获取积分流水
 */
export async function getPointsFlows(userId: string, pageNum: number = 1, pageSize: number = 10) {
  return request.get<{ userId: string; pageNum: number; pageSize: number }, PageResponseVO<PointsFlowVO[]>>('/pointsRecord/flows', {
    params: { userId, pageNum, pageSize }
  });
}

/**
 * 获取积分记录详情
 */
export async function getPointsRecordDetail(id: string) {
  return request.get<string, PageResponseVO<PointsRecordVO>>(`/pointsRecord/detail/${id}`);
}

/**
 * 导出积分记录
 */
export async function exportPointsRecords(params: PointsRecordListParams) {
  return request.get<PointsRecordListParams, PageResponseVO<string>>('/pointsRecord/export', { params });
}
