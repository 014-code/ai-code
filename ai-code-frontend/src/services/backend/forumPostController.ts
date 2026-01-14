import request from '@/utils/request';

export async function addForumPost(body: API.ForumPostAddRequest, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseLong>('/forum/post/add', body, options);
}

export async function updateForumPost(body: API.ForumPostUpdateRequest, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseBoolean>('/forum/post/update', body, options);
}

export async function deleteForumPost(body: API.DeleteRequest, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseBoolean>('/forum/post/delete', body, options);
}

export async function getForumPostVOById(id: string, options?: { [key: string]: any }) {
  return request.get<any, API.BaseResponseForumPostVO>('/forum/post/get/vo', { params: { id }, ...options });
}

export async function listForumPostVOByPage(body: API.ForumPostQueryRequest, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponsePageForumPostVO>('/forum/post/list/page/vo', body, options);
}

export async function likeForumPost(body: API.ForumPostUpdateRequest, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseBoolean>('/forum/post/like', body, options);
}

export async function unlikeForumPost(body: API.ForumPostUpdateRequest, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseBoolean>('/forum/post/unlike', body, options);
}

export async function listHotPosts(limit?: number, options?: { [key: string]: any }) {
  return request.get<any, API.BaseResponseListForumPostVO>('/forum/post/hot/list/vo', { params: { limit }, ...options });
}

export async function addForumComment(body: API.Comment, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseLong>('/comment/forum/add', body, options);
}

export async function replyForumComment(body: API.Comment, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseLong>('/comment/forum/reply', body, options);
}

export async function listForumPostCommentsByPage(body: API.CommentQueryRequest, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponsePageCommentVO>('/comment/forum/list/page/vo', body, options);
}

export async function likeForumComment(body: string, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseBoolean>('/comment/forum/like', body, options);
}

export async function unlikeForumComment(body: string, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseBoolean>('/comment/forum/unlike', body, options);
}

export async function deleteForumComment(body: string, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseBoolean>('/comment/forum/delete/user', body, options);
}
