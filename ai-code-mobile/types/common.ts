/**
 * 通用API响应数据类型
 * 
 * 用于统一后端API返回的数据结构，所有API响应都遵循此格式
 * 
 * @template T - 实际返回的数据类型，可以是任意类型
 */
export type ResData<T> = {
    code?: number;
    data?: T;
    msg?: string;
}