/**
 * 应用添加参数
 * 用于创建新应用时的参数定义
 */
export type AppAddParams = {
    appName?: string;
    appDesc?: string;
    appIcon?: string;
    appCover?: string;
    initPrompt?: string;
    codeGenType?: string;
};

/**
 * 应用部署参数
 * 用于部署应用时的参数定义
 */
export type AppDeployParams = {
    appId?: number;
};

/**
 * 应用查询参数
 * 用于查询应用列表时的参数定义，支持分页、排序和多条件筛选
 */
export type AppQueryParams = {
    pageNum?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    id?: number;
    appName?: string;
    appDesc?: string;
    codeGenType?: string;
    userId?: number;
    isFeatured?: number;
    searchKey?: string;
};

/**
 * 应用更新参数
 * 用于更新应用信息时的参数定义
 */
export type AppUpdateParams = {
    id?: number;
    appName?: string;
    appDesc?: string;
    appIcon?: string;
    appCover?: string;
    priority?: number;
};

/**
 * 对话生成代码参数
 * 用于通过对话方式生成应用代码时的参数定义
 */
export type ChatToGenCodeParams = {
    appId?: number;
    message?: string;
};
