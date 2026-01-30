import request from '@/utils/request';

export interface EstimateCostResponse {
  genType: string;
  genTypeDescription: string;
  basePoints: number;
  modelName?: string;
  pointsPerKToken?: number;
  qualityScore?: number;
  estimatedTokenUsage?: number;
  estimatedPoints: number;
  qualityScoreDescription?: string;
  warning?: string;
}

export async function estimateGenerationCost(params: {
  genType?: string;
} = {}) {
  return request.get<any, API.BaseResponse<EstimateCostResponse>>('/points/estimate', { params });
}

export async function getPointsOverview() {
  return request.get<any, API.BaseResponse<{
    availablePoints: number;
    totalEarned: number;
    totalConsumed: number;
  }>>('/points/overview');
}

export async function getPointsRecords(params?: { type?: string }) {
  return request.get<any, API.BaseResponse<API.PointsRecord[]>>('/points/records', { params });
}

export async function getCurrentPoints() {
  return request.get<any, API.BaseResponse<{
    availablePoints: number;
    frozenPoints: number;
  }>>('/points/current');
}
