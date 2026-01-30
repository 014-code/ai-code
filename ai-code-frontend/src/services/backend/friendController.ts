import request from '@/utils/request';
import type { PageResponseVO } from '@/api/vo';

export interface FriendRequestParams {
  addresseeId: string;
  message?: string;
}

export interface FriendRequestListParams {
  status: string;
  pageNum: number;
  pageSize: number;
}

export interface FriendListParams {
  pageNum: number;
  pageSize: number;
}

export interface FriendVO {
  id: number;
  userId: number;
  friendId: number;
  friendName?: string;
  friendAvatar?: string;
  remark?: string;
  status: number;
  createTime: string;
}

export interface FriendRequestVO {
  id: number;
  requesterId: number;
  requesterName?: string;
  requesterAvatar?: string;
  addresseeId: number;
  message?: string;
  status: number;
  createTime: string;
}

/**
 * 发送好友请求
 */
export async function sendFriendRequest(data: FriendRequestParams) {
  return request.post<FriendRequestParams, PageResponseVO<boolean>>('/friend/request', data);
}

/**
 * 接受好友请求
 */
export async function acceptFriendRequest(requestId: string) {
  return request.put<string, PageResponseVO<boolean>>(`/friend/request/${requestId}/accept`);
}

/**
 * 拒绝好友请求
 */
export async function rejectFriendRequest(requestId: string) {
  return request.put<string, PageResponseVO<boolean>>(`/friend/request/${requestId}/reject`);
}

/**
 * 获取好友请求列表
 */
export async function getFriendRequestList(params: FriendRequestListParams) {
  return request.get<FriendRequestListParams, PageResponseVO<FriendRequestVO[]>>('/friend/requests', { params });
}

/**
 * 获取好友列表
 */
export async function getFriendList(params: FriendListParams) {
  return request.get<FriendListParams, PageResponseVO<FriendVO[]>>('/friend/list', { params });
}

/**
 * 删除好友
 */
export async function deleteFriend(friendId: string) {
  return request.delete<string, PageResponseVO<boolean>>(`/friend/${friendId}`);
}

/**
 * 获取好友详情
 */
export async function getFriendDetail(friendId: string) {
  return request.get<string, PageResponseVO<FriendVO>>(`/friend/${friendId}`);
}

/**
 * 更新好友备注
 */
export async function updateFriendRemark(friendId: string, remark: string) {
  return request.put<{ friendId: string; remark: string }, PageResponseVO<boolean>>('/friend/remark', { friendId, remark });
}
