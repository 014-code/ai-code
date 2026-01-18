import request from '@/utils/request';

export async function addPointsRecord(body: API.PointsRecord, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseLong>('/pointsRecord/add', body, options);
}

export async function updatePointsRecord(body: API.PointsRecord, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseBoolean>('/pointsRecord/update', body, options);
}

export async function deletePointsRecord(body: API.DeleteRequest, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseBoolean>('/pointsRecord/delete', body, options);
}

export async function getPointsRecord(id: string, options?: { [key: string]: any }) {
  return request.get<any, API.BaseResponsePointsRecord>(`/pointsRecord/get/${id}`, options);
}

export async function listPointsRecordByPage(params: {
  userId?: string;
  type?: string;
  current?: number;
  pageSize?: number;
}, options?: { [key: string]: any }) {
  return request.get<any, API.BaseResponsePagePointsRecord>('/pointsRecord/list/page', { params, ...options });
}
