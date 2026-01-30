import request from '@/utils/request';
import type {
  ForumPostAddParams,
  ForumPostUpdateParams,
  ForumPostQueryParams,
  DeleteParams,
  ForumCommentParams,
  ForumCommentQueryParams,
} from '@/api/params/forumParams';
import type {
  ForumPostVO,
  ForumPostDetailVO,
  ForumPostSimpleVO,
  ForumBoardVO,
  ForumCommentVO,
  ForumCommentDetailVO,
  HotPostVO,
  LatestPostVO,
  MyForumPostVO,
} from '@/api/vo/forumVO';
import type { CommentVO } from '@/api/vo/commentVO';
import type { PageResponseVO } from '@/api/vo';

/**
 * 发布论坛帖子
 */
export async function addForumPost(body: ForumPostAddParams) {
  return request.post<ForumPostAddParams, PageResponseVO<number>>('/forum/post/add', body);
}

/**
 * 更新论坛帖子
 */
export async function updateForumPost(body: ForumPostUpdateParams) {
  return request.post<ForumPostUpdateParams, PageResponseVO<boolean>>('/forum/post/update', body);
}

/**
 * 删除论坛帖子
 */
export async function deleteForumPost(body: DeleteParams) {
  return request.post<DeleteParams, PageResponseVO<boolean>>('/forum/post/delete', body);
}

/**
 * 根据ID获取论坛帖子
 */
export async function getForumPostVOById(id: string) {
  return request.get<string, PageResponseVO<ForumPostVO>>('/forum/post/get/vo', { params: { id } });
}

/**
 * 分页查询论坛帖子
 */
export async function listForumPostVOByPage(body: ForumPostQueryParams) {
  return request.post<ForumPostQueryParams, PageResponseVO<PageResponseVO<ForumPostSimpleVO>>>('/forum/post/list/page/vo', body);
}

/**
 * 点赞论坛帖子
 */
export async function likeForumPost(body: ForumPostUpdateParams) {
  return request.post<ForumPostUpdateParams, PageResponseVO<boolean>>('/forum/post/like', body);
}

/**
 * 取消点赞论坛帖子
 */
export async function unlikeForumPost(body: ForumPostUpdateParams) {
  return request.post<ForumPostUpdateParams, PageResponseVO<boolean>>('/forum/post/unlike', body);
}

/**
 * 获取热门帖子
 */
export async function listHotPosts(limit?: number) {
  return request.get<number | undefined, PageResponseVO<HotPostVO[]>>('/forum/post/hot/list/vo', { params: { limit } });
}

/**
 * 获取用户的论坛帖子列表
 */
export async function getUserForumPostList(userId: string, pageNum: number = 1, pageSize: number = 10) {
  return request.get<{ userId: string; pageNum: number; pageSize: number }, PageResponseVO<ForumPostSimpleVO[]>>(`/forum/post/user/${userId}/list/page/vo`, {
    params: { pageNum, pageSize }
  });
}

/**
 * 发表评论
 */
export async function addForumComment(body: ForumCommentParams) {
  return request.post<ForumCommentParams, PageResponseVO<number>>('/comment/forum/add', body);
}

/**
 * 回复评论
 */
export async function replyForumComment(body: ForumCommentParams) {
  return request.post<ForumCommentParams, PageResponseVO<number>>('/comment/forum/reply', body);
}

/**
 * 分页查询帖子评论
 */
export async function listForumPostCommentsByPage(body: ForumCommentQueryParams) {
  return request.post<ForumCommentQueryParams, PageResponseVO<PageResponseVO<CommentVO>>>('/comment/forum/list/page/vo', body);
}

/**
 * 点赞论坛评论
 */
export async function likeForumComment(body: { id: string }) {
  return request.post<{ id: string }, PageResponseVO<boolean>>('/comment/forum/like', body);
}

/**
 * 取消点赞论坛评论
 */
export async function unlikeForumComment(body: { id: string }) {
  return request.post<{ id: string }, PageResponseVO<boolean>>('/comment/forum/unlike', body);
}

/**
 * 删除论坛评论
 */
export async function deleteForumComment(body: { id: string }) {
  return request.post<{ id: string }, PageResponseVO<boolean>>('/comment/forum/delete/user', body);
}

/**
 * 获取论坛板块列表
 */
export async function listForumBoards() {
  return request.get<void, PageResponseVO<ForumBoardVO[]>>('/forum/boards');
}

/**
 * 获取最新帖子
 */
export async function getLatestPosts(limit?: number) {
  return request.get<number | undefined, PageResponseVO<LatestPostVO[]>>('/forum/post/latest', { params: { limit } });
}

/**
 * 获取我的论坛帖子
 */
export async function getMyForumPosts(pageNum: number = 1, pageSize: number = 10) {
  return request.get<{ pageNum: number; pageSize: number }, PageResponseVO<MyForumPostVO[]>>('/forum/post/my/list', {
    params: { pageNum, pageSize }
  });
}
