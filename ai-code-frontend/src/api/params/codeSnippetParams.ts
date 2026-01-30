/**
 * 代码片段添加参数
 */
export type CodeSnippetAddParams = {
  snippetName: string;
  snippetType: string;
  snippetCategory: string;
  snippetDesc?: string;
  snippetCode: string;
  usageScenario?: string;
  tags?: string;
  priority?: number;
};

/**
 * 代码片段更新参数
 */
export type CodeSnippetUpdateParams = {
  id: string;
  snippetName?: string;
  snippetType?: string;
  snippetCategory?: string;
  snippetDesc?: string;
  snippetCode?: string;
  usageScenario?: string;
  tags?: string;
  isActive?: number;
  priority?: number;
};

/**
 * 代码片段查询参数
 */
export type CodeSnippetQueryParams = {
  pageNum: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: string;
  id?: string;
  snippetName?: string;
  snippetType?: string;
  snippetCategory?: string;
  searchKey?: string;
  isActive?: number;
};

/**
 * 获取代码片段参数
 */
export type GetCodeSnippetParams = {
  id: number;
};

/**
 * 删除代码片段参数
 */
export type DeleteCodeSnippetParams = {
  id: number;
};

/**
 * 代码片段搜索参数
 */
export type CodeSnippetSearchParams = {
  keyword: string;
  snippetType?: string;
  limit?: number;
};
