declare namespace API {
  type App = {
    id?: number;
    appName?: string;
    cover?: string;
    initPrompt?: string;
    codeGenType?: string;
    deployKey?: string;
    deployedTime?: string;
    priority?: number;
    userId?: number;
    editTime?: string;
    createTime?: string;
    updateTime?: string;
    isDelete?: number;
  };

  type AppAddRequest = {
    appName?: string;
    appDesc?: string;
    appIcon?: string;
    appCover?: string;
    initPrompt?: string;
  };

  type AppDeployRequest = {
    appId?: number;
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
    id?: number;
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
    cover?: string;
    deployKey?: string;
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

  type BaseResponseChatHistory = {
    code?: number;
    data?: ChatHistory;
    message?: string;
  };

  type BaseResponseListChatHistoryVO = {
    code?: number;
    data?: ChatHistoryVO[];
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

  type BaseResponsePageChatHistory = {
    code?: number;
    data?: PageChatHistory;
    message?: string;
  };

  type BaseResponsePageChatHistoryVO = {
    code?: number;
    data?: PageChatHistoryVO;
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

  type ChatHistory = {
    id?: number;
    appId?: number;
    userId?: number;
    messageType?: string;
    messageContent?: string;
    errorInfo?: string;
    createTime?: string;
    updateTime?: string;
    isDelete?: number;
  };

  type ChatHistoryAddRequest = {
    appId?: number;
    messageType?: string;
    messageContent?: string;
    errorInfo?: string;
  };

  type ChatHistoryQueryRequest = {
    pageNum?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    id?: number;
    message?: string;
    messageType?: string;
    appId?: number;
    userId?: number;
    lastCreateTime?: string;
  };

  type ChatHistoryVO = {
    id?: number;
    appId?: number;
    userId?: number;
    messageType?: string;
    messageTypeDesc?: string;
    messageContent?: string;
    errorInfo?: string;
    createTime?: string;
    updateTime?: string;
    user?: UserVO;
    app?: AppVO;
  };

  type chatToGenCodeParams = {
    appId: number;
    message: string;
  };

  type DeleteRequest = {
    id?: number;
  };

  type getAppByIdParams = {
    id: number;
  };

  type getAppVOByIdParams = {
    id: number;
  };

  type getChatHistoryByIdParams = {
    id: number;
  };

  type getUserByIdParams = {
    id: number;
  };

  type getUserVOByIdParams = {
    id: number;
  };

  type listAppChatHistoryParams = {
    appId: number;
    pageSize?: number;
    lastCreateTime?: string;
  };

  type listLatestChatHistoryVOParams = {
    appId: number;
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

  type PageChatHistory = {
    records?: ChatHistory[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
  };

  type PageChatHistoryVO = {
    records?: ChatHistoryVO[];
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
