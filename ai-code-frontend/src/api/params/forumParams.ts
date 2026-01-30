/**
 * 论坛帖子添加参数
 */
export type ForumPostAddParams = {
  title: string;
  content: string;
  appId?: number;
};

/**
 * 论坛帖子更新参数
 */
export type ForumPostUpdateParams = {
  id: string;
  title?: string;
  content?: string;
  appId?: string;
  isPinned?: number;
};

/**
 * 论坛帖子查询参数
 */
export type ForumPostQueryParams = {
  pageNum: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: string;
  id?: string;
  title?: string;
  searchKey?: string;
  appId?: string;
  userId?: string;
  isPinned?: number;
};

/**
 * 获取论坛帖子参数
 */
export type GetForumPostParams = {
  id: number;
};

/**
 * 论坛帖子点赞参数
 */
export type ForumPostLikeParams = {
  id: number;
};
