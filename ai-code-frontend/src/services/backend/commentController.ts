import request from '@/utils/request';

export async function addComment(body: API.CommentAddRequest, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseLong>('/comment/add', body, options);
}

export async function replyComment(body: API.CommentReplyRequest, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseLong>('/comment/reply', body, options);
}

export async function listAllCommentsByPage(body: API.CommentQueryRequest, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponsePageCommentVO>('/comment/all/list/page/vo', body, options);
}

export async function listAppCommentsByPage(body: API.CommentQueryRequest, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponsePageCommentVO>('/comment/app/list/page/vo', body, options);
}

export async function deleteComment(body: API.DeleteRequest, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseBoolean>('/comment/delete/user', body, options);
}

export async function deleteCommentByAdmin(body: API.DeleteRequest, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseBoolean>('/comment/delete', body, options);
}

export async function getCommentById(
  params: API.getCommentByIdParams,
  options?: { [key: string]: any },
) {
  return request.get<any, API.BaseResponseComment>('/comment/get', { params, ...options });
}

export async function listCommentByPage(body: API.CommentQueryRequest, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponsePageComment>('/comment/list/page', body, options);
}
