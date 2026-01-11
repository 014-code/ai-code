/**
 * 用户添加参数
 * 用于创建新用户时的参数定义
 */
export type UserAddParams = {
    userName?: string;
    userAccount?: string;
    userAvatar?: string;
    userProfile?: string;
    userRole?: string;
};

/**
 * 用户登录参数
 * 用于用户登录时的参数定义
 */
export type UserLoginParams = {
    userAccount?: string;
    userPassword?: string;
};

/**
 * 用户查询参数
 * 用于查询用户列表时的参数定义，支持分页、排序和多条件筛选
 */
export type UserQueryParams = {
    pageNum?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    id?: number;
    userName?: string;
    userAccount?: string;
    userProfile?: string;
    userRole?: string;
};

/**
 * 用户注册参数
 * 用于用户注册时的参数定义
 */
export type UserRegisterParams = {
    userAccount?: string;
    userPassword?: string;
    checkPassword?: string;
};

/**
 * 用户更新参数
 * 用于更新用户信息时的参数定义
 */
export type UserUpdateParams = {
    id?: number;
    userName?: string;
    userAvatar?: string;
    userProfile?: string;
    userRole?: string;
};
