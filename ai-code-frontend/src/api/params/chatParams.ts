/**
 * 聊天历史查询参数
 */
export type ChatHistoryQueryParams = {
  pageNum: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: string;
  id?: number;
  message?: string;
  messageType?: string;
  appId?: number;
  userId?: number;
  lastCreateTime?: string;
};

/**
 * 获取聊天历史参数
 */
export type GetChatHistoryParams = {
  id: number;
};

/**
 * 列出应用聊天历史参数
 */
export type ListAppChatHistoryParams = {
  appId: number;
  pageSize?: number;
  lastCreateTime?: string;
};

/**
 * 列出最新聊天历史VO参数
 */
export type ListLatestChatHistoryVOParams = {
  appId: number;
};

/**
 * 添加聊天历史参数
 */
export type AddChatHistoryParams = {
  appId: number;
  messageType: string;
  messageContent: string;
  errorInfo?: string;
};

/**
 * 对话请求参数
 */
export type DialogueRequestParams = {
  appId: number;
  message: string;
};
