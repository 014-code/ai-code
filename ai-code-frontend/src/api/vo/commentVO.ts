/**
 * 评论视图对象类型定义
 */

/**
 * 评论基本信息视图对象
 */
export type CommentVO = {
  id: number;
  targetType: string;
  targetId: number;
  content: string;
  likeCount: number;
  replyCount: number;
  status: number;
  createUserId: number;
  createTime: string;
  updateTime?: string;
};

/**
 * 评论详情视图对象
 */
export type CommentDetailVO = CommentVO & {
  createUser?: import('./userVO').UserSimpleVO;
  replies?: CommentReplyVO[];
  likeStatus: boolean;
};

/**
 * 评论回复视图对象
 */
export type CommentReplyVO = {
  id: number;
  commentId: number;
  parentReplyId?: number;
  content: string;
  likeCount: number;
  status: number;
  createUserId: number;
  createUser?: import('./userVO').UserSimpleVO;
  replyToUserId?: number;
  replyToUser?: import('./userVO').UserSimpleVO;
  createTime: string;
  updateTime?: string;
};

/**
 * 评论简要视图对象（用于列表展示）
 */
export type CommentSimpleVO = {
  id: number;
  targetType: string;
  targetId: number;
  contentPreview: string;
  likeCount: number;
  createUserId: number;
  createUserName?: string;
  createUserAvatar?: string;
  createTime: string;
};

/**
 * 我的评论视图对象
 */
export type MyCommentVO = {
  id: number;
  targetType: string;
  targetId: number;
  targetTitle?: string;
  content: string;
  likeCount: number;
  status: number;
  createTime: string;
};

/**
 * 评论统计视图对象
 */
export type CommentStatisticsVO = {
  totalComments: number;
  myComments: number;
  receivedLikes: number;
  todayComments: number;
};

/**
 * 评论点赞视图对象
 */
export type CommentLikeVO = {
  id: number;
  commentId: number;
  userId: number;
  createTime: string;
};

/**
 * 评论举报视图对象
 */
export type CommentReportVO = {
  id: number;
  commentId: number;
  reportType: string;
  reportContent?: string;
  status: number;
  createUserId: number;
  createTime: string;
};

/**
 * 消息通知视图对象
 */
export type NotificationVO = {
  id: number;
  type: string;
  title: string;
  content: string;
  sourceType?: string;
  sourceId?: string;
  readStatus: number;
  createTime: string;
};

/**
 * 通知统计视图对象
 */
export type NotificationStatisticsVO = {
  totalNotifications: number;
  unreadCount: number;
  likeNotifications: number;
  commentNotifications: number;
  systemNotifications: number;
};

/**
 * @Mention 通知视图对象
 */
export type MentionNotificationVO = {
  id: number;
  targetType: string;
  targetId: number;
  targetTitle?: string;
  mentionUserId: number;
  mentionUser?: import('./userVO').UserSimpleVO;
  content: string;
  readStatus: number;
  createTime: string;
};

/**
 * 点赞通知视图对象
 */
export type LikeNotificationVO = {
  id: number;
  targetType: string;
  targetId: number;
  targetTitle?: string;
  likeUserId: number;
  likeUser?: import('./userVO').UserSimpleVO;
  readStatus: number;
  createTime: string;
};

/**
 * 评论通知视图对象
 */
export type CommentNotificationVO = {
  id: number;
  targetType: string;
  targetId: number;
  targetTitle?: string;
  commentId: number;
  commentContent: string;
  commentUserId: number;
  commentUser?: import('./userVO').UserSimpleVO;
  readStatus: number;
  createTime: string;
};
