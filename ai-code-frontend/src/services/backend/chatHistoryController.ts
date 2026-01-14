/**
 * 聊天历史相关API接口
 * 提供聊天记录的查询、删除、保存等功能
 */
import request from '@/utils/request';

/**
 * 分页获取应用聊天历史
 * @param params 应用聊天历史查询参数
 * @param options 额外配置
 * @returns Promise<API.BaseResponsePageChatHistory>
 */
export async function listAppChatHistory(
  params: API.listAppChatHistoryParams,
  options?: { [key: string]: any },
) {
  const { appId: param0, ...queryParams } = params;
  return request.get<any, API.BaseResponsePageChatHistory>(`/chat/history/app/${param0}`, {
    params: {
      pageSize: '10',  // 默认每页10条
      ...queryParams,
    },
    ...options,
  });
}

/**
 * 删除聊天历史
 * @param body 删除请求参数
 * @param options 额外配置
 * @returns Promise<API.BaseResponseBoolean>
 */
export async function deleteChatHistory(body: API.DeleteRequest, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseBoolean>('/chat/history/delete', body, options);
}

/**
 * 根据ID获取聊天历史
 * @param params 获取聊天历史参数
 * @param options 额外配置
 * @returns Promise<API.BaseResponseChatHistory>
 */
export async function getChatHistoryById(
  params: API.getChatHistoryByIdParams,
  options?: { [key: string]: any },
) {
  return request.get<any, API.BaseResponseChatHistory>('/chat/history/get', { params, ...options });
}

/**
 * 分页获取所有聊天历史
 * @param body 聊天历史查询请求参数
 * @param options 额外配置
 * @returns Promise<API.BaseResponsePageChatHistory>
 */
export async function listAllChatHistoryByPage(
  body: API.ChatHistoryQueryRequest,
  options?: { [key: string]: any },
) {
  return request.post<any, API.BaseResponsePageChatHistory>('/chat/history/list/all/page', body, options);
}

/**
 * 分页获取所有聊天历史VO
 * @param body 聊天历史查询请求参数
 * @param options 额外配置
 * @returns Promise<API.BaseResponsePageChatHistoryVO>
 */
export async function listAllChatHistoryVoByPage(
  body: API.ChatHistoryQueryRequest,
  options?: { [key: string]: any },
) {
  return request.post<any, API.BaseResponsePageChatHistoryVO>('/chat/history/list/all/page/vo', body, options);
}

/**
 * 获取最新聊天历史VO列表
 * @param params 获取最新聊天历史参数
 * @param options 额外配置
 * @returns Promise<API.BaseResponseListChatHistoryVO>
 */
export async function listLatestChatHistoryVo(
  params: API.listLatestChatHistoryVOParams,
  options?: { [key: string]: any },
) {
  return request.get<any, API.BaseResponseListChatHistoryVO>('/chat/history/list/latest/vo', { params, ...options });
}

/**
 * 分页获取聊天历史VO
 * @param body 聊天历史查询请求参数
 * @param options 额外配置
 * @returns Promise<API.BaseResponsePageChatHistoryVO>
 */
export async function listChatHistoryVoByPage(
  body: API.ChatHistoryQueryRequest,
  options?: { [key: string]: any },
) {
  return request.post<any, API.BaseResponsePageChatHistoryVO>('/chat/history/list/page/vo', body, options);
}

/**
 * 保存AI消息
 * @param body 聊天历史添加请求参数
 * @param options 额外配置
 * @returns Promise<API.BaseResponseBoolean>
 */
export async function saveAiMessage(
  body: API.ChatHistoryAddRequest,
  options?: { [key: string]: any },
) {
  return request.post<any, API.BaseResponseBoolean>('/chat/history/save/ai', body, options);
}

/**
 * 保存用户消息
 * @param body 聊天历史添加请求参数
 * @param options 额外配置
 * @returns Promise<API.BaseResponseBoolean>
 */
export async function saveUserMessage(
  body: API.ChatHistoryAddRequest,
  options?: { [key: string]: any },
) {
  return request.post<any, API.BaseResponseBoolean>('/chat/history/save/user', body, options);
}
