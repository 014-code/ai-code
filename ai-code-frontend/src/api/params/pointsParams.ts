/**
 * 积分预估参数
 */
export type EstimateCostParams = {
  genType?: string;
};

/**
 * 积分记录查询参数
 */
export type PointsRecordsParams = {
  type?: string;
  pageNum?: number;
  pageSize?: number;
};

/**
 * 用户积分查询参数
 */
export type UserPointParams = {
  userId: number;
};

/**
 * 积分操作参数
 */
export type PointsOperationParams = {
  userId: number;
  points: number;
  type: string;
  reason?: string;
  relatedId?: number;
};
