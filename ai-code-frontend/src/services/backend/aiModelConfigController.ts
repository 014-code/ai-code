import request from '@/utils/request';

export async function addAiModelConfig(body: API.AiModelConfig, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseLong>('/aiModel/add', body, options);
}

export async function updateAiModelConfig(body: API.AiModelConfig, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseBoolean>('/aiModel/update', body, options);
}

export async function updateModelStatus(body: API.AiModelConfig, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseBoolean>('/aiModel/updateStatus', body, options);
}

export async function deleteAiModelConfig(body: API.DeleteRequest, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseBoolean>('/aiModel/delete', body, options);
}

export async function getAiModelConfig(id: string, options?: { [key: string]: any }) {
  return request.get<any, API.BaseResponseAiModelConfig>(`/aiModel/get/${id}`, options);
}

export async function listAiModelConfig(params: {
  provider?: string;
  tier?: string;
  current?: number;
  pageSize?: number;
}, options?: { [key: string]: any }) {
  return request.get<any, API.BaseResponsePageAiModelConfig>('/aiModel/list', { params, ...options });
}

export async function getEnabledModels(options?: { [key: string]: any }) {
  return request.get<any, API.BaseResponseListAiModelConfig>('/aiModel/enabled', options);
}
