/**
 * API 通用响应视图对象类型定义
 */

/**
 * 通用分页响应视图对象
 */
export type PageResponseVO<T> = {
  total: number;
  pageNum: number;
  pageSize: number;
  totalPages: number;
  list: T[];
};

/**
 * 通用响应视图对象
 */
export type BaseResponseVO<T = unknown> = {
  code: number;
  data: T;
  message?: string;
  description?: string;
};

/**
 * 登录响应视图对象
 */
export type LoginResponseVO = {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
};

/**
 * 分页查询参数视图对象
 */
export type PageQueryVO = {
  pageNum: number;
  pageSize: number;
  total?: number;
  pages?: number;
};

/**
 * 排序参数视图对象
 */
export type SortVO = {
  field: string;
  order: 'asc' | 'desc';
};

/**
 * 筛选参数视图对象
 */
export type FilterVO = {
  field: string;
  value: unknown;
  operator?: 'eq' | 'ne' | 'gt' | 'lt' | 'ge' | 'le' | 'like' | 'in' | 'between';
};

/**
 * 上传文件响应视图对象
 */
export type UploadFileVO = {
  fileName: string;
  filePath: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
};

/**
 * 文件信息视图对象
 */
export type FileInfoVO = {
  id: string;
  fileName: string;
  filePath: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadUserId: number;
  createTime: string;
};

/**
 * 地区信息视图对象
 */
export type RegionVO = {
  id: number;
  name: string;
  code: string;
  parentId?: number;
  level: number;
};

/**
 * 字典数据视图对象
 */
export type DictDataVO = {
  dictType: string;
  dictCode: string;
  dictLabel: string;
  dictValue: string;
  sortOrder: number;
  status: number;
};

/**
 * 字典类型视图对象
 */
export type DictTypeVO = {
  dictType: string;
  dictName: string;
  status: number;
  remark?: string;
  createTime?: string;
};

/**
 * 验证码响应视图对象
 */
export type CaptchaVO = {
  captchaKey: string;
  captchaImage: string;
  captchaExpiresIn: number;
};

/**
 * 配置信息视图对象
 */
export type ConfigVO = {
  configKey: string;
  configValue: string;
  configType: string;
  remark?: string;
};

/**
 * 通用列表响应视图对象
 */
export type ListResponseVO<T> = {
  list: T[];
  total: number;
};

/**
 * 树形结构视图对象
 */
export type TreeNodeVO<T = unknown> = {
  id: string | number;
  label: string;
  children?: TreeNodeVO<T>[];
  [key: string]: unknown;
};

/**
 * 级联选择器视图对象
 */
export type CascaderVO = {
  value: string | number;
  label: string;
  children?: CascaderVO[];
};

/**
 * 选择器选项视图对象
 */
export type SelectOptionVO = {
  value: string | number;
  label: string;
  disabled?: boolean;
  children?: SelectOptionVO[];
};

/**
 * 键值对视图对象
 */
export type KeyValueVO = {
  key: string;
  value: unknown;
};

/**
 * 结果消息视图对象
 */
export type ResultMessageVO = {
  type: 'success' | 'error' | 'warning' | 'info';
  content: string;
};

/**
 * 批量操作结果视图对象
 */
export type BatchResultVO = {
  successCount: number;
  failCount: number;
  totalCount: number;
  errors?: Array<{
    id: string | number;
    message: string;
  }>;
};

/**
 * 导出数据响应视图对象
 */
export type ExportResultVO = {
  exportId: string;
  fileName: string;
  fileUrl: string;
  status: number;
  progress: number;
  createTime: string;
  completeTime?: string;
};

/**
 * 导入数据响应视图对象
 */
export type ImportResultVO = {
  importId: string;
  totalCount: number;
  successCount: number;
  failCount: number;
  errors?: Array<{
    row: number;
    message: string;
  }>;
  fileUrl?: string;
  createTime: string;
};
