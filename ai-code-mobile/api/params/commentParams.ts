/**
 * 评论添加参数
 * 用于添加新评论时的参数定义
 */
export type CommentAddParams = {
    /**
     * 应用ID
     * 评论所属的应用
     */
    appId?: number;
    /**
     * 评论内容
     * 评论的具体内容
     */
    content?: string;
};

/**
 * 评论回复参数
 * 用于回复评论时的参数定义
 */
export type CommentReplyParams = {
    /**
     * 父评论ID
     * 被回复的评论ID，如果是回复应用的主评论，则为应用的主评论ID
     */
    parentId?: number;
    /**
     * 回复内容
     * 回复的具体内容
     */
    content?: string;
    /**
     * 回复的用户ID
     * 被回复的用户ID（可选）
     */
    replyUserId?: number;
};

/**
 * 评论查询参数
 * 用于查询评论列表时的参数定义，支持分页、排序和多条件筛选
 */
export type CommentQueryParams = {
    /**
     * 当前页码
     * 从1开始
     */
    pageNum?: number;
    /**
     * 每页条数
     * 默认为10
     */
    pageSize?: number;
    /**
     * 排序字段
     * 如：createTime、likeCount
     */
    sortField?: string;
    /**
     * 排序方式
     * asc: 升序
     * desc: 降序
     */
    sortOrder?: string;
    /**
     * 评论ID
     * 用于查询特定评论
     */
    id?: number;
    /**
     * 应用ID
     * 用于查询特定应用的评论
     */
    appId?: number;
    /**
     * 父评论ID
     * 用于查询特定评论的回复
     */
    parentId?: number;
    /**
     * 用户ID
     * 用于查询特定用户的评论
     */
    userId?: number;
    /**
     * 评论内容
     * 用于模糊搜索评论内容
     */
    content?: string;
    /**
     * 搜索关键词
     * 用于搜索评论内容
     */
    searchKey?: string;
};

/**
 * 评论点赞参数
 * 用于点赞评论时的参数定义
 */
export type CommentLikeParams = {
    /**
     * 评论ID
     * 要点赞的评论ID
     */
    commentId?: number;
};
