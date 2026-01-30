/**
 * 空间视图对象类型定义
 */

/**
 * 空间基本信息视图对象
 */
export type SpaceVO = {
  id: string;
  spaceName: string;
  spaceType: number;
  spaceDesc?: string;
  spaceIcon?: string;
  ownerId: number;
  memberCount: number;
  maxMembers: number;
  isPublic: boolean;
  createTime: string;
  updateTime?: string;
};

/**
 * 空间详情视图对象
 */
export type SpaceDetailVO = SpaceVO & {
  owner?: import('./userVO').UserSimpleVO;
  members: SpaceMemberVO[];
  admins: SpaceMemberVO[];
  files: SpaceFileVO[];
  totalStorage: number;
  usedStorage: number;
};

/**
 * 空间成员视图对象
 */
export type SpaceMemberVO = {
  id: number;
  spaceId: string;
  userId: number;
  user?: import('./userVO').UserSimpleVO;
  role: string;
  joinTime: string;
  lastActiveTime?: string;
};

/**
 * 空间文件视图对象
 */
export type SpaceFileVO = {
  id: string;
  spaceId: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadUserId: number;
  uploadUser?: import('./userVO').UserSimpleVO;
  createTime: string;
  updateTime?: string;
};

/**
 * 空间邀请视图对象
 */
export type SpaceInviteVO = {
  id: string;
  spaceId: string;
  inviteCode: string;
  inviteUrl: string;
  inviterId: number;
  inviter?: import('./userVO').UserSimpleVO;
  inviteeId?: number;
  role: string;
  status: number;
  expiresTime?: string;
  createTime: string;
};

/**
 * 空间申请视图对象
 */
export type SpaceApplyVO = {
  id: string;
  spaceId: string;
  applicantId: number;
  applicant?: import('./userVO').UserSimpleVO;
  applyMessage?: string;
  status: number;
  reviewMessage?: string;
  reviewTime?: string;
  createTime: string;
};

/**
 * 空间统计信息视图对象
 */
export type SpaceStatisticsVO = {
  totalSpaces: number;
  ownedSpaces: number;
  joinedSpaces: number;
  totalMembers: number;
  totalFiles: number;
  totalStorage: number;
};

/**
 * 我的空间视图对象
 */
export type MySpaceVO = {
  id: string;
  spaceName: string;
  spaceType: number;
  spaceIcon?: string;
  role: string;
  memberCount: number;
  isPublic: boolean;
  lastActiveTime?: string;
  createTime: string;
};

/**
 * 空间操作日志视图对象
 */
export type SpaceLogVO = {
  id: string;
  spaceId: string;
  operatorId: number;
  operator?: import('./userVO').UserSimpleVO;
  operationType: string;
  operationDesc: string;
  createTime: string;
};

/**
 * 空间权限视图对象
 */
export type SpacePermissionVO = {
  spaceId: string;
  canManage: boolean;
  canInvite: boolean;
  canKick: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canUpload: boolean;
  canDownload: boolean;
};
