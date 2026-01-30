/**
 * 评论添加参数
 */
export type CommentAddParams = {
  appId: string;
  content: string;
};

/**
 * 评论回复参数
 */
export type CommentReplyParams = {
  parentId: string;
  content: string;
  replyUserId: string;
};

/**
 * 评论查询参数
 */
export type CommentQueryParams = {
  pageNum: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: string;
  id?: string;
  appId?: string;
  parentId?: string;
  userId?: string;
  content?: string;
  relatedId?: string;
  commentType?: number;
};

/**
 * 获取评论参数
 */
export type GetCommentParams = {
  id: string;
};

/**
 * 删除评论参数
 */
export type DeleteCommentParams = {
  id: string;
};

/**
 * 评论点赞参数
 */
export type CommentLikeParams = {
  id: string;
};
