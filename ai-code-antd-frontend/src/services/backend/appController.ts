// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/**
 * 添加应用
 * 创建一个新的 AI 应用
 * @param body - 应用添加请求参数
 * @param options - 可选的请求配置
 * @returns 应用 ID
 */
export async function addApp(body: API.AppAddRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseLong>('/app/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/**
 * 聊天生成代码
 * 通过 AI 聊天生成应用代码
 * @param params - 聊天生成代码参数
 * @param options - 可选的请求配置
 * @returns 服务器发送事件字符串数组
 */
export async function chatToGenCode(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.chatToGenCodeParams,
  options?: { [key: string]: any },
) {
  return request<API.ServerSentEventString[]>('/app/chat/gen/code', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/**
 * 管理员删除应用
 * 管理员删除指定的应用
 * @param body - 删除请求参数
 * @param options - 可选的请求配置
 * @returns 删除是否成功
 */
export async function deleteAppByAdmin(body: API.DeleteRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/app/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/**
 * 用户删除应用
 * 用户删除自己创建的应用
 * @param body - 删除请求参数
 * @param options - 可选的请求配置
 * @returns 删除是否成功
 */
export async function deleteApp(body: API.DeleteRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/app/delete/user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/**
 * 部署应用
 * 部署应用到服务器
 * @param body - 应用部署请求参数
 * @param options - 可选的请求配置
 * @returns 部署结果
 */
export async function deployApp(body: API.AppDeployRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseString>('/app/deploy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/**
 * 下载应用代码
 * 下载指定应用的源代码
 * @param params - 下载应用代码参数
 * @param options - 可选的请求配置
 * @returns 应用代码文件
 */
export async function downloadAppCode(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.downloadAppCodeParams,
  options?: { [key: string]: any },
) {
  const { appId: param0, ...queryParams } = params;
  return request<any>(`/app/download/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/**
 * 分页查询精选应用
 * 获取精选应用列表
 * @param body - 应用查询请求参数
 * @param options - 可选的请求配置
 * @returns 分页应用视图对象
 */
export async function listFeaturedAppVoByPage(
  body: API.AppQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageAppVO>('/app/featured/list/page/vo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/**
 * 根据ID获取应用
 * 获取指定应用的详细信息
 * @param params - 获取应用参数
 * @param options - 可选的请求配置
 * @returns 应用对象
 */
export async function getAppById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getAppByIdParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseApp>('/app/get', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/**
 * 根据ID获取应用视图
 * 获取指定应用的视图信息
 * @param params - 获取应用视图参数
 * @param options - 可选的请求配置
 * @returns 应用视图对象
 */
export async function getAppVoById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getAppVOByIdParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseAppVO>('/app/get/vo', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/**
 * 分页查询所有应用
 * 管理员分页获取所有应用
 * @param body - 应用查询请求参数
 * @param options - 可选的请求配置
 * @returns 分页应用对象
 */
export async function listAllAppsByPage(
  body: API.AppQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageApp>('/app/list/all/page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/**
 * 分页查询应用
 * 分页获取应用列表
 * @param body - 应用查询请求参数
 * @param options - 可选的请求配置
 * @returns 分页应用对象
 */
export async function listAppByPage(body: API.AppQueryRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponsePageApp>('/app/list/page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/**
 * 分页查询我的应用
 * 获取当前用户创建的应用列表
 * @param body - 应用查询请求参数
 * @param options - 可选的请求配置
 * @returns 分页应用视图对象
 */
export async function listMyAppVoByPage(
  body: API.AppQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageAppVO>('/app/my/list/page/vo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/**
 * 设置应用精选状态
 * 管理员设置应用是否为精选
 * @param body - 应用更新请求参数
 * @param options - 可选的请求配置
 * @returns 设置是否成功
 */
export async function setAppFeatured(body: API.AppUpdateRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/app/set/featured', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/**
 * 获取所有应用类型
 * 获取应用类型列表
 * @param options - 可选的请求配置
 * @returns 应用类型视图对象列表
 */
export async function listAllAppTypes(options?: { [key: string]: any }) {
  return request<API.BaseResponseListAppTypeVO>('/app/types', {
    method: 'GET',
    ...(options || {}),
  });
}

/**
 * 获取所有预设提示词
 * 获取预设提示词列表
 * @param options - 可选的请求配置
 * @returns 预设提示词视图对象列表
 */
export async function listAllPresetPrompts(options?: { [key: string]: any }) {
  return request<API.BaseResponseListPresetPromptVO>('/app/preset-prompts', {
    method: 'GET',
    ...(options || {}),
  });
}

/**
 * 管理员更新应用
 * 管理员更新应用信息
 * @param body - 应用更新请求参数
 * @param options - 可选的请求配置
 * @returns 更新是否成功
 */
export async function updateAppByAdmin(
  body: API.AppUpdateRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean>('/app/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/**
 * 用户更新应用
 * 用户更新自己创建的应用信息
 * @param body - 应用更新请求参数
 * @param options - 可选的请求配置
 * @returns 更新是否成功
 */
export async function updateApp(body: API.AppUpdateRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/app/update/user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
