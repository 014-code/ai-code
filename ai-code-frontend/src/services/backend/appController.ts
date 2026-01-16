/**
 * 应用相关API接口
 * 提供应用的增删改查、部署、下载等功能
 */
import request from '@/utils/request';

/**
 * 添加应用
 * @param body 应用添加请求参数
 * @param options 额外配置
 * @returns Promise<API.BaseResponseLong>
 */
export async function addApp(body: API.AppAddRequest, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseLong>('/app/add', body, options);
}

/**
 * 对话生成代码
 * @param params 对话生成代码参数
 * @param options 额外配置
 * @returns Promise<API.ServerSentEventString[]>
 */
export async function chatToGenCode(
  params: API.chatToGenCodeParams,
  options?: { [key: string]: any },
) {
  return request.get<any, API.ServerSentEventString[]>('/app/chat/gen/code', { params, ...options });
}

/**
 * 取消正在进行的代码生成
 * @param params 取消代码生成参数
 * @param options 额外配置
 * @returns Promise<API.BaseResponseBoolean>
 */
export async function cancelCodeGeneration(
  params: API.cancelCodeGenerationParams,
  options?: { [key: string]: any },
) {
  return request.post<any, API.BaseResponseBoolean>('/app/chat/cancel', null, { params, ...options });
}

/**
 * 管理员删除应用
 * @param body 删除请求参数
 * @param options 额外配置
 * @returns Promise<API.BaseResponseBoolean>
 */
export async function deleteAppByAdmin(body: API.DeleteRequest, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseBoolean>('/app/delete', body, options);
}

/**
 * 用户删除应用
 * @param body 删除请求参数
 * @param options 额外配置
 * @returns Promise<API.BaseResponseBoolean>
 */
export async function deleteApp(body: API.DeleteRequest, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseBoolean>('/app/delete/user', body, options);
}

/**
 * 部署应用
 * @param body 应用部署请求参数
 * @param options 额外配置
 * @returns Promise<API.BaseResponseString>
 */
export async function deployApp(body: API.AppDeployRequest, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseString>('/app/deploy', body, options);
}

/**
 * 下载应用代码
 * @param params 下载应用代码参数
 * @param options 额外配置
 * @returns Promise<any>
 */
export async function downloadAppCode(
  params: API.downloadAppCodeParams,
  options?: { [key: string]: any },
) {
  const { appId: param0, ...queryParams } = params;
  return request.get<any>(`/app/download/${param0}`, { params: queryParams, ...options });
}

/**
 * 分页获取精选应用列表
 * @param body 应用查询请求参数
 * @param options 额外配置
 * @returns Promise<API.BaseResponsePageAppVO>
 */
export async function listFeaturedAppVoByPage(
  body: API.AppQueryRequest,
  options?: { [key: string]: any },
) {
  return request.post<any, API.BaseResponsePageAppVO>('/app/featured/list/page/vo', body, options);
}

/**
 * 根据ID获取应用
 * @param params 获取应用参数
 * @param options 额外配置
 * @returns Promise<API.BaseResponseApp>
 */
export async function getAppById(
  params: API.getAppByIdParams,
  options?: { [key: string]: any },
) {
  return request.get<any, API.BaseResponseApp>('/app/get', { params, ...options });
}

/**
 * 根据ID获取应用VO
 * @param params 获取应用VO参数
 * @param options 额外配置
 * @returns Promise<API.BaseResponseAppVO>
 */
export async function getAppVoById(
  params: API.getAppVOByIdParams,
  options?: { [key: string]: any },
) {
  return request.get<any, API.BaseResponseAppVO>('/app/get/vo', { params, ...options });
}

/**
 * 分页获取所有应用列表
 * @param body 应用查询请求参数
 * @param options 额外配置
 * @returns Promise<API.BaseResponsePageApp>
 */
export async function listAllAppsByPage(
  body: API.AppQueryRequest,
  options?: { [key: string]: any },
) {
  return request.post<any, API.BaseResponsePageApp>('/app/list/all/page', body, options);
}

/**
 * 分页获取应用列表
 * @param body 应用查询请求参数
 * @param options 额外配置
 * @returns Promise<API.BaseResponsePageApp>
 */
export async function listAppByPage(body: API.AppQueryRequest, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponsePageApp>('/app/list/page', body, options);
}

/**
 * 分页获取我的应用列表
 * @param body 应用查询请求参数
 * @param options 额外配置
 * @returns Promise<API.BaseResponsePageAppVO>
 */
export async function listMyAppVoByPage(
  body: API.AppQueryRequest,
  options?: { [key: string]: any },
) {
  return request.post<any, API.BaseResponsePageAppVO>('/app/my/list/page/vo', body, options);
}

/**
 * 设置应用为精选
 * @param body 应用更新请求参数
 * @param options 额外配置
 * @returns Promise<API.BaseResponseBoolean>
 */
export async function setAppFeatured(body: API.AppUpdateRequest, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseBoolean>('/app/set/featured', body, options);
}

/**
 * 获取所有应用类型
 * @param options 额外配置
 * @returns Promise<API.BaseResponseListAppTypeVO>
 */
export async function listAllAppTypes(options?: { [key: string]: any }) {
  return request.get<any, API.BaseResponseListAppTypeVO>('/app/types', options);
}

/**
 * 获取所有预设提示词
 * @param options 额外配置
 * @returns Promise<API.BaseResponseListPresetPromptVO>
 */
export async function listAllPresetPrompts(options?: { [key: string]: any }) {
  return request.get<any, API.BaseResponseListPresetPromptVO>('/app/preset-prompts', options);
}

/**
 * 管理员更新应用
 * @param body 应用更新请求参数
 * @param options 额外配置
 * @returns Promise<API.BaseResponseBoolean>
 */
export async function updateAppByAdmin(
  body: API.AppUpdateRequest,
  options?: { [key: string]: any },
) {
  return request.post<any, API.BaseResponseBoolean>('/app/update', body, options);
}

/**
 * 用户更新应用
 * @param body 应用更新请求参数
 * @param options 额外配置
 * @returns Promise<API.BaseResponseBoolean>
 */
export async function updateApp(body: API.AppUpdateRequest, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseBoolean>('/app/update/user', body, options);
}
