/**
 * AI模型配置相关API接口
 * 提供AI模型的查询功能
 */
import request from '@/utils/request';

/**
 * 获取所有启用的AI模型列表
 * @param options 额外配置
 * @returns Promise<API.BaseResponseListAiModelConfig>
 */
export async function listEnabledModels(options?: { [key: string]: any }) {
  return request.get<any, API.BaseResponseListAiModelConfig>('/ai-model/list', options);
}

/**
 * 根据等级获取AI模型列表
 * @param params 查询参数
 * @param options 额外配置
 * @returns Promise<API.BaseResponseListAiModelConfig>
 */
export async function listModelsByTier(
  params: { tier: string },
  options?: { [key: string]: any },
) {
  return request.get<any, API.BaseResponseListAiModelConfig>('/ai-model/list/tier/' + params.tier, options);
}

/**
 * 根据模型key获取配置信息
 * @param params 查询参数
 * @param options 额外配置
 * @returns Promise<API.BaseResponseAiModelConfig>
 */
export async function getModelByKey(
  params: { modelKey: string },
  options?: { [key: string]: any },
) {
  return request.get<any, API.BaseResponseAiModelConfig>('/ai-model/get/' + params.modelKey, options);
}
