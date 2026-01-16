import request from '@/utils/request';

export async function addForumPost(body: API.ForumPostAddRequest) {
  return request.post<any, API.BaseResponseLong>('/forum/post/add', body);
}

export async function updateForumPost(body: API.ForumPostUpdateRequest) {
  return request.post<any, API.BaseResponseBoolean>('/forum/post/update', body);
}

export async function deleteForumPost(body: API.DeleteRequest) {
  return request.post<any, API.BaseResponseBoolean>('/forum/post/delete', body);
}

export async function getForumPostVOById(id: string) {
  return request.get<any, API.BaseResponseForumPostVO>('/forum/post/get/vo', { params: { id } });
}

export async function listForumPostVOByPage(body: API.ForumPostQueryRequest) {
  return request.post<any, API.BaseResponsePageForumPostVO>('/forum/post/list/page/vo', body);
}

export async function likeForumPost(body: API.ForumPostUpdateRequest) {
  return request.post<any, API.BaseResponseBoolean>('/forum/post/like', body);
}

export async function unlikeForumPost(body: API.ForumPostUpdateRequest) {
  return request.post<any, API.BaseResponseBoolean>('/forum/post/unlike', body);
}

export async function listHotPosts(limit?: number) {
  return request.get<any, API.BaseResponseListForumPostVO>('/forum/post/hot/list/vo', { params: { limit } });
}

export async function getUserForumPostList(userId: string, pageNum: number = 1, pageSize: number = 10) {
  return request.get<any, API.BaseResponsePageForumPostVO>(`/forum/post/user/${userId}/list/page/vo`, {
    params: { pageNum, pageSize }
  });
}

export async function addForumComment(body: API.Comment) {
  return request.post<any, API.BaseResponseLong>('/comment/forum/add', body);
}

export async function replyForumComment(body: API.Comment) {
  return request.post<any, API.BaseResponseLong>('/comment/forum/reply', body);
}

export async function listForumPostCommentsByPage(body: API.CommentQueryRequest) {
  return request.post<any, API.BaseResponsePageCommentVO>('/comment/forum/list/page/vo', body);
}

export async function likeForumComment(body: string) {
  return request.post<any, API.BaseResponseBoolean>('/comment/forum/like', body);
}

export async function unlikeForumComment(body: string) {
  return request.post<any, API.BaseResponseBoolean>('/comment/forum/unlike', body);
}

export async function deleteForumComment(body: string) {
  return request.post<any, API.BaseResponseBoolean>('/comment/forum/delete/user', body);
}