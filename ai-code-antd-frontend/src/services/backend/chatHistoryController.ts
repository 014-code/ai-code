// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 此处后端没有提供注释 GET /chat/history/app/${param0} */
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

/** 此处后端没有提供注释 POST /chat/history/delete */
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

/** 此处后端没有提供注释 GET /chat/history/get */
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

/** 此处后端没有提供注释 POST /chat/history/list/all/page */
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

/** 此处后端没有提供注释 POST /chat/history/list/all/page/vo */
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

/** 此处后端没有提供注释 GET /chat/history/list/latest/vo */
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

/** 此处后端没有提供注释 POST /chat/history/list/page/vo */
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

/** 此处后端没有提供注释 POST /chat/history/save/ai */
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

/** 此处后端没有提供注释 POST /chat/history/save/user */
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
