/**
 * 空间添加参数
 */
export type SpaceAddParams = {
  spaceName: string;
  spaceType: number;
  spaceDesc?: string;
};

/**
 * 空间更新参数
 */
export type SpaceUpdateParams = {
  id: string;
  spaceName?: string;
  description?: string;
};

/**
 * 空间查询参数
 */
export type SpaceQueryParams = {
  pageNum: number;
  pageSize: number;
  id?: string;
  spaceName?: string;
  spaceType?: number;
  ownerId?: string;
  sortField?: string;
  sortOrder?: string;
};

/**
 * 空间成员操作参数
 */
export type SpaceMemberParams = {
  spaceId: string;
  userId: string;
};

/**
 * 空间应用操作参数
 */
export type SpaceAppParams = {
  spaceId: string;
  appId: string;
};

/**
 * 空间邀请参数
 */
export type SpaceInviteParams = {
  spaceId: string;
  invitedUserId: number;
  role: string;
};

/**
 * 获取空间参数
 */
export type GetSpaceParams = {
  id: number;
};

/**
 * 获取空间成员参数
 */
export type GetSpaceMembersParams = {
  spaceId: number;
};
