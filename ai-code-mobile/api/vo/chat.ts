import { AppVO } from "./app";
import { UserVO } from "./user";

/**
 * 聊天历史视图对象
 * 表示聊天历史的详细信息，包含用户和应用信息
 */
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

/**
 * 聊天历史实体类型
 * 表示聊天历史的基本信息
 */
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
