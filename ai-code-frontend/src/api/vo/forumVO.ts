/**
 * 社区论坛视图对象类型定义
 */

/**
 * 论坛帖子视图对象
 */
export type ForumPostVO = {
  id: number;
  title: string;
  content: string;
  contentType: string;
  tags?: string[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  collectCount: number;
  isTop: boolean;
  isEssence: boolean;
  status: number;
  createUserId: number;
  createTime: string;
  updateTime?: string;
};

/**
 * 论坛帖子详情视图对象
 */
export type ForumPostDetailVO = ForumPostVO & {
  createUser?: import('./userVO').UserSimpleVO;
  likeStatus: boolean;
  collectStatus: boolean;
  comments: CommentVO[];
  previousPost?: ForumPostVO;
  nextPost?: ForumPostVO;
};

/**
 * 论坛帖子简要视图对象（用于列表展示）
 */
export type ForumPostSimpleVO = {
  id: number;
  title: string;
  contentPreview: string;
  tags?: string[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isTop: boolean;
  isEssence: boolean;
  createUserId: number;
  createUserName?: string;
  createUserAvatar?: string;
  createTime: string;
};

/**
 * 论坛板块视图对象
 */
export type ForumBoardVO = {
  id: number;
  boardName: string;
  boardDesc?: string;
  parentId?: number;
  icon?: string;
  postCount: number;
  todayPostCount: number;
  sortOrder: number;
};

/**
 * 论坛板块详情视图对象
 */
export type ForumBoardDetailVO = ForumBoardVO & {
  children?: ForumBoardVO[];
  posts: ForumPostSimpleVO[];
};

/**
 * 论坛评论视图对象
 */
export type ForumCommentVO = {
  id: number;
  postId: number;
  content: string;
  likeCount: number;
  replyCount: number;
  status: number;
  createUserId: number;
  createTime: string;
  updateTime?: string;
};

/**
 * 论坛评论详情视图对象
 */
export type ForumCommentDetailVO = ForumCommentVO & {
  createUser?: import('./userVO').UserSimpleVO;
  replies?: ForumCommentVO[];
  likeStatus: boolean;
};

/**
 * 论坛搜索结果视图对象
 */
export type ForumSearchVO = {
  total: number;
  pageNum: number;
  pageSize: number;
  list: ForumPostSimpleVO[];
};

/**
 * 论坛统计信息视图对象
 */
export type ForumStatisticsVO = {
  totalPosts: number;
  totalComments: number;
  totalUsers: number;
  todayPosts: number;
  totalBoards: number;
  hotPosts: ForumPostSimpleVO[];
};

/**
 * 热门帖子视图对象
 */
export type HotPostVO = {
  id: number;
  title: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  score: number;
  createTime: string;
};

/**
 * 最新帖子视图对象
 */
export type LatestPostVO = {
  id: number;
  title: string;
  boardName: string;
  createUserName: string;
  createUserAvatar?: string;
  createTime: string;
};

/**
 * 我的帖子视图对象
 */
export type MyForumPostVO = {
  id: number;
  title: string;
  contentType: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  status: number;
  isTop: boolean;
  isEssence: boolean;
  createTime: string;
  updateTime?: string;
};

/**
 * 帖子分享视图对象
 */
export type ForumPostShareVO = {
  id: number;
  postId: number;
  shareCode: string;
  shareUrl: string;
  expiresTime?: string;
  viewCount: number;
  createTime: string;
};

/**
 * 帖子举报视图对象
 */
export type ForumReportVO = {
  id: number;
  targetType: string;
  targetId: number;
  reportType: string;
  reportContent?: string;
  status: number;
  createUserId: number;
  createTime: string;
};
