import request from '@/utils/request';
import type {
  CommentAddParams,
  CommentReplyParams,
  CommentQueryParams,
  DeleteParams,
  GetCommentByIdParams,
} from '@/api/params/commentParams';
import type {
  CommentVO,
  CommentDetailVO,
  CommentReplyVO,
  CommentSimpleVO,
  CommentStatisticsVO,
} from '@/api/vo/commentVO';
import type { PageResponseVO } from '@/api/vo';

/**
 * 添加评论
 */
export async function addComment(body: CommentAddParams, options?: { [key: string]: unknown }) {
  return request.post<CommentAddParams, PageResponseVO<number>>('/comment/add', body, options);
}

/**
 * 回复评论
 */
export async function replyComment(body: CommentReplyParams, options?: { [key: string]: unknown }) {
  return request.post<CommentReplyParams, PageResponseVO<number>>('/comment/reply', body, options);
}

/**
 * 分页查询所有评论
 */
export async function listAllCommentsByPage(body: CommentQueryParams, options?: { [key: string]: unknown }) {
  return request.post<CommentQueryParams, PageResponseVO<PageResponseVO<CommentVO>>>('/comment/all/list/page/vo', body, options);
}

/**
 * 分页查询应用评论
 */
export async function listAppCommentsByPage(body: CommentQueryParams, options?: { [key: string]: unknown }) {
  return request.post<CommentQueryParams, PageResponseVO<PageResponseVO<CommentVO>>>('/comment/app/list/page/vo', body, options);
}

/**
 * 删除评论
 */
export async function deleteComment(body: DeleteParams, options?: { [key: string]: unknown }) {
  return request.post<DeleteParams, PageResponseVO<boolean>>('/comment/delete/user', body, options);
}

/**
 * 管理员删除评论
 */
export async function deleteCommentByAdmin(body: DeleteParams, options?: { [key: string]: unknown }) {
  return request.post<DeleteParams, PageResponseVO<boolean>>('/comment/delete', body, options);
}

/**
 * 根据ID获取评论
 */
export async function getCommentById(
  params: GetCommentByIdParams,
  options?: { [key: string]: unknown },
) {
  return request.get<GetCommentByIdParams, PageResponseVO<CommentVO>>('/comment/get', { params, ...options });
}

/**
 * 分页查询评论列表
 */
export async function listCommentByPage(body: CommentQueryParams, options?: { [key: string]: unknown }) {
  return request.post<CommentQueryParams, PageResponseVO<PageResponseVO<CommentVO>>>('/comment/list/page', body, options);
}

/**
 * 点赞评论
 */
export async function likeComment(commentId: string) {
  return request.post<string, PageResponseVO<boolean>>('/comment/like', { id: commentId });
}

/**
 * 取消点赞评论
 */
export async function unlikeComment(commentId: string) {
  return request.post<string, PageResponseVO<boolean>>('/comment/unlike', { id: commentId });
}

/**
 * 获取评论统计
 */
export async function getCommentStatistics() {
  return request.get<void, PageResponseVO<CommentStatisticsVO>>('/comment/statistics');
}
