// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/**
 * 分页查询应用聊天历史
 * 获取指定应用的聊天历史记录
 * @param params - 查询参数，包含应用 ID 和分页信息
 * @param options - 可选的请求配置
 * @returns 分页聊天历史对象
 */
export async function listAppChatHistory(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listAppChatHistoryParams,
  options?: { [key: string]: any },
) {
  const { appId: param0, ...queryParams } = params;
  return request<API.BaseResponsePageChatHistory>(`/chat/history/app/${param0}`, {
    method: 'GET',
    params: {
      // pageSize has a default value: 10
      pageSize: '10',
      ...queryParams,
    },
    ...(options || {}),
  });
}

/**
 * 删除聊天历史
 * 删除指定的聊天历史记录
 * @param body - 删除请求参数
 * @param options - 可选的请求配置
 * @returns 删除是否成功
 */
export async function deleteChatHistory(body: API.DeleteRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/chat/history/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/**
 * 根据ID获取聊天历史
 * 获取指定聊天历史的详细信息
 * @param params - 获取聊天历史参数
 * @param options - 可选的请求配置
 * @returns 聊天历史对象
 */
export async function getChatHistoryById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getChatHistoryByIdParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseChatHistory>('/chat/history/get', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/**
 * 分页查询所有聊天历史
 * 管理员分页获取所有聊天历史
 * @param body - 聊天历史查询请求参数
 * @param options - 可选的请求配置
 * @returns 分页聊天历史对象
 */
export async function listAllChatHistoryByPage(
  body: API.ChatHistoryQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageChatHistory>('/chat/history/list/all/page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/**
 * 分页查询所有聊天历史视图
 * 管理员分页获取所有聊天历史视图
 * @param body - 聊天历史查询请求参数
 * @param options - 可选的请求配置
 * @returns 分页聊天历史视图对象
 */
export async function listAllChatHistoryVoByPage(
  body: API.ChatHistoryQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageChatHistoryVO>('/chat/history/list/all/page/vo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/**
 * 获取最新聊天历史视图
 * 获取最新的聊天历史记录
 * @param params - 查询参数
 * @param options - 可选的请求配置
 * @returns 聊天历史视图对象列表
 */
export async function listLatestChatHistoryVo(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listLatestChatHistoryVOParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListChatHistoryVO>('/chat/history/list/latest/vo', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/**
 * 分页查询聊天历史视图
 * 分页获取聊天历史视图
 * @param body - 聊天历史查询请求参数
 * @param options - 可选的请求配置
 * @returns 分页聊天历史视图对象
 */
export async function listChatHistoryVoByPage(
  body: API.ChatHistoryQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageChatHistoryVO>('/chat/history/list/page/vo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/**
 * 保存 AI 消息
 * 保存 AI 回复的消息到聊天历史
 * @param body - 聊天历史添加请求参数
 * @param options - 可选的请求配置
 * @returns 保存是否成功
 */
export async function saveAiMessage(
  body: API.ChatHistoryAddRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean>('/chat/history/save/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/**
 * 保存用户消息
 * 保存用户发送的消息到聊天历史
 * @param body - 聊天历史添加请求参数
 * @param options - 可选的请求配置
 * @returns 保存是否成功
 */
export async function saveUserMessage(
  body: API.ChatHistoryAddRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean>('/chat/history/save/user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
