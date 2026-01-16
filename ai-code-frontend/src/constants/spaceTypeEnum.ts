/**
 * 空间类型枚举
 */
export enum SpaceTypeEnum {
  PERSONAL = 1,
  TEAM = 2,
}

/**
 * 空间类型配置
 */
export const SPACE_TYPE_CONFIG = {
  [SpaceTypeEnum.PERSONAL]: {
    label: '个人空间',
    value: SpaceTypeEnum.PERSONAL,
    description: '仅自己使用的个人工作空间',
  },
  [SpaceTypeEnum.TEAM]: {
    label: '团队空间',
    value: SpaceTypeEnum.TEAM,
    description: '与团队成员协作的共享空间',
  },
} as const;

/**
 * 根据值获取空间类型标签
 * @param value 空间类型值
 * @returns 空间类型标签
 */
export const getSpaceTypeLabel = (value: number): string => {
  return SPACE_TYPE_CONFIG[value as SpaceTypeEnum]?.label || '未知';
}

/**
 * 根据值获取空间类型描述
 * @param value 空间类型值
 * @returns 空间类型描述
 */
export const getSpaceTypeDesc = (value: number): string => {
  return SPACE_TYPE_CONFIG[value as SpaceTypeEnum]?.description || '';
}
