/**
 * 代码片段视图对象类型定义
 */

/**
 * 代码片段基本信息视图对象
 */
export type CodeSnippetVO = {
  id: number;
  snippetName: string;
  snippetDesc?: string;
  codeContent: string;
  codeLanguage: string;
  tags?: string[];
  isPublic: boolean;
  viewCount: number;
  likeCount: number;
  collectCount: number;
  createUserId: number;
  createTime: string;
  updateTime?: string;
};

/**
 * 代码片段详情视图对象
 */
export type CodeSnippetDetailVO = CodeSnippetVO & {
  createUser?: import('./userVO').UserSimpleVO;
  likeStatus: boolean;
  collectStatus: boolean;
  comments: CommentVO[];
  relatedSnippets?: CodeSnippetVO[];
};

/**
 * 代码片段简要视图对象（用于列表展示）
 */
export type CodeSnippetSimpleVO = {
  id: number;
  snippetName: string;
  snippetDesc?: string;
  codeLanguage: string;
  tags?: string[];
  createUserId: number;
  createUserName?: string;
  createTime: string;
};

/**
 * 代码片段分类视图对象
 */
export type CodeSnippetCategoryVO = {
  id: number;
  categoryName: string;
  parentId?: number;
  snippetCount: number;
  sortOrder: number;
};

/**
 * 代码片段标签视图对象
 */
export type CodeSnippetTagVO = {
  id: number;
  tagName: string;
  tagColor?: string;
  snippetCount: number;
};

/**
 * 代码片段搜索结果视图对象
 */
export type CodeSnippetSearchVO = {
  total: number;
  pageNum: number;
  pageSize: number;
  list: CodeSnippetSimpleVO[];
};

/**
 * 代码片段统计视图对象
 */
export type CodeSnippetStatisticsVO = {
  totalSnippets: number;
  publicSnippets: number;
  mySnippets: number;
  totalViews: number;
  totalLikes: number;
  totalCollects: number;
};

/**
 * 我的代码片段视图对象
 */
export type MyCodeSnippetVO = {
  id: number;
  snippetName: string;
  snippetDesc?: string;
  codeLanguage: string;
  isPublic: boolean;
  viewCount: number;
  likeCount: number;
  createTime: string;
  updateTime?: string;
};

/**
 * 代码片段版本视图对象
 */
export type CodeSnippetVersionVO = {
  id: number;
  snippetId: number;
  version: string;
  codeContent: string;
  changeDesc?: string;
  createUserId: number;
  createTime: string;
};

/**
 * 代码片段收藏视图对象
 */
export type CodeSnippetCollectVO = {
  id: number;
  userId: number;
  snippetId: number;
  snippet?: CodeSnippetSimpleVO;
  createTime: string;
};

/**
 * 代码片段点赞视图对象
 */
export type CodeSnippetLikeVO = {
  id: number;
  userId: number;
  snippetId: number;
  createTime: string;
};

/**
 * 代码片段分享视图对象
 */
export type CodeSnippetShareVO = {
  id: number;
  snippetId: number;
  shareCode: string;
  shareUrl: string;
  expiresTime?: string;
  viewCount: number;
  createTime: string;
};

/**
 * 代码片段导入视图对象
 */
export type CodeSnippetImportVO = {
  id: number;
  originalUrl?: string;
  originalId?: number;
  importStatus: number;
  createTime: string;
};

import { CommentVO } from './commentVO';
