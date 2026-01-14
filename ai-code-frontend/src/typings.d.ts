declare module '*.css';
declare module '*.less';
declare module '*.scss';
declare module '*.sass';
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.bmp';
declare module '*.tiff';

declare const REACT_APP_ENV: 'test' | 'dev' | 'pre' | false;

interface PageInfo<T> {
  current: number;
  size: number;
  total: number;
  records: T[];
}

interface PageRequest {
  current?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: 'ascend' | 'descend';
}

interface DeleteRequest {
  id: number;
}

interface BaseResponse<T> {
  code: number;
  data: T;
  message?: string;
}

interface InitialState {
  currentUser?: API.LoginUserVO;
}

declare namespace API {
  interface LoginUserVO {
    id?: number;
    userAccount?: string;
    userName?: string;
    userAvatar?: string;
    userProfile?: string;
    userRole?: string;
    createTime?: string;
    updateTime?: string;
  }

  interface UserVO {
    id?: number;
    userAccount?: string;
    userName?: string;
    userAvatar?: string;
    userProfile?: string;
    userRole?: string;
    createTime?: string;
  }

  interface App {
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
  }

  interface AppAddRequest {
    appName?: string;
    appDesc?: string;
    appIcon?: string;
    appCover?: string;
    initPrompt?: string;
    codeGenType?: string;
  }

  interface AppDeployRequest {
    appId?: number;
  }

  interface AppQueryRequest {
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
  }

  interface AppTypeVO {
    code?: number;
    text?: string;
    category?: string;
    categoryName?: string;
  }

  interface AppUpdateRequest {
    id?: number;
    appName?: string;
    appDesc?: string;
    appIcon?: string;
    appCover?: string;
    priority?: number;
  }

  interface AppVO {
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
  }

  interface BaseResponseApp {
    code?: number;
    data?: App;
    message?: string;
  }

  interface BaseResponseAppVO {
    code?: number;
    data?: AppVO;
    message?: string;
  }

  interface BaseResponseBoolean {
    code?: number;
    data?: boolean;
    message?: string;
  }

  interface BaseResponseChatHistory {
    code?: number;
    data?: ChatHistory;
    message?: string;
  }

  interface BaseResponseListAppTypeVO {
    code?: number;
    data?: AppTypeVO[];
    message?: string;
  }

  interface BaseResponseListChatHistoryVO {
    code?: number;
    data?: ChatHistoryVO[];
    message?: string;
  }

  interface BaseResponseLoginUserVO {
    code?: number;
    data?: LoginUserVO;
    message?: string;
  }

  interface BaseResponseLong {
    code?: number;
    data?: number;
    message?: string;
  }

  interface BaseResponsePageApp {
    code?: number;
    data?: PageApp;
    message?: string;
  }

  interface BaseResponsePageAppVO {
    code?: number;
    data?: PageAppVO;
    message?: string;
  }

  interface BaseResponsePageChatHistory {
    code?: number;
    data?: PageChatHistory;
    message?: string;
  }

  interface BaseResponsePageChatHistoryVO {
    code?: number;
    data?: PageChatHistoryVO;
    message?: string;
  }

  interface BaseResponsePageUserVO {
    code?: number;
    data?: PageUserVO;
    message?: string;
  }

  interface BaseResponseString {
    code?: number;
    data?: string;
    message?: string;
  }

  interface BaseResponseUser {
    code?: number;
    data?: User;
    message?: string;
  }

  interface BaseResponseUserVO {
    code?: number;
    data?: UserVO;
    message?: string;
  }

  interface ChatHistory {
    id?: number;
    appId?: number;
    userId?: number;
    messageType?: string;
    messageContent?: string;
    createTime?: string;
    updateTime?: string;
    isDelete?: number;
  }

  interface ChatHistoryAddRequest {
    appId?: number;
    messageType?: string;
    messageContent?: string;
    errorInfo?: string;
  }

  interface ChatHistoryQueryRequest {
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
  }

  interface ChatHistoryVO {
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
  }

  interface chatToGenCodeParams {
    appId: number;
    message: string;
  }

  interface DeleteRequest {
    id?: number;
  }

  interface downloadAppCodeParams {
    appId: number;
  }

  interface executeWorkflowParams {
    prompt: string;
  }

  interface executeWorkflowWithFluxParams {
    prompt: string;
  }

  interface getAppByIdParams {
    id: number;
  }

