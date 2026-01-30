/**
 * 用户登录参数
 */
export type UserLoginParams = {
  userAccount: string;
  userPassword: string;
};

/**
 * 用户注册参数
 */
export type UserRegisterParams = {
  userAccount: string;
  userPassword: string;
  checkPassword: string;
  email?: string;
  emailCode?: string;
  inviteCode?: string;
};

/**
 * 用户更新参数
 */
export type UserUpdateParams = {
  id: number;
  userName?: string;
  userAvatar?: string;
  userProfile?: string;
  userRole?: string;
};

/**
 * 用户更新个人信息参数
 */
export type UserUpdateInfoParams = {
  userName?: string;
  userProfile?: string;
};

/**
 * 用户更新密码参数
 */
export type UserUpdatePasswordParams = {
  oldPassword: string;
  newPassword: string;
  checkPassword: string;
};

/**
 * 用户更新头像参数
 */
export type UserUpdateAvatarParams = {
  userAvatar: string;
};

/**
 * 发送邮箱验证码参数
 */
export type SendEmailCodeParams = {
  email: string;
  type: string;
};

/**
 * 用户查询参数
 */
export type UserQueryParams = {
  pageNum: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: string;
  id?: number;
  userName?: string;
  userAccount?: string;
  userProfile?: string;
  userRole?: string;
};
