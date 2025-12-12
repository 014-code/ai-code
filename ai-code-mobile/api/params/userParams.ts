export type UserAddParams = {
    userName?: string;
    userAccount?: string;
    userAvatar?: string;
    userProfile?: string;
    userRole?: string;
};

export type UserLoginParams = {
    userAccount?: string;
    userPassword?: string;
};

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

export type UserRegisterParams = {
    userAccount?: string;
    userPassword?: string;
    checkPassword?: string;
};

export type UserUpdateParams = {
    id?: number;
    userName?: string;
    userAvatar?: string;
    userProfile?: string;
    userRole?: string;
};

