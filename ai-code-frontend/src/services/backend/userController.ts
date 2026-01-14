import request from '@/utils/request';

export async function addUser(body: API.UserAddRequest, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseLong>('/user/add', body, options);
}

export async function deleteUser(body: API.DeleteRequest, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseBoolean>('/user/delete', body, options);
}

export async function getUserById(
  params: API.getUserByIdParams,
  options?: { [key: string]: any },
) {
  return request.get<any, API.BaseResponseUser>('/user/get', { params, ...options });
}

export async function getLoginUser(options?: { [key: string]: any }) {
  return request.get<any, API.BaseResponseLoginUserVO>('/user/get/login', options);
}

export async function getUserVoById(
  params: API.getUserVOByIdParams,
  options?: { [key: string]: any },
) {
  return request.get<any, API.BaseResponseUserVO>('/user/get/vo', { params, ...options });
}

export async function listUserVoByPage(
  body: API.UserQueryRequest,
  options?: { [key: string]: any },
) {
  return request.post<any, API.BaseResponsePageUserVO>('/user/list/page/vo', body, options);
}

export async function userLogin(body: API.UserLoginRequest, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseLoginUserVO>('/user/login', body, options);
}

export async function userLogout(options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseBoolean>('/user/logout', {}, options);
}

export async function userRegister(
  body: API.UserRegisterRequest,
  options?: { [key: string]: any },
) {
  return request.post<any, API.BaseResponseLong>('/user/register', body, options);
}

export async function updateUser(body: API.UserUpdateRequest, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseBoolean>('/user/update', body, options);
}

export async function updateUserInfo(body: API.UserUpdateInfoRequest, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseBoolean>('/user/update/info', body, options);
}

export async function updateUserPassword(body: API.UserUpdatePasswordRequest, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseBoolean>('/user/update/password', body, options);
}

export async function updateUserAvatar(body: API.UserUpdateAvatarRequest, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseBoolean>('/user/update/avatar', body, options);
}
