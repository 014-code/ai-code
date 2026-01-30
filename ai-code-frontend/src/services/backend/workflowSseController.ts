import request from '@/utils/request';

export interface ExecuteWorkflowParams {
  appId: number;
  message: string;
  conversationId?: string;
}

export interface ExecuteWorkflowWithFluxParams {
  appId: number;
  message: string;
  conversationId?: string;
}

/**
 * 执行工作流
 */
export async function executeWorkflow(
  params: ExecuteWorkflowParams,
  options?: { [key: string]: unknown },
) {
  return request.post<ExecuteWorkflowParams, unknown>('/workflow/execute', {}, { params, ...options });
}

/**
 * 执行工作流（SSE流式）
 */
export async function executeWorkflowWithFlux(
  params: ExecuteWorkflowWithFluxParams,
  options?: { [key: string]: unknown },
) {
  return request.get<ExecuteWorkflowWithFluxParams, string[]>('/workflow/execute-flux', { params, ...options });
}

/**
 * 取消工作流执行
 */
export async function cancelWorkflowExecution(conversationId: string) {
  return request.post<string, boolean>('/workflow/cancel', { conversationId });
}

/**
 * 获取工作流状态
 */
export async function getWorkflowStatus(conversationId: string) {
  return request.get<string, {
    status: string;
    progress: number;
    currentStep?: string;
  }>('/workflow/status', { params: { conversationId } });
}
