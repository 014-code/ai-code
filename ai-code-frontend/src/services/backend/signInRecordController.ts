import request from '@/utils/request';

export async function dailySignIn(options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseMapStringObject>('/signin/daily', {}, options);
}

export async function getSignInStatus(options?: { [key: string]: any }) {
  return request.get<any, API.BaseResponseMapStringObject>('/signin/status', options);
}
