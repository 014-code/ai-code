declare namespace API {
  type App = {
    id?: number;
    appName?: string;
    appType?: string;
    pageViews?: number;
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
    codeGenType?: string;
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
    codeGenType?: string;
    userId?: number;
    isFeatured?: number;
    searchKey?: string;
  };

  type AppTypeVO = {
    code?: number;
    text?: string;
    category?: string;
    categoryName?: string;
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
    appType?: string;
    appDesc?: string;
    pageViews?: number;
    appIcon?: string;
    appCover?: string;
    initPrompt?: string;
    codeGenType?: string;
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

  type BaseResponseListAppTypeVO = {
    code?: number;
    data?: AppTypeVO[];
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

  type downloadAppCodeParams = {
    appId: number;
  };

  type executeWorkflowParams = {
    prompt: string;
  };

  type executeWorkflowWithFluxParams = {
    prompt: string;
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

  type ImageResource = {
    category?: 'CONTENT' | 'LOGO' | 'ILLUSTRATION' | 'ARCHITECTURE';
    description?: string;
    url?: string;
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

  type QualityResult = {
    isValid?: boolean;
    errors?: string[];
    suggestions?: string[];
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

  type UserUpdateInfoRequest = {
    userName?: string;
    userProfile?: string;
  };

  type UserUpdatePasswordRequest = {
    oldPassword?: string;
    newPassword?: string;
    checkPassword?: string;
  };

  type UserUpdateAvatarRequest = {
    userAvatar?: string;
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

  type WorkflowContext = {
    currentStep?: string;
    originalPrompt?: string;
    imageListStr?: string;
    imageList?: ImageResource[];
    enhancedPrompt?: string;
    generationType?: 'HTML' | 'MULTI_FILE' | 'VUE_PROJECT' | 'REACT_PROJECT';
    generatedCodeDir?: string;
    buildResultDir?: string;
    qualityResult?: QualityResult;
    errorMessage?: string;
  };

  type Comment = {
    id?: string;
    appId?: string;
    parentId?: string;
    userId?: string;
    content?: string;
    likeCount?: number;
    replyCount?: number;
    createTime?: string;
    updateTime?: string;
    isDelete?: number;
  };

  type CommentVO = {
    id?: string;
    appId?: string;
    app?: AppVO;
    parentId?: string;
    parentComment?: CommentVO;
    userId?: string;
    user?: UserVO;
    content?: string;
    likeCount?: number;
    replyCount?: number;
    createTime?: string;
    updateTime?: string;
  };

  type CommentAddRequest = {
    appId?: string;
    content?: string;
  };

  type CommentReplyRequest = {
    parentId?: string;
    content?: string;
    replyUserId?: string;
  };

  type CommentQueryRequest = {
    pageNum?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    id?: string;
    appId?: string;
    parentId?: string;
    userId?: string;
    content?: string;
    relatedId?: string;
    commentType?: number;
  };

  type BaseResponseComment = {
    code?: number;
    data?: Comment;
    message?: string;
  };

  type BaseResponseCommentVO = {
    code?: number;
    data?: CommentVO;
    message?: string;
  };

  type BaseResponsePageComment = {
    code?: number;
    data?: PageComment;
    message?: string;
  };

  type BaseResponsePageCommentVO = {
    code?: number;
    data?: PageCommentVO;
    message?: string;
  };

  type PageComment = {
    records?: Comment[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
  };

  type PageCommentVO = {
    records?: CommentVO[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
  };

  type getCommentByIdParams = {
    id: string;
  };

  type ForumPost = {
    id?: string;
    title?: string;
    content?: string;
    appId?: string;
    userId?: string;
    viewCount?: number;
    likeCount?: number;
    commentCount?: number;
    isPinned?: number;
    createTime?: string;
    updateTime?: string;
    isDelete?: number;
  };

  type ForumPostAddRequest = {
    title?: string;
    content?: string;
    appId?: number;
  };

  type ForumPostUpdateRequest = {
    id?: string;
    title?: string;
    content?: string;
    appId?: string;
    isPinned?: number;
  };

  type ForumPostQueryRequest = {
    pageNum?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    id?: string;
    title?: string;
    searchKey?: string;
    appId?: string;
    userId?: string;
    isPinned?: number;
  };

  type ForumPostVO = {
    id?: string;
    title?: string;
    content?: string;
    appId?: string;
    app?: AppVO;
    userId?: string;
    user?: UserVO;
    viewCount?: number;
    likeCount?: number;
    commentCount?: number;
    isPinned?: number;
    createTime?: string;
    updateTime?: string;
  };

  type BaseResponseForumPost = {
    code?: number;
    data?: ForumPost;
    message?: string;
  };

  type BaseResponseForumPostVO = {
    code?: number;
    data?: ForumPostVO;
    message?: string;
  };

  type BaseResponsePageForumPostVO = {
    code?: number;
    data?: PageForumPostVO;
    message?: string;
  };

  type PageForumPostVO = {
    records?: ForumPostVO[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
  };
}
