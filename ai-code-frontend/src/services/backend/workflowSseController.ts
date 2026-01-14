import request from '@/utils/request';

export async function executeWorkflow(
  params: API.executeWorkflowParams,
  options?: { [key: string]: any },
) {
  return request.post<any, API.WorkflowContext>('/workflow/execute', {}, { params, ...options });
}

export async function executeWorkflowWithFlux(
  params: API.executeWorkflowWithFluxParams,
  options?: { [key: string]: any },
) {
  return request.get<any, string[]>('/workflow/execute-flux', { params, ...options });
}
