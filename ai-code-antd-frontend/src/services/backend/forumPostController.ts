import { request } from '@umijs/max';

export async function addForumPost(body: API.ForumPostAddRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseLong>('/forum/post/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function updateForumPost(body: API.ForumPostUpdateRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/forum/post/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function deleteForumPost(body: API.DeleteRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/forum/post/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function getForumPostVOById(id: string, options?: { [key: string]: any }) {
  return request<API.BaseResponseForumPostVO>('/forum/post/get/vo', {
    method: 'GET',
    params: {
      id,
    },
    ...(options || {}),
  });
}

export async function listForumPostVOByPage(body: API.ForumPostQueryRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponsePageForumPostVO>('/forum/post/list/page/vo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function likeForumPost(body: API.ForumPostUpdateRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/forum/post/like', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function unlikeForumPost(body: API.ForumPostUpdateRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/forum/post/unlike', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function listHotPosts(limit?: number, options?: { [key: string]: any }) {
  return request<API.BaseResponseListForumPostVO>('/forum/post/hot/list/vo', {
    method: 'GET',
    params: {
      limit,
    },
    ...(options || {}),
  });
}

export async function addForumComment(body: API.Comment, options?: { [key: string]: any }) {
  return request<API.BaseResponseLong>('/comment/forum/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function replyForumComment(body: API.Comment, options?: { [key: string]: any }) {
  return request<API.BaseResponseLong>('/comment/forum/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function listForumPostCommentsByPage(body: API.CommentQueryRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponsePageCommentVO>('/comment/forum/list/page/vo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function likeForumComment(body: string, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/comment/forum/like', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function unlikeForumComment(body: string, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/comment/forum/unlike', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function deleteForumComment(body: string, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/comment/forum/delete/user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
