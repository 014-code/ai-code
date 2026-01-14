
/**
 * 应用常量配置
 */

// 应用名称
export const APP_NAME = 'AI Code Generator';

// API基础路径
export const API_BASE_URL = '/api';

// 生产环境后端主机
export const BACKEND_HOST_PROD = "https://xxx";

// 静态资源基础URL
// 使用相对路径以确保同域访问，避免跨域iframe限制
export const STATIC_BASE_URL = '/deploy';

/**
 * 路由配置
 */
export const ROUTES = {
  HOME: '/',                  // 首页
  LOGIN: '/login',            // 登录页
  REGISTER: '/register',      // 注册页
  USER_CENTER: '/user',       // 用户中心
  APP_EDIT: '/app/:id',       // 应用编辑页
  APP_CREATE: '/app/create',  // 应用创建页
  CASES: '/cases',            // 案例展示页
  CHAT: '/chat',              // 对话页面
  FORUM_LIST: '/forum',       // 论坛列表页
  FORUM_DETAIL: '/forum/:id', // 论坛详情页
  FORUM_PUBLISH: '/forum/publish', // 论坛发布页
  ADMIN: '/admin',            // 管理后台首页
  ADMIN_USER: '/admin/user',  // 管理员用户管理
  ADMIN_APP: '/admin/app',    // 管理员应用管理
  ADMIN_CHAT: '/admin/chat'   // 管理员对话管理
} as const;

/**
 * 存储键名配置
 */
export const STORAGE_KEYS = {
  TOKEN: 'token',            // 令牌存储键
  USER_INFO: 'userInfo',      // 用户信息存储键
  THEME: 'theme'              // 主题存储键
} as const;

/**
 * 分页配置
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,      // 默认每页大小
  DEFAULT_PAGE: 1             // 默认页码
} as const;

/**
 * 聊天配置
 */
export const CHAT_CONFIG = {
  MAX_MESSAGES: 100,          // 最大消息数量
  STREAM_TIMEOUT: 30000       // 流式传输超时时间(毫秒)
} as const;