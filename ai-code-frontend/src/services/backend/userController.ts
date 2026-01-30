import request from '@/utils/request';
import type {
  UserLoginParams,
  UserRegisterParams,
  UserUpdateParams,
  UserUpdateInfoParams,
  UserUpdatePasswordParams,
  UserUpdateAvatarParams,
  SendEmailCodeParams,
  UserQueryParams,
  DeleteParams,
  UserAddParams,
} from '@/api/params/userParams';
import type {
  UserVO,
  UserDetailVO,
  UserLoginVO,
  UserRegisterVO,
  UserPointsVO,
  UserSimpleVO,
} from '@/api/vo/userVO';
import type { PageResponseVO } from '@/api/vo';

/**
 * 添加用户
 */
export async function addUser(body: UserAddParams) {
  return request.post<UserAddParams, PageResponseVO<number>>('/user/add', body);
}

/**
 * 删除用户
 */
export async function deleteUser(body: DeleteParams) {
  return request.post<DeleteParams, PageResponseVO<boolean>>('/user/delete', body);
}

/**
 * 根据ID获取用户
 */
export async function getUserById(id: string) {
  return request.get<string, PageResponseVO<UserVO>>('/user/get', { params: { id } });
}

/**
 * 获取当前登录用户
 */
export async function getLoginUser() {
  return request.get<void, PageResponseVO<UserLoginVO>>('/user/get/login');
}

/**
 * 根据ID获取用户VO
 */
export async function getUserVoById(id: string) {
  return request.get<string, PageResponseVO<UserVO>>('/user/get/vo', { params: { id } });
}

/**
 * 获取用户信息
 */
export async function getUserInfo(id: string) {
  return request.get<string, PageResponseVO<UserVO>>('/user/get/vo', { params: { id } });
}

/**
 * 分页查询用户列表
 */
export async function listUserVoByPage(body: UserQueryParams) {
  return request.post<UserQueryParams, PageResponseVO<PageResponseVO<UserVO>>>('/user/list/page/vo', body);
}

/**
 * 用户登录
 */
export async function userLogin(body: UserLoginParams) {
  return request.post<UserLoginParams, PageResponseVO<UserLoginVO>>('/user/login', body);
}

/**
 * 用户登出
 */
export async function userLogout() {
  return request.post<void, PageResponseVO<boolean>>('/user/logout', {});
}

/**
 * 用户注册
 */
export async function userRegister(body: UserRegisterParams) {
  return request.post<UserRegisterParams, PageResponseVO<number>>('/user/register', body);
}

/**
 * 更新用户
 */
export async function updateUser(body: UserUpdateParams) {
  return request.post<UserUpdateParams, PageResponseVO<boolean>>('/user/update', body);
}

/**
 * 更新用户信息
 */
export async function updateUserInfo(body: UserUpdateInfoParams) {
  return request.post<UserUpdateInfoParams, PageResponseVO<boolean>>('/user/update/info', body);
}

/**
 * 更新用户密码
 */
export async function updateUserPassword(body: UserUpdatePasswordParams) {
  return request.post<UserUpdatePasswordParams, PageResponseVO<boolean>>('/user/update/password', body);
}

/**
 * 更新用户头像
 */
export async function updateUserAvatar(body: UserUpdateAvatarParams) {
  return request.post<UserUpdateAvatarParams, PageResponseVO<boolean>>('/user/update/avatar', body);
}

/**
 * 发送邮箱验证码
 */
export async function sendEmailCode(body: SendEmailCodeParams) {
  return request.post<SendEmailCodeParams, PageResponseVO<boolean>>('/user/email/send', body);
}

/**
 * 通过邮箱注册
 */
export async function userRegisterByEmail(body: UserRegisterParams) {
  return request.post<UserRegisterParams, PageResponseVO<number>>('/user/register/email', body);
}

/**
 * 获取用户积分
 */
export async function getUserPoint(userId: string) {
  return request.get<string, PageResponseVO<UserPointsVO>>('/userPoint/get', { params: { userId } });
}
