// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 添加评论 POST /comment/add */
export async function addComment(body: API.CommentAddRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseLong>('/comment/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 回复评论 POST /comment/reply */
export async function replyComment(body: API.CommentReplyRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseLong>('/comment/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 查询所有评论（分页） POST /comment/all/list/page/vo */
export async function listAllCommentsByPage(body: API.CommentQueryRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponsePageCommentVO>('/comment/all/list/page/vo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 查询应用评论（分页） POST /comment/app/list/page/vo */
export async function listAppCommentsByPage(body: API.CommentQueryRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponsePageCommentVO>('/comment/app/list/page/vo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 用户删除评论 POST /comment/delete/user */
export async function deleteComment(body: API.DeleteRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/comment/delete/user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 管理员删除评论 POST /comment/delete */
export async function deleteCommentByAdmin(body: API.DeleteRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/comment/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 管理员查看评论详情 GET /comment/get */
export async function getCommentById(
  params: API.getCommentByIdParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseComment>('/comment/get', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 管理员分页查询评论 POST /comment/list/page */
export async function listCommentByPage(body: API.CommentQueryRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponsePageComment>('/comment/list/page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
