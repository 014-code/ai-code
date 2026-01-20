import request from '@/utils/request';

export interface InviteCodeResponse {
  inviteCode: string;
  inviteUrl: string;
}

export async function getInviteCode() {
  return request.get<any, API.BaseResponse<InviteCodeResponse>>('/invite/code');
}

export async function getInviteRecords() {
  return request.get<any, API.BaseResponse<API.InviteRecord[]>>('/invite/records');
}

export async function bindInviteCode(inviteCode: string) {
  return request.post<any, API.BaseResponseBoolean>('/user/bind/inviteCode', { inviteCode });
}
