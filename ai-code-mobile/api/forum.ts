import request from "../utils/request";
import { DeleteParams } from "./params/commonParams";

/**
 * 论坛帖子添加参数接口
 */
export interface ForumPostAddParams {
	/**
	 * 帖子标题
	 */
	title: string;
	/**
	 * 帖子内容
	 */
	content: string;
	/**
	 * 关联的应用ID
	 */
	appId: string;
	/**
	 * 标签列表
	 */
	tags?: string[];
}

/**
 * 论坛帖子更新参数接口
 */
export interface ForumPostUpdateParams {
	/**
	 * 帖子ID
	 */
	id: string;
	/**
	 * 帖子标题
	 */
	title?: string;
	/**
	 * 帖子内容
	 */
	content?: string;
	/**
	 * 标签列表
	 */
	tags?: string[];
}

/**
 * 论坛帖子查询参数接口
 */
export interface ForumPostQueryParams {
	/**
	 * 当前页码
	 */
	current?: number;
	/**
	 * 每页显示数量
	 */
	pageSize?: number;
	/**
	 * 排序字段
	 */
	sortField?: string;
	/**
	 * 排序方式
	 */
	sortOrder?: string;
	/**
	 * 应用ID筛选
	 */
	appId?: string;
	/**
	 * 用户ID筛选
	 */
	userId?: string;
	/**
	 * 标题搜索关键词
	 */
	title?: string;
}

/**
 * 论坛帖子数据接口
 */
export interface ForumPostVO {
	/**
	 * 帖子ID
	 */
	id: string;
	/**
	 * 帖子标题
	 */
	title: string;
	/**
	 * 帖子内容
	 */
	content: string;
	/**
	 * 关联的应用ID
	 */
	appId: string;
	/**
	 * 关联的应用信息
	 */
	app?: {
		/**
		 * 应用ID
		 */
		id?: string;
		/**
		 * 应用名称
		 */
		appName?: string;
		/**
		 * 代码生成类型
		 */
		codeGenType?: string;
		/**
		 * 部署密钥
		 */
		deployKey?: string;
	};
	/**
	 * 用户ID
	 */
	userId: string;
	/**
	 * 用户信息
	 */
	user?: {
		/**
		 * 用户名
		 */
		userName?: string;
		/**
		 * 用户头像
		 */
		userAvatar?: string;
	};
	/**
	 * 浏览次数
	 */
	viewCount?: number;
	/**
	 * 点赞数量
	 */
	likeCount?: number;
	/**
	 * 评论数量
	 */
	commentCount?: number;
	/**
	 * 是否置顶
	 */
	isPinned?: number;
	/**
	 * 创建时间
	 */
	createTime?: string;
	/**
	 * 更新时间
	 */
	updateTime?: string;
}

/**
 * 论坛帖子简化数据接口（不包含 content）
 */
export interface ForumPostSimpleVO {
	/**
	 * 帖子ID
	 */
	id: string;
	/**
	 * 帖子标题
	 */
	title: string;
	/**
	 * 关联的应用ID
	 */
	appId: string;
	/**
	 * 关联的应用信息
	 */
	app?: {
		/**
		 * 应用ID
		 */
		id?: string;
		/**
		 * 应用名称
		 */
		appName?: string;
		/**
		 * 代码生成类型
		 */
		codeGenType?: string;
		/**
		 * 部署密钥
		 */
		deployKey?: string;
	};
	/**
	 * 用户ID
	 */
	userId: string;
	/**
	 * 用户信息
	 */
	user?: {
		/**
		 * 用户名
		 */
		userName?: string;
		/**
		 * 用户头像
		 */
		userAvatar?: string;
	};
	/**
	 * 浏览次数
	 */
	viewCount?: number;
	/**
	 * 点赞数量
	 */
	likeCount?: number;
	/**
	 * 评论数量
	 */
	commentCount?: number;
	/**
	 * 是否置顶
	 */
	isPinned?: number;
	/**
	 * 创建时间
	 */
	createTime?: string;
	/**
	 * 更新时间
	 */
	updateTime?: string;
}

/**
 * 评论添加参数接口
 */
export interface CommentAddParams {
	/**
	 * 应用ID或帖子ID
	 */
	appId: string;
	/**
	 * 评论内容
	 */
	content: string;
	/**
	 * 评论类型
	 * 1: 论坛评论
	 */
	commentType?: number;
}

/**
 * 评论回复参数接口
 */
export interface CommentReplyParams {
	/**
	 * 父评论ID
	 */
	parentId: string;
	/**
	 * 回复内容
	 */
	content: string;
}

/**
 * 评论查询参数接口
 */
export interface CommentQueryParams {
	/**
	 * 当前页码
	 */
	current?: number;
	/**
	 * 页码
	 */
	pageNum?: number;
	/**
	 * 每页显示数量
	 */
	pageSize?: number;
	/**
	 * 排序字段
	 */
	sortField?: string;
	/**
	 * 排序方式
	 */
	sortOrder?: string;
	/**
	 * 帖子ID
	 */
	postId?: string;
	/**
	 * 应用ID
	 */
	appId?: string;
	/**
	 * 评论类型
	 */
	commentType?: number;
}

/**
 * 评论数据接口
 */
