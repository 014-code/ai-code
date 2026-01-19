import request from '@/utils/request';

export async function addUser(body: API.UserAddRequest) {
  return request.post<any, API.BaseResponseLong>('/user/add', body);
}

export async function deleteUser(body: API.DeleteRequest) {
  return request.post<any, API.BaseResponseBoolean>('/user/delete', body);
}

export async function getUserById(id: string) {
  return request.get<any, API.BaseResponseUser>('/user/get', { params: { id } });
}

export async function getLoginUser() {
  return request.get<any, API.BaseResponseLoginUserVO>('/user/get/login');
}

export async function getUserVoById(id: string) {
  return request.get<any, API.BaseResponseUserVO>('/user/get/vo', { params: { id } });
}

export async function getUserInfo(id: string) {
  return request.get<any, API.BaseResponseUserVO>('/user/get/vo', { params: { id } });
}

export async function listUserVoByPage(body: API.UserQueryRequest) {
  return request.post<any, API.BaseResponsePageUserVO>('/user/list/page/vo', body);
}

export async function userLogin(body: API.UserLoginRequest) {
  return request.post<any, API.BaseResponseLoginUserVO>('/user/login', body);
}

export async function userLogout() {
  return request.post<any, API.BaseResponseBoolean>('/user/logout', {});
}

export async function userRegister(body: API.UserRegisterRequest) {
  return request.post<any, API.BaseResponseLong>('/user/register', body);
}

export async function updateUser(body: API.UserUpdateRequest) {
  return request.post<any, API.BaseResponseBoolean>('/user/update', body);
}

export async function updateUserInfo(body: API.UserUpdateInfoRequest) {
  return request.post<any, API.BaseResponseBoolean>('/user/update/info', body);
}

export async function updateUserPassword(body: API.UserUpdatePasswordRequest) {
  return request.post<any, API.BaseResponseBoolean>('/user/update/password', body);
}

export async function updateUserAvatar(body: API.UserUpdateAvatarRequest) {
  return request.post<any, API.BaseResponseBoolean>('/user/update/avatar', body);
}

export async function sendEmailCode(body: API.SendEmailCodeRequest) {
  return request.post<any, API.BaseResponseBoolean>('/user/email/send', body);
}

export async function userRegisterByEmail(body: API.UserRegisterRequest) {
  return request.post<any, API.BaseResponseLong>('/user/register/email', body);
}

export async function getUserPoint(userId: string) {
  return request.get<any, API.BaseResponseUserPointVO>('/userPoint/get', { params: { userId } });
}