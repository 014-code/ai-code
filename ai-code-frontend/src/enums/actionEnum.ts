/**
 * 通知类型枚举
 */
export enum NotificationTypeEnum {
  INFO = "INFO",
  ERROR = "ERROR"
}

/**
 * 编辑状态枚举
 */
export enum EditStatusEnum {
  ENTER_EDIT = "进入编辑状态",
  EXIT_EDIT = "退出编辑状态",
  EDIT_ACTION = "执行编辑操作"
}

/**
 * 交互操作枚举
 */
export enum InteractionActionEnum {
  SEND_MESSAGE = "发送消息",
  HOVER_ELEMENT = "触摸元素",
  SELECT_ELEMENT = "选择元素",
  CLEAR_ELEMENT = "清除元素"
}

/**
 * 部署操作枚举
 */
export enum DeployActionEnum {
  DEPLOY_PROJECT = "部署项目",
  STOP_RESPONSE = "停止回复"
}
