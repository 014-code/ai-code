import request from "../utils/request";
import { CommentAddParams, CommentQueryParams, CommentReplyParams, CommentLikeParams } from "./params/commentParams";
import { DeleteParams } from "./params/commonParams";

/**
 * 查询所有评论
 * 获取平台所有评论列表，支持分页和排序
 * 返回的评论包含应用信息，用于实现类似论坛的功能
 * 
 * @param data - 查询参数，包含分页信息、排序字段、应用ID、用户ID等筛选条件
 * @returns 返回所有评论列表，包含应用信息和用户信息
 */
export function listAllComments(data: CommentQueryParams) {
	return request({
		url: '/api/comment/all/list/page/vo',
		method: "POST",
		data,
	})
}

/**
 * 查询应用评论
 * 获取指定应用的评论列表，支持分页和排序
 * 
 * @param data - 查询参数，包含分页信息、排序字段、应用ID等筛选条件
 * @returns 返回指定应用的评论列表，包含回复信息
 */
export function listAppComments(data: CommentQueryParams) {
	return request({
		url: '/api/comment/app/list/page/vo',
		method: "POST",
		data,
	})
}

/**
 * 添加评论
 * 为指定应用添加评论
 * 
 * @param data - 评论添加参数，包含应用ID和评论内容
 * @returns 返回添加评论的请求结果
 */
export function addComment(data: CommentAddParams) {
	return request({
		url: '/api/comment/add',
		method: "POST",
		data,
	})
}

/**
 * 回复评论
 * 回复某条具体评论，或者回复应用的评论（主评论）
 * 
 * @param data - 回复评论参数，包含父评论ID和回复内容
 * @returns 返回回复评论的请求结果
 */
export function replyComment(data: CommentReplyParams) {
	return request({
		url: '/api/comment/reply',
		method: "POST",
		data,
	})
}

/**
 * 删除评论
 * 删除指定的评论（用户删除自己的评论）
 * 
 * @param id - 评论ID
 * @returns 返回删除评论的请求结果
 */
export function deleteComment(id: number) {
	return request({
		url: '/api/comment/delete/user',
		method: "POST",
		data: id,
	})
}

/**
 * 点赞评论
 * 为指定评论添加点赞
 * 
 * @param data - 点赞参数，包含评论ID
 * @returns 返回点赞评论的请求结果
 */
export function likeComment(data: CommentLikeParams) {
	return request({
		url: '/api/comment/like',
		method: "POST",
		data,
	})
}

/**
 * 取消点赞评论
 * 取消对指定评论的点赞
 * 
 * @param data - 取消点赞参数，包含评论ID
 * @returns 返回取消点赞评论的请求结果
 */
export function unlikeComment(data: CommentLikeParams) {
	return request({
		url: '/api/comment/unlike',
		method: "POST",
		data,
	})
}

/**
 * 查询我的评论
 * 获取当前用户发表的评论列表，支持分页和排序
 * 
 * @param data - 查询参数，包含分页信息、排序字段等筛选条件
 * @returns 返回我的评论列表
 */
export function myCommentList(data: CommentQueryParams) {
	return request({
		url: '/api/comment/my/list/page/vo',
		method: "POST",
		data,
	})
}
