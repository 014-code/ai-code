import request from '@/utils/request';

export async function sendFriendRequest(data: { addresseeId: string; message: string }) {
  return request.post<BaseResponse<any>>('/friend/request', data);
}

export async function acceptFriendRequest(requestId: string) {
  return request.put<BaseResponse<boolean>>(`/friend/request/${requestId}/accept`);
}

export async function rejectFriendRequest(requestId: string) {
  return request.put<BaseResponse<boolean>>(`/friend/request/${requestId}/reject`);
}

export async function getFriendRequestList(params: { status: string; pageNum: number; pageSize: number }) {
  return request.get<BaseResponse<any>>('/friend/requests', { params });
}

export async function getFriendList(params: { pageNum: number; pageSize: number }) {
  return request.get<BaseResponse<any>>('/friend/list', { params });
}

export async function deleteFriend(friendId: string) {
  return request.delete<BaseResponse<boolean>>(`/friend/${friendId}`);
}