  interface getAppVOByIdParams {
    id: number;
  }

  interface getChatHistoryByIdParams {
    id: number;
  }

  interface getUserByIdParams {
    id: number;
  }

  interface getUserVOByIdParams {
    id: number;
  }

  interface ImageResource {
    category?: 'CONTENT' | 'LOGO' | 'ILLUSTRATION' | 'ARCHITECTURE';
    description?: string;
    url?: string;
  }

  interface listAppChatHistoryParams {
    appId: number;
    pageSize?: number;
    lastCreateTime?: string;
  }

  interface listLatestChatHistoryVOParams {
    appId: number;
  }

  interface PageApp {
    records?: App[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
  }

  interface PageAppVO {
    records?: AppVO[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
  }

  interface PageChatHistory {
    records?: ChatHistory[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
  }

  interface PageChatHistoryVO {
    records?: ChatHistoryVO[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
  }

  interface PageUserVO {
    records?: UserVO[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
  }

  interface QualityResult {
    isValid?: boolean;
    errors?: string[];
    suggestions?: string[];
  }

  interface ServerSentEventString = true;

  interface User {
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
  }

  interface UserAddRequest {
    userName?: string;
    userAccount?: string;
    userAvatar?: string;
    userProfile?: string;
    userRole?: string;
  }

  interface UserLoginRequest {
    userAccount?: string;
    userPassword?: string;
  }

  interface UserQueryRequest {
    pageNum?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    id?: number;
    userName?: string;
    userAccount?: string;
    userProfile?: string;
    userRole?: string;
  }

  interface UserRegisterRequest {
    userAccount?: string;
    userPassword?: string;
    checkPassword?: string;
  }

  interface UserUpdateRequest {
    id?: number;
    userName?: string;
    userAvatar?: string;
    userProfile?: string;
    userRole?: string;
  }

  interface UserUpdateInfoRequest {
    userName?: string;
    userProfile?: string;
  }

  interface UserUpdatePasswordRequest {
    oldPassword?: string;
    newPassword?: string;
    checkPassword?: string;
  }

  interface UserUpdateAvatarRequest {
    userAvatar?: string;
  }

  interface Comment {
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
  }

  interface CommentVO {
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
  }

  interface CommentAddRequest {
    appId?: string;
    content?: string;
  }

  interface CommentReplyRequest {
    parentId?: string;
    content?: string;
    replyUserId?: string;
  }

  interface CommentQueryRequest {
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
  }

  interface BaseResponseComment {
    code?: number;
    data?: Comment;
    message?: string;
  }

  interface BaseResponseCommentVO {
    code?: number;
    data?: CommentVO;
    message?: string;
  }

  interface BaseResponsePageComment {
    code?: number;
    data?: PageComment;
    message?: string;
  }

  interface BaseResponsePageCommentVO {
    code?: number;
    data?: PageCommentVO;
    message?: string;
  }

  interface PageComment {
    records?: Comment[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
  }

  interface PageCommentVO {
    records?: CommentVO[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
  }

  interface getCommentByIdParams {
    id: string;
  }

  interface ForumPost {
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
  }

  interface ForumPostAddRequest {
    title?: string;
    content?: string;
    appId?: number;
  }

  interface ForumPostUpdateRequest {
    id?: string;
    title?: string;
    content?: string;
    appId?: string;
    isPinned?: number;
  }

  interface ForumPostQueryRequest {
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
  }

  interface ForumPostVO {
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
  }

  interface BaseResponseForumPost {
    code?: number;
    data?: ForumPost;
    message?: string;
  }

  interface BaseResponseForumPostVO {
    code?: number;
    data?: ForumPostVO;
    message?: string;
  }

  interface BaseResponsePageForumPostVO {
    code?: number;
    data?: PageForumPostVO;
    message?: string;
  }

  interface PageForumPostVO {
    records?: ForumPostVO[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
  }

  interface BaseResponseListForumPostVO {
    code?: number;
    data?: ForumPostVO[];
    message?: string;
  }

  interface BaseResponseListCommentVO {
    code?: number;
    data?: CommentVO[];
    message?: string;
  }

  interface PresetPromptVO {
    id?: number;
    prompt?: string;
    category?: string;
  }

  interface BaseResponseListPresetPromptVO {
    code?: number;
    data?: PresetPromptVO[];
    message?: string;
  }
}