import { ChatHistory, ChatHistoryVO } from "./chat";
import { UserVO } from "./user";



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

type AppTypeVO = {
    code?: number;
    text?: string;
    category?: string;
    categoryName?: string;
};


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

    cover?: string;
    deployKey?: string;
    priority?: number;
    isFeatured?: number;
    editTime?: string;
    createTime?: string;
    updateTime?: string;
};

type PageApp = {
    records?: App[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
};

type PageAppVO = {
    records?: AppVO[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
};

type PageChatHistory = {
    records?: ChatHistory[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
};

type PageChatHistoryVO = {
    records?: ChatHistoryVO[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
};