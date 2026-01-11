import { ChatHistory, ChatHistoryVO } from "./chat";
import { UserVO } from "./user";

/**
 * 应用实体类型
 * 表示应用的基本信息
 */
type App = {
    id?: number;
    appName?: string;
    appType?: string;
    cover?: string;
    initPrompt?: string;
    codeGenType?: string;
    deployKey?: string;
    deployedTime?: string;
    priority?: number;
    userId?: number;
    editTime?: string;
    createTime?: string;
    updateTime?: string;
    isDelete?: number;
};

/**
 * 应用类型视图对象
 * 表示应用类型的详细信息
 */
type AppTypeVO = {
    code?: number;
    text?: string;
    category?: string;
    categoryName?: string;
};

/**
 * 应用视图对象
 * 表示应用的详细信息，包含用户信息
 */
export type AppVO = {
    id?: number;
    appName?: string;
    appType?: string;
    appDesc?: string;
    appIcon?: string;
    appCover?: string;
    initPrompt?: string;
    codeGenType?: string;
    userId?: number;
    user?: UserVO;
    userAvatar?: string;
    cover?: string;
    deployKey?: string;
    priority?: number;
    isFeatured?: number;
    editTime?: string;
    createTime?: string;
    updateTime?: string;
};

/**
 * 应用分页对象
 * 表示应用列表的分页信息
 */
type PageApp = {
    records?: App[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
};

/**
 * 应用视图对象分页对象
 * 表示应用视图对象列表的分页信息
 */
type PageAppVO = {
    records?: AppVO[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
};

/**
 * 聊天历史分页对象
 * 表示聊天历史列表的分页信息
 */
type PageChatHistory = {
    records?: ChatHistory[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
};

/**
 * 聊天历史视图对象分页对象
 * 表示聊天历史视图对象列表的分页信息
 */
type PageChatHistoryVO = {
    records?: ChatHistoryVO[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
};
