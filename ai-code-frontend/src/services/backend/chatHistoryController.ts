import request from '@/utils/request';
import type {
  ChatHistoryQueryParams,
  ChatHistoryAddParams,
  DeleteParams,
  ListAppChatHistoryParams,
  GetChatHistoryByIdParams,
  ListLatestChatHistoryVOParams,
} from '@/api/params/chatParams';
import type {
  ChatRecordVO,
  ChatMessageVO,
  ChatHistoryVO,
  ChatDetailVO,
} from '@/api/vo/chatVO';
import type { PageResponseVO } from '@/api/vo';

/**
 * 分页查询应用聊天历史
 */
export async function listAppChatHistory(
  params: ListAppChatHistoryParams,
  options?: { [key: string]: unknown },
) {
  const { appId: param0, ...queryParams } = params;
  return request.get<ListAppChatHistoryParams, PageResponseVO<ChatHistoryVO>>(`/chat/history/app/${param0}`, {
    params: {
      pageSize: '10',
      ...queryParams,
    },
    ...options,
  });
}

/**
 * 删除聊天记录
 */
export async function deleteChatHistory(body: DeleteParams, options?: { [key: string]: unknown }) {
  return request.post<DeleteParams, PageResponseVO<boolean>>('/chat/history/delete', body, options);
}

/**
 * 根据ID获取聊天记录
 */
export async function getChatHistoryById(
  params: GetChatHistoryByIdParams,
  options?: { [key: string]: unknown },
) {
  return request.get<GetChatHistoryByIdParams, PageResponseVO<ChatRecordVO>>('/chat/history/get', { params, ...options });
}

/**
 * 分页查询所有聊天记录
 */
export async function listAllChatHistoryByPage(
  body: ChatHistoryQueryParams,
  options?: { [key: string]: unknown },
) {
  return request.post<ChatHistoryQueryParams, PageResponseVO<PageResponseVO<ChatRecordVO>>>('/chat/history/list/all/page', body, options);
}

/**
 * 分页查询所有聊天记录VO
 */
export async function listAllChatHistoryVoByPage(
  body: ChatHistoryQueryParams,
  options?: { [key: string]: unknown },
) {
  return request.post<ChatHistoryQueryParams, PageResponseVO<PageResponseVO<ChatHistoryVO>>>('/chat/history/list/all/page/vo', body, options);
}

/**
 * 获取最新聊天历史
 */
export async function listLatestChatHistoryVo(
  params: ListLatestChatHistoryVOParams,
  options?: { [key: string]: unknown },
) {
  return request.get<ListLatestChatHistoryVOParams, PageResponseVO<ChatHistoryVO[]>>('/chat/history/list/latest/vo', { params, ...options });
}

/**
 * 分页查询聊天历史VO
 */
export async function listChatHistoryVoByPage(
  body: ChatHistoryQueryParams,
  options?: { [key: string]: unknown },
) {
  return request.post<ChatHistoryQueryParams, PageResponseVO<PageResponseVO<ChatHistoryVO>>>('/chat/history/list/page/vo', body, options);
}

/**
 * 保存AI消息
 */
export async function saveAiMessage(
  body: ChatHistoryAddParams,
  options?: { [key: string]: unknown },
) {
  return request.post<ChatHistoryAddParams, PageResponseVO<boolean>>('/chat/history/save/ai', body, options);
}

/**
 * 保存用户消息
 */
export async function saveUserMessage(
  body: ChatHistoryAddParams,
  options?: { [key: string]: unknown },
) {
  return request.post<ChatHistoryAddParams, PageResponseVO<boolean>>('/chat/history/save/user', body, options);
}
