/**
 * 主题颜色配置
 * 定义应用中使用的各种主题颜色
 */
export const THEME_COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
} as const

/**
 * 主题颜色键类型
 * 用于类型安全的主题颜色选择
 */
export type ThemeColorKey = keyof typeof THEME_COLORS

/**
 * 主题选项列表
 * 用于主题切换功能，包含每个主题的键、名称和颜色值
 */
export const THEME_OPTIONS = [
  { key: 'primary' as ThemeColorKey, name: '紫色', value: THEME_COLORS.primary },
  { key: 'secondary' as ThemeColorKey, name: '紫罗兰', value: THEME_COLORS.secondary },
  { key: 'success' as ThemeColorKey, name: '绿色', value: THEME_COLORS.success },
  { key: 'warning' as ThemeColorKey, name: '橙色', value: THEME_COLORS.warning },
  { key: 'error' as ThemeColorKey, name: '红色', value: THEME_COLORS.error },
  { key: 'info' as ThemeColorKey, name: '蓝色', value: THEME_COLORS.info },
] as const
