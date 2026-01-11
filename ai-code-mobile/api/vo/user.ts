/**
 * 用户视图对象分页对象
 * 表示用户视图对象列表的分页信息
 */
export type PageUserVO = {
    records?: UserVO[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
};

/**
 * 用户实体类型
 * 表示用户的基本信息
 */
export type User = {
    id?: number;
    userAccount?: string;
    userPassword?: string;
    userName?: string;
    userAvatar?: string;
    userProfile?: string;
    userRole?: string;
    editTime?: string;
    createTime?: string;
    updateTime?: string;
    isDelete?: number;
};

/**
 * 用户视图对象
 * 表示用户的详细信息，用于展示给前端
 */
export type UserVO = {
    id?: number;
    userAccount?: string;
    userName?: string;
    userAvatar?: string;
    userProfile?: string;
    userRole?: string;
    createTime?: string;
};

/**
 * 登录用户视图对象
 * 表示登录用户的详细信息
 */
export type LoginUserVO = {
    id?: number;
    userAccount?: string;
    userName?: string;
    userAvatar?: string;
    userProfile?: string;
    userRole?: string;
    createTime?: string;
    updateTime?: string;
  };
