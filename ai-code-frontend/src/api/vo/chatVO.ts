/**
 * 聊天视图对象类型定义
 */

/**
 * 聊天记录视图对象
 */
export type ChatRecordVO = {
  id: number;
  appId: number;
  message: string;
  messageType: string;
  responseMessage?: string;
  codeContent?: string;
  codeLanguage?: string;
  tokenCount: number;
  pointsCost: number;
  createTime: string;
  updateTime?: string;
};

/**
 * 聊天消息视图对象
 */
export type ChatMessageVO = {
  id: number;
  conversationId: string;
  role: string;
  content: string;
  codeContent?: string;
  codeLanguage?: string;
  tokens: number;
  points: number;
  createTime: string;
};

/**
 * 对话历史视图对象
 */
export type ChatHistoryVO = {
  id: number;
  appId: number;
  appName: string;
  appIcon?: string;
  messageCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
  createTime: string;
  updateTime?: string;
};

/**
 * 对话详情视图对象
 */
export type ChatDetailVO = {
  id: number;
  conversationId: string;
  appId: number;
  appName: string;
  appIcon?: string;
  messageCount: number;
  totalTokens: number;
  totalPoints: number;
  createTime: string;
  updateTime?: string;
  messages: ChatMessageVO[];
};

/**
 * 代码生成结果视图对象
 */
export type CodeGenResultVO = {
  id: number;
  conversationId: string;
  appId: number;
  userMessage: string;
  codeContent: string;
  codeLanguage: string;
  codeExplanation?: string;
  tokens: number;
  pointsCost: number;
  createTime: string;
};

/**
 * 代码执行结果视图对象
 */
export type CodeExecuteResultVO = {
  id: number;
  codeGenId: number;
  output: string;
  error?: string;
  executionTime: number;
  memoryUsage: number;
  createTime: string;
};

/**
 * 对话模板视图对象
 */
export type ChatTemplateVO = {
  id: number;
  templateName: string;
  templateDesc?: string;
  initPrompt: string;
  appId?: number;
  isDefault: boolean;
  createUserId: number;
  createTime: string;
};

/**
 * 对话统计信息视图对象
 */
export type ChatStatisticsVO = {
  totalConversations: number;
  totalMessages: number;
  totalTokens: number;
  totalPoints: number;
  avgResponseTime: number;
  todayConversations: number;
  todayMessages: number;
};

/**
 * 对话分享视图对象
 */
export type ChatShareVO = {
  id: number;
  conversationId: string;
  shareCode: string;
  shareUrl: string;
  viewCount: number;
  expiresTime?: string;
  createTime: string;
};

/**
 * 对话反馈视图对象
 */
export type ChatFeedbackVO = {
  id: number;
  conversationId: string;
  messageId: number;
  feedbackType: string;
  feedbackContent?: string;
  createTime: string;
};

/**
 * 对话收藏视图对象
 */
export type ChatFavoriteVO = {
  id: number;
  userId: number;
  conversationId: string;
  name?: string;
  description?: string;
  createTime: string;
};
