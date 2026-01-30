/**
 * 应用视图对象类型定义
 */

/**
 * 应用基本信息视图对象
 */
export type AppVO = {
  id: number;
  appName: string;
  appDesc?: string;
  appIcon?: string;
  appCover?: string;
  initPrompt: string;
  codeGenType: string;
  appType: number;
  reviewStatus: number;
  reviewerId?: number;
  reviewTime?: string;
  reviewMessage?: string;
  createUserId: number;
  createTime: string;
  updateTime?: string;
};

/**
 * 应用详情信息视图对象
 */
export type AppDetailVO = AppVO & {
  createUser?: import('./userVO').UserSimpleVO;
  useCount: number;
  favorCount: number;
  shareCount: number;
  tags?: string[];
  isFavorite: boolean;
  isPublic: boolean;
};

/**
 * 应用简要信息视图对象（用于列表展示）
 */
export type AppSimpleVO = {
  id: number;
  appName: string;
  appDesc?: string;
  appIcon?: string;
  codeGenType: string;
  appType: number;
  createUserId: number;
  createTime: string;
};

/**
 * 应用分类视图对象
 */
export type AppCategoryVO = {
  id: number;
  categoryName: string;
  parentId?: number;
  sortOrder: number;
  appCount: number;
};

/**
 * 应用标签视图对象
 */
export type AppTagVO = {
  id: number;
  tagName: string;
  tagColor?: string;
  appCount: number;
};

/**
 * 应用统计信息视图对象
 */
export type AppStatisticsVO = {
  totalApps: number;
  publicApps: number;
  privateApps: number;
  underReviewApps: number;
  rejectedApps: number;
};

/**
 * 应用创建响应视图对象
 */
export type AppCreateVO = {
  id: number;
  appName: string;
  appKey?: string;
  appSecret?: string;
  createTime: string;
};

/**
 * 应用配置视图对象
 */
export type AppConfigVO = {
  appId: number;
  maxTokens: number;
  temperature: number;
  topP: number;
  presencePenalty: number;
  frequencyPenalty: number;
  streamEnable: boolean;
  systemPrompt?: string;
};

/**
 * 应用使用记录视图对象
 */
export type AppUsageRecordVO = {
  id: number;
  appId: number;
  appName: string;
  userId: number;
  messageCount: number;
  tokenCount: number;
  pointsCost: number;
  createTime: string;
};

/**
 * 我的应用视图对象
 */
export type MyAppVO = {
  id: number;
  appName: string;
  appDesc?: string;
  appIcon?: string;
  codeGenType: string;
  appType: number;
  reviewStatus: number;
  useCount: number;
  createTime: string;
  updateTime?: string;
};