export interface CommentVO {
	/**
	 * 评论ID
	 */
	id: string;
	/**
	 * 应用ID
	 */
	appId: string;
	/**
	 * 帖子ID
	 */
	postId?: string;
	/**
	 * 用户ID
	 */
	userId: string;
	/**
	 * 用户信息
	 */
	user?: {
		/**
		 * 用户名
		 */
		userName?: string;
		/**
		 * 用户头像
		 */
		userAvatar?: string;
	};
	/**
	 * 评论内容
	 */
	content: string;
	/**
	 * 父评论ID
	 */
	parentId?: string;
	/**
	 * 点赞数量
	 */
	likeCount?: number;
	/**
	 * 回复数量
	 */
	replyCount?: number;
	/**
	 * 创建时间
	 */
	createTime?: string;
	/**
	 * 更新时间
	 */
	updateTime?: string;
	/**
	 * 是否为主评论
	 */
	mainComment?: boolean;
}

/**
 * 分页结果接口
 * @template T - 数据类型
 */
export interface PageResult<T> {
	/**
	 * 总记录数
	 */
	total: number;
	/**
	 * 数据列表
	 */
	records: T[];
}

/**
 * 基础响应接口
 * @template T - 数据类型
 */
export interface BaseResponse<T> {
	/**
	 * 响应码
	 */
	code: number;
	/**
	 * 响应数据
	 */
	data: T;
	/**
	 * 响应消息
	 */
	message: string;
}

/**
 * 获取论坛帖子列表（分页）
 * @param data - 查询参数
 * @returns 分页的帖子列表
 */
export function listForumPosts(data: ForumPostQueryParams) {
	return request<BaseResponse<PageResult<ForumPostVO>>>({
		url: '/api/forum/post/list/page/vo',
		method: "POST",
		data,
	})
}

/**
 * 获取论坛帖子列表（分页，不返回 content）
 * @param data - 查询参数
 * @returns 分页的帖子列表（不包含 content）
 */
export function listForumPostsSimple(data: ForumPostQueryParams) {
	return request<BaseResponse<PageResult<ForumPostSimpleVO>>>({
		url: '/api/forum/post/list/page/simple',
		method: "POST",
		data,
	})
}

/**
 * 获取论坛帖子详情
 * @param id - 帖子ID
 * @returns 帖子详情
 */
export function getForumPost(id: string) {
	return request<BaseResponse<ForumPostVO>>({
		url: '/api/forum/post/get/vo',
		method: "GET",
		params: { id },
	})
}

/**
 * 添加论坛帖子
 * @param data - 帖子数据
 * @returns 新创建的帖子ID
 */
export function addForumPost(data: ForumPostAddParams) {
	return request<BaseResponse<string>>({
		url: '/api/forum/post/add',
		method: "POST",
		data,
	})
}

/**
 * 更新论坛帖子
 * @param data - 更新数据
 * @returns 是否更新成功
 */
export function updateForumPost(data: ForumPostUpdateParams) {
	return request<BaseResponse<boolean>>({
		url: '/api/forum/post/update',
		method: "POST",
		data,
	})
}

/**
 * 删除论坛帖子
 * @param id - 帖子ID
 * @returns 是否删除成功
 */
export function deleteForumPost(id: string) {
	return request<BaseResponse<boolean>>({
		url: '/api/forum/post/delete',
		method: "POST",
		data: id,
	})
}

/**
 * 点赞论坛帖子
 * @param id - 帖子ID
 * @returns 是否点赞成功
 */
export function likeForumPost(id: string) {
	return request<BaseResponse<boolean>>({
		url: '/api/forum/post/like',
		method: "POST",
		data: { id },
	})
}

/**
 * 取消点赞论坛帖子
 * @param id - 帖子ID
 * @returns 是否取消成功
 */
export function unlikeForumPost(id: string) {
	return request<BaseResponse<boolean>>({
		url: '/api/forum/post/unlike',
		method: "POST",
		data: { id },
	})
}

/**
 * 获取热门帖子列表
 * @param limit - 返回数量限制
 * @returns 热门帖子列表
 */
export function listHotPosts(limit?: number) {
	return request<BaseResponse<ForumPostVO[]>>({
		url: '/api/forum/post/hot/list/vo',
		method: "GET",
		params: { limit },
	})
}

/**
 * 获取论坛评论列表（分页）
 * @param data - 查询参数
 * @returns 分页的评论列表
 */
export function listForumComments(data: CommentQueryParams) {
	return request<BaseResponse<PageResult<CommentVO>>>({
		url: '/api/comment/forum/list/page/vo',
		method: "POST",
		data,
	})
}

/**
 * 添加论坛评论
 * @param data - 评论数据
 * @returns 新创建的评论ID
 */
export function addForumComment(data: CommentAddParams) {
	return request<BaseResponse<string>>({
		url: '/api/comment/forum/add',
		method: "POST",
		data,
	})
}

/**
 * 回复论坛评论
 * @param data - 回复数据
 * @returns 新创建的回复ID
 */
export function replyForumComment(data: CommentReplyParams) {
	return request<BaseResponse<string>>({
		url: '/api/comment/forum/reply',
		method: "POST",
		data,
	})
}

/**
 * 删除论坛评论
 * @param id - 评论ID
 * @returns 是否删除成功
 */
export function deleteForumComment(id: string) {
	return request<BaseResponse<boolean>>({
		url: '/api/comment/forum/delete/user',
		method: "POST",
		data: id,
	})
}

/**
 * 点赞论坛评论
 * @param id - 评论ID
 * @returns 是否点赞成功
 */
export function likeForumComment(id: string) {
	return request<BaseResponse<boolean>>({
		url: '/api/comment/forum/like',
		method: "POST",
		data: id,
	})
}

/**
 * 取消点赞论坛评论
 * @param id - 评论ID
 * @returns 是否取消成功
 */
export function unlikeForumComment(id: string) {
	return request<BaseResponse<boolean>>({
		url: '/api/comment/forum/unlike',
		method: "POST",
		data: id,
	})
}
