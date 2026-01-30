import request from '@/utils/request';
import type {
  CodeSnippetAddParams,
  CodeSnippetUpdateParams,
  CodeSnippetDeleteParams,
  CodeSnippetSearchParams,
  CodeSnippetListParams,
} from '@/api/params/codeSnippetParams';
import type {
  CodeSnippetVO,
  CodeSnippetDetailVO,
  CodeSnippetSimpleVO,
  CodeSnippetStatisticsVO,
  MyCodeSnippetVO,
} from '@/api/vo/codeSnippetVO';
import type { PageResponseVO } from '@/api/vo';

/**
 * 添加代码片段
 */
export async function addCodeSnippet(body: CodeSnippetAddParams, options?: { [key: string]: unknown }) {
  return request.post<CodeSnippetAddParams, PageResponseVO<number>>('/codeSnippet/add', body, options);
}

/**
 * 更新代码片段
 */
export async function updateCodeSnippet(body: CodeSnippetUpdateParams, options?: { [key: string]: unknown }) {
  return request.post<CodeSnippetUpdateParams, PageResponseVO<boolean>>('/codeSnippet/update', body, options);
}

/**
 * 删除代码片段
 */
export async function deleteCodeSnippet(body: CodeSnippetDeleteParams, options?: { [key: string]: unknown }) {
  return request.post<CodeSnippetDeleteParams, PageResponseVO<boolean>>('/codeSnippet/delete', body, options);
}

/**
 * 根据ID获取代码片段
 */
export async function getCodeSnippet(id: string, options?: { [key: string]: unknown }) {
  return request.get<string, PageResponseVO<CodeSnippetVO>>(`/codeSnippet/get/${id}`, options);
}

/**
 * 获取代码片段列表
 */
export async function getCodeSnippets(params: CodeSnippetListParams, options?: { [key: string]: unknown }) {
  return request.get<CodeSnippetListParams, PageResponseVO<CodeSnippetVO[]>>('/codeSnippet/list', { params, ...options });
}

/**
 * 搜索代码片段
 */
export async function searchCodeSnippets(body: CodeSnippetSearchParams, options?: { [key: string]: unknown }) {
  return request.post<CodeSnippetSearchParams, PageResponseVO<CodeSnippetSimpleVO[]>>('/codeSnippet/search', body, options);
}

/**
 * 获取代码片段详情
 */
export async function getCodeSnippetDetail(id: string) {
  return request.get<string, PageResponseVO<CodeSnippetDetailVO>>(`/codeSnippet/detail/${id}`);
}

/**
 * 点赞代码片段
 */
export async function likeCodeSnippet(id: string) {
  return request.post<string, PageResponseVO<boolean>>('/codeSnippet/like', { id });
}

/**
 * 取消点赞代码片段
 */
export async function unlikeCodeSnippet(id: string) {
  return request.post<string, PageResponseVO<boolean>>('/codeSnippet/unlike', { id });
}

/**
 * 收藏代码片段
 */
export async function collectCodeSnippet(id: string) {
  return request.post<string, PageResponseVO<boolean>>('/codeSnippet/collect', { id });
}

/**
 * 取消收藏代码片段
 */
export async function uncollectCodeSnippet(id: string) {
  return request.post<string, PageResponseVO<boolean>>('/codeSnippet/uncollect', { id });
}

/**
 * 获取我的代码片段
 */
export async function getMyCodeSnippets(pageNum: number = 1, pageSize: number = 10) {
  return request.get<{ pageNum: number; pageSize: number }, PageResponseVO<MyCodeSnippetVO[]>>('/codeSnippet/my/list', {
    params: { pageNum, pageSize }
  });
}

/**
 * 获取代码片段统计
 */
export async function getCodeSnippetStatistics() {
  return request.get<void, PageResponseVO<CodeSnippetStatisticsVO>>('/codeSnippet/statistics');
}
