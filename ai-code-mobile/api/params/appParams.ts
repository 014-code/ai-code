export type AppAddParams = {
    appName?: string;
    appDesc?: string;
    appIcon?: string;
    appCover?: string;
    initPrompt?: string;
    codeGenType?: string;
};

export type AppDeployParams = {
    appId?: number;
};

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



export type AppUpdateParams = {
    id?: number;
    appName?: string;
    appDesc?: string;
    appIcon?: string;
    appCover?: string;
    priority?: number;
};

export type ChatToGenCodeParams = {
    appId?: number;
    message?: string;
};