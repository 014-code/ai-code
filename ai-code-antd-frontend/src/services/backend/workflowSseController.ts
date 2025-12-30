// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 此处后端没有提供注释 POST /workflow/execute */
export async function executeWorkflow(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.executeWorkflowParams,
  options?: { [key: string]: any },
) {
  return request<API.WorkflowContext>('/workflow/execute', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /workflow/execute-flux */
export async function executeWorkflowWithFlux(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.executeWorkflowWithFluxParams,
  options?: { [key: string]: any },
) {
  return request<string[]>('/workflow/execute-flux', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
