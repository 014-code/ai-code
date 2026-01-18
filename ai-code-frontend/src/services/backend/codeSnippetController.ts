import request from '@/utils/request';

export async function addCodeSnippet(body: API.CodeSnippet, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseLong>('/codeSnippet/add', body, options);
}

export async function updateCodeSnippet(body: API.CodeSnippet, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseBoolean>('/codeSnippet/update', body, options);
}

export async function deleteCodeSnippet(body: API.DeleteRequest, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseBoolean>('/codeSnippet/delete', body, options);
}

export async function getCodeSnippet(id: string, options?: { [key: string]: any }) {
  return request.get<any, API.BaseResponseCodeSnippet>(`/codeSnippet/get/${id}`, options);
}

export async function getCodeSnippets(params: {
  snippetType?: string;
  category?: string;
  tags?: string;
}, options?: { [key: string]: any }) {
  return request.get<any, API.BaseResponseListCodeSnippet>('/codeSnippet/list', { params, ...options });
}

export async function searchCodeSnippets(body: {
  snippetType?: string;
  snippetCategory?: string;
  snippetDesc?: string;
  usageScenario?: string;
  tags?: string;
  limit?: number;
}, options?: { [key: string]: any }) {
  return request.post<any, API.BaseResponseListCodeSnippet>('/codeSnippet/search', body, options);
}
