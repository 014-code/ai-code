

export type ChatHistoryAddParams = {
    appId?: number;
    messageType?: string;
    messageContent?: string;
    errorInfo?: string;
};

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



export type chatToGenCodeParams = {
    appId: number;
    message: string;
};

export type listAppChatHistoryParams = {
    appId: number;
    pageSize?: number;
    lastCreateTime?: string;
};

export type listLatestChatHistoryVOParams = {
    appId: number;
};