import { AppVO } from "./app";
import { UserVO } from "./user";


export type ChatHistoryVO = {
    id?: number;
    appId?: number;
    userId?: number;
    messageType?: string;
    messageTypeDesc?: string;
    messageContent?: string;
    errorInfo?: string;
    createTime?: string;
    updateTime?: string;
    user?: UserVO;
    app?: AppVO;
};

export type ChatHistory = {
    id?: number;
    appId?: number;
    userId?: number;
    messageType?: string;
    messageContent?: string;
    createTime?: string;
    updateTime?: string;
    isDelete?: number;
};