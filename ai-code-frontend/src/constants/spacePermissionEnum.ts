/**
 * 空间权限常量
 */
import { SpaceUserRoleEnum } from './spaceUserRoleEnum';

export const SpacePermissionEnum = {
  VIEW_SPACE: 'VIEW_SPACE',
  EDIT_SPACE: 'EDIT_SPACE',
  DELETE_SPACE: 'DELETE_SPACE',
  ADD_MEMBER: 'ADD_MEMBER',
  REMOVE_MEMBER: 'REMOVE_MEMBER',
  MANAGE_MEMBER: 'MANAGE_MEMBER',
  ADD_APP: 'ADD_APP',
  REMOVE_APP: 'REMOVE_APP',
  MANAGE_APP: 'MANAGE_APP',
} as const;

export type SpacePermissionEnum = typeof SpacePermissionEnum[keyof typeof SpacePermissionEnum];

/**
 * 空间权限配置
 */
export const SPACE_PERMISSION_CONFIG = {
  [SpacePermissionEnum.VIEW_SPACE]: {
    label: '查看空间',
    value: SpacePermissionEnum.VIEW_SPACE,
    description: '查看空间信息',
  },
  [SpacePermissionEnum.EDIT_SPACE]: {
    label: '编辑空间',
    value: SpacePermissionEnum.EDIT_SPACE,
    description: '编辑空间基本信息',
  },
  [SpacePermissionEnum.DELETE_SPACE]: {
    label: '删除空间',
    value: SpacePermissionEnum.DELETE_SPACE,
    description: '删除整个空间',
  },
  [SpacePermissionEnum.ADD_MEMBER]: {
    label: '添加成员',
    value: SpacePermissionEnum.ADD_MEMBER,
    description: '邀请成员加入空间',
  },
  [SpacePermissionEnum.REMOVE_MEMBER]: {
    label: '移除成员',
    value: SpacePermissionEnum.REMOVE_MEMBER,
    description: '从空间中移除成员',
  },
  [SpacePermissionEnum.MANAGE_MEMBER]: {
    label: '管理成员',
    value: SpacePermissionEnum.MANAGE_MEMBER,
    description: '管理成员角色和权限',
  },
  [SpacePermissionEnum.ADD_APP]: {
    label: '添加应用',
    value: SpacePermissionEnum.ADD_APP,
    description: '将应用添加到空间',
  },
  [SpacePermissionEnum.REMOVE_APP]: {
    label: '移除应用',
    value: SpacePermissionEnum.REMOVE_APP,
    description: '从空间中移除应用',
  },
  [SpacePermissionEnum.MANAGE_APP]: {
    label: '管理应用',
    value: SpacePermissionEnum.MANAGE_APP,
    description: '管理空间中的应用',
  },
} as const;

/**
 * 根据值获取空间权限标签
 * @param value 权限值
 * @returns 权限标签
 */
export const getSpacePermissionLabel = (value: string): string => {
  return SPACE_PERMISSION_CONFIG[value as SpacePermissionEnum]?.label || value;
}

/**
 * 根据值获取空间权限描述
 * @param value 权限值
 * @returns 权限描述
 */
export const getSpacePermissionDesc = (value: string): string => {
  return SPACE_PERMISSION_CONFIG[value as SpacePermissionEnum]?.description || '';
}

/**
 * 角色权限映射
 * 定义每个角色拥有的权限
 */
export const ROLE_PERMISSIONS: Record<string, SpacePermissionEnum[]> = {
  [SpaceUserRoleEnum.OWNER]: [
    SpacePermissionEnum.VIEW_SPACE,
    SpacePermissionEnum.EDIT_SPACE,
    SpacePermissionEnum.DELETE_SPACE,
    SpacePermissionEnum.ADD_MEMBER,
    SpacePermissionEnum.REMOVE_MEMBER,
    SpacePermissionEnum.MANAGE_MEMBER,
    SpacePermissionEnum.ADD_APP,
    SpacePermissionEnum.REMOVE_APP,
    SpacePermissionEnum.MANAGE_APP,
  ],
  [SpaceUserRoleEnum.ADMIN]: [
    SpacePermissionEnum.VIEW_SPACE,
    SpacePermissionEnum.EDIT_SPACE,
    SpacePermissionEnum.ADD_MEMBER,
    SpacePermissionEnum.REMOVE_MEMBER,
    SpacePermissionEnum.MANAGE_MEMBER,
    SpacePermissionEnum.ADD_APP,
    SpacePermissionEnum.REMOVE_APP,
    SpacePermissionEnum.MANAGE_APP,
  ],
  [SpaceUserRoleEnum.MEMBER]: [
    SpacePermissionEnum.VIEW_SPACE,
    SpacePermissionEnum.ADD_APP,
    SpacePermissionEnum.REMOVE_APP,
  ],
}

/**
 * 检查角色是否拥有指定权限
 * @param role 角色
 * @param permission 权限
 * @returns 是否拥有权限
 */
export const hasPermission = (role: string, permission: SpacePermissionEnum): boolean => {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * 获取角色的所有权限
 * @param role 角色
 * @returns 权限列表
 */
export const getRolePermissions = (role: string): SpacePermissionEnum[] => {
  return ROLE_PERMISSIONS[role] || [];
}
