import request from '@/utils/request';
import type {
  AppAddParams,
  AppQueryParams,
  AppUpdateParams,
  ChatToGenCodeParams,
  CancelCodeGenerationParams,
  DownloadAppCodeParams,
  AppDeployParams,
  DeleteParams,
} from '@/api/params/appParams';
import type {
  AppVO,
  AppDetailVO,
  AppSimpleVO,
  AppStatisticsVO,
  AppCreateVO,
  AppConfigVO,
} from '@/api/vo/appVO';
import type { PageResponseVO } from '@/api/vo';

/**
 * 添加应用
 */
export async function addApp(body: AppAddParams, options?: { [key: string]: unknown }) {
  return request.post<AppAddParams, PageResponseVO<number>>('/app/add', body, options);
}

/**
 * 对话生成代码
 */
export async function chatToGenCode(
  params: ChatToGenCodeParams,
  options?: { [key: string]: unknown },
) {
  return request.get<ChatToGenCodeParams, PageResponseVO<string>>('/app/chat/gen/code', { params, ...options });
}

/**
 * 取消代码生成
 */
export async function cancelCodeGeneration(
  params: CancelCodeGenerationParams,
  options?: { [key: string]: unknown },
) {
  return request.post<CancelCodeGenerationParams, PageResponseVO<boolean>>('/app/chat/cancel', null, { params, ...options });
}

/**
 * 管理员删除应用
 */
export async function deleteAppByAdmin(body: DeleteParams, options?: { [key: string]: unknown }) {
  return request.post<DeleteParams, PageResponseVO<boolean>>('/app/delete', body, options);
}

/**
 * 用户删除应用
 */
export async function deleteApp(body: DeleteParams, options?: { [key: string]: unknown }) {
  return request.post<DeleteParams, PageResponseVO<boolean>>('/app/delete/user', body, options);
}

/**
 * 部署应用
 */
export async function deployApp(body: AppDeployParams, options?: { [key: string]: unknown }) {
  return request.post<AppDeployParams, PageResponseVO<string>>('/app/deploy', body, options);
}

/**
 * 下载应用代码
 */
export async function downloadAppCode(
  params: DownloadAppCodeParams,
  options?: { [key: string]: unknown },
) {
  const { appId: param0, ...queryParams } = params;
  return request.get<DownloadAppCodeParams>(`/app/download/${param0}`, { params: queryParams, ...options });
}

/**
 * 分页查询精选应用
 */
export async function listFeaturedAppVoByPage(
  body: AppQueryParams,
  options?: { [key: string]: unknown },
) {
  return request.post<AppQueryParams, PageResponseVO<PageResponseVO<AppVO>>>('/app/featured/list/page/vo', body, options);
}

/**
 * 根据ID获取应用
 */
export async function getAppById(
  params: { id: string },
  options?: { [key: string]: unknown },
) {
  return request.get<{ id: string }, PageResponseVO<AppVO>>('/app/get', { params, ...options });
}

/**
 * 根据ID获取应用VO
 */
export async function getAppVoById(
  params: { id: string },
  options?: { [key: string]: unknown },
) {
  return request.get<{ id: string }, PageResponseVO<AppVO>>('/app/get/vo', { params, ...options });
}

/**
 * 分页查询所有应用
 */
export async function listAllAppsByPage(
  body: AppQueryParams,
  options?: { [key: string]: unknown },
) {
  return request.post<AppQueryParams, PageResponseVO<PageResponseVO<AppVO>>>('/app/list/all/page', body, options);
}

/**
 * 分页查询应用列表
 */
export async function listAppByPage(body: AppQueryParams, options?: { [key: string]: unknown }) {
  return request.post<AppQueryParams, PageResponseVO<PageResponseVO<AppVO>>>('/app/list/page', body, options);
}

/**
 * 分页查询我的应用
 */
export async function listMyAppVoByPage(
  body: AppQueryParams,
  options?: { [key: string]: unknown },
) {
  return request.post<AppQueryParams, PageResponseVO<PageResponseVO<AppVO>>>('/app/my/list/page/vo', body, options);
}

/**
 * 设置应用为精选
 */
export async function setAppFeatured(body: AppUpdateParams, options?: { [key: string]: unknown }) {
  return request.post<AppUpdateParams, PageResponseVO<boolean>>('/app/set/featured', body, options);
}

/**
 * 获取所有应用类型
 */
export async function listAllAppTypes(options?: { [key: string]: unknown }) {
  return request.get<void, PageResponseVO<AppVO[]>>('/app/types', options);
}

/**
 * 获取所有预设提示词
 */
export async function listAllPresetPrompts(options?: { [key: string]: unknown }) {
  return request.get<void, PageResponseVO<string[]>>('/app/preset-prompts', options);
}

/**
 * 管理员更新应用
 */
export async function updateAppByAdmin(
  body: AppUpdateParams,
  options?: { [key: string]: unknown },
) {
  return request.post<AppUpdateParams, PageResponseVO<boolean>>('/app/update', body, options);
}

/**
 * 用户更新应用
 */
export async function updateApp(body: AppUpdateParams, options?: { [key: string]: unknown }) {
  return request.post<AppUpdateParams, PageResponseVO<boolean>>('/app/update/user', body, options);
}
