declare namespace API {
  type App = {
    id?: number;
    appname?: string;
    cover?: string;
    initprompt?: string;
    codegentype?: string;
    deploykey?: string;
    deployedtime?: string;
    priority?: number;
    userid?: number;
    edittime?: string;
    createtime?: string;
    updatetime?: string;
    isdelete?: number;
  };

  type AppAddRequest = {
    appName?: string;
    appDesc?: string;
    appIcon?: string;
    appCover?: string;
    initPrompt?: string;
  };

  type AppDeployRequest = {
    appId?: string;
  };

  type AppQueryRequest = {
    pageNum?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    id?: number;
    appName?: string;
    appDesc?: string;
    userId?: number;
    isFeatured?: number;
    searchKey?: string;
  };

  type AppUpdateRequest = {
    id?: string;
    appName?: string;
    appDesc?: string;
    appIcon?: string;
    appCover?: string;
    priority?: number;
  };

  type AppVO = {
    id?: number;
    appName?: string;
    appDesc?: string;
    appIcon?: string;
    appCover?: string;
    initPrompt?: string;
    userId?: number;
    user?: UserVO;
    priority?: number;
    isFeatured?: number;
    editTime?: string;
    createTime?: string;
    updateTime?: string;
  };

  type BaseResponseApp = {
    code?: number;
    data?: App;
    message?: string;
  };

  type BaseResponseAppVO = {
    code?: number;
    data?: AppVO;
    message?: string;
  };

  type BaseResponseBoolean = {
    code?: number;
    data?: boolean;
    message?: string;
  };

  type BaseResponseLoginUserVO = {
    code?: number;
    data?: LoginUserVO;
    message?: string;
  };

  type BaseResponseLong = {
    code?: number;
    data?: number;
    message?: string;
  };

  type BaseResponsePageApp = {
    code?: number;
    data?: PageApp;
    message?: string;
  };

  type BaseResponsePageAppVO = {
    code?: number;
    data?: PageAppVO;
    message?: string;
  };

  type BaseResponsePageUserVO = {
    code?: number;
    data?: PageUserVO;
    message?: string;
  };

  type BaseResponseString = {
    code?: number;
    data?: string;
    message?: string;
  };

  type BaseResponseUser = {
    code?: number;
    data?: User;
    message?: string;
  };

  type BaseResponseUserVO = {
    code?: number;
    data?: UserVO;
    message?: string;
  };

  type chatToGenCodeParams = {
    appId: string;
    message: string;
  };

  type DeleteRequest = {
    id?: number;
  };

  type getAppByIdParams = {
    id: string;
  };

  type getAppVOByIdParams = {
    id: string;
  };

  type getUserByIdParams = {
    id: number;
  };

  type getUserVOByIdParams = {
    id: number;
  };

  type LoginUserVO = {
    id?: number;
    userAccount?: string;
    userName?: string;
    userAvatar?: string;
    userProfile?: string;
    userRole?: string;
    createTime?: string;
    updateTime?: string;
  };

  type PageApp = {
    records?: App[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
  };

  type PageAppVO = {
    records?: AppVO[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
  };

  type PageUserVO = {
    records?: UserVO[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
  };

  type ServerSentEventString = true;

  type User = {
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

  type UserAddRequest = {
    userName?: string;
    userAccount?: string;
    userAvatar?: string;
    userProfile?: string;
    userRole?: string;
  };

  type UserLoginRequest = {
    userAccount?: string;
    userPassword?: string;
  };

  type UserQueryRequest = {
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

  type UserRegisterRequest = {
    userAccount?: string;
    userPassword?: string;
    checkPassword?: string;
  };

  type UserUpdateRequest = {
    id?: number;
    userName?: string;
    userAvatar?: string;
    userProfile?: string;
    userRole?: string;
  };

  type UserVO = {
    id?: number;
    userAccount?: string;
    userName?: string;
    userAvatar?: string;
    userProfile?: string;
    userRole?: string;
    createTime?: string;
  };
}
