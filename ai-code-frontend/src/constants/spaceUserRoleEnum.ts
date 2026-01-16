/**
 * 空间用户角色常量
 */
export const SpaceUserRoleEnum = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
} as const;

export type SpaceUserRoleEnum = typeof SpaceUserRoleEnum[keyof typeof SpaceUserRoleEnum];

/**
 * 空间用户角色配置
 */
export const SPACE_USER_ROLE_CONFIG = {
  [SpaceUserRoleEnum.OWNER]: {
    label: '所有者',
    value: SpaceUserRoleEnum.OWNER,
    description: '空间创建者，拥有所有权限',
    color: 'red',
  },
  [SpaceUserRoleEnum.ADMIN]: {
    label: '管理员',
    value: SpaceUserRoleEnum.ADMIN,
    description: '可以管理成员和应用',
    color: 'orange',
  },
  [SpaceUserRoleEnum.MEMBER]: {
    label: '成员',
    value: SpaceUserRoleEnum.MEMBER,
    description: '普通成员，可以查看和使用应用',
    color: 'blue',
  },
} as const;

/**
 * 根据值获取空间用户角色标签
 * @param value 角色值
 * @returns 角色标签
 */
export const getSpaceUserRoleLabel = (value: string): string => {
  return SPACE_USER_ROLE_CONFIG[value as SpaceUserRoleEnum]?.label || value;
}

/**
 * 根据值获取空间用户角色描述
 * @param value 角色值
 * @returns 角色描述
 */
export const getSpaceUserRoleDesc = (value: string): string => {
  return SPACE_USER_ROLE_CONFIG[value as SpaceUserRoleEnum]?.description || '';
}

/**
 * 根据值获取空间用户角色颜色
 * @param value 角色值
 * @returns 角色颜色
 */
export const getSpaceUserRoleColor = (value: string): string => {
  return SPACE_USER_ROLE_CONFIG[value as SpaceUserRoleEnum]?.color || 'default';
}
