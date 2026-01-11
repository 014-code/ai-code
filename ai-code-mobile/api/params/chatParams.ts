/**
 * 聊天历史添加参数
 * 用于保存聊天消息时的参数定义
 */
export type ChatHistoryAddParams = {
    appId?: number;
    messageType?: string;
    messageContent?: string;
    errorInfo?: string;
};

/**
 * 聊天历史查询参数
 * 用于查询聊天历史记录时的参数定义，支持分页、排序和多条件筛选
 */
export type ChatHistoryQueryParams = {
    pageNum?: number;
    pageSize?: number;
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
 * 对话生成代码参数
 * 用于通过对话方式生成代码时的参数定义
 */
export type chatToGenCodeParams = {
    appId: number;
    message: string;
};

/**
 * 列表应用聊天历史参数
 * 用于获取应用聊天历史列表时的参数定义
 */
export type listAppChatHistoryParams = {
    appId: number;
    pageSize?: number;
    lastCreateTime?: string;
};

/**
 * 列表最新聊天历史VO参数
 * 用于获取应用最新聊天历史记录时的参数定义
 */
export type listLatestChatHistoryVOParams = {
    appId: number;
};
