/**
 * 应用添加参数
 */
export type AppAddParams = {
  appName: string;
  appDesc?: string;
  appIcon?: string;
  appCover?: string;
  initPrompt: string;
  codeGenType: string;
};

/**
 * 应用部署参数
 */
export type AppDeployParams = {
  appId: number;
};

/**
 * 应用查询参数
 */
export type AppQueryParams = {
  pageNum: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: string;
  id?: string;
  appName?: string;
  appDesc?: string;
  codeGenType?: string;
  userId?: string;
  isFeatured?: number;
  searchKey?: string;
  appType?: string;
  spaceId?: string;
};

/**
 * 应用更新参数
 */
export type AppUpdateParams = {
  id: string;
  appName?: string;
  appDesc?: string;
  appIcon?: string;
  appCover?: string;
  priority?: number;
};

/**
 * 对话生成代码参数
 */
export type ChatToGenCodeParams = {
  appId: number;
  message: string;
};

/**
 * 取消代码生成参数
 */
export type CancelCodeGenerationParams = {
  appId: number;
};

/**
 * 下载应用代码参数
 */
export type DownloadAppCodeParams = {
  appId: number;
};

/**
 * 获取应用参数
 */
export type GetAppParams = {
  id: number;
};

/**
 * 获取应用VO参数
 */
export type GetAppVOParams = {
  id: number;
};
