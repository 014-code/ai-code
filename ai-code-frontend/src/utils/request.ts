/**
 * HTTP请求工具
 * 基于axios封装，提供请求配置和响应处理
 */
import axios from 'axios';
import { message } from 'antd';
import { API_BASE_URL } from '@/constants';

const rawMessageError = message.error.bind(message);
let suppressNextErrorMessage = false;

// 统一抑制“全局拦截器已提示后，页面 catch 再提示一次”的重复弹窗
(message as any).error = (...args: any[]) => {
  if (suppressNextErrorMessage) {
    suppressNextErrorMessage = false;
    return Promise.resolve();
  }
  return rawMessageError(...args);
};

/**
 * 创建axios实例
 */
const request = axios.create({
  baseURL: API_BASE_URL,             // API基础路径
  withCredentials: true,             // 携带凭证信息（Cookie）
  timeout: 60000,                    // 请求超时时间：60秒
});

/**
 * 响应数据结构接口
 */
interface ResponseStructure {
  success: boolean;  // 请求是否成功
  data;         // 响应数据
  code: number;      // 响应码
  message?: string;  // 响应消息
}

/**
 * 请求拦截器
 * 添加认证信息等
 */
request.interceptors.request.use(
  (config) => {
    // Sa-Token 会自动从 Cookie 中读取，无需手动添加
    // 如果需要手动添加 token，可以从 localStorage 中获取
    const token = localStorage.getItem('satoken');
    if (token) {
      config.headers['satoken'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 * 统一处理响应数据和错误
 */
request.interceptors.response.use(
  (response) => {
    const requestPath = response.config.url ?? '';
    const { data } = response as unknown as ResponseStructure;
    
    // 检查响应数据是否存在
    if (!data) {
      rawMessageError('服务异常');
      suppressNextErrorMessage = true;
      return Promise.reject(new Error('服务异常'));
    }

    const code = data.code;
    
    // 处理未登录状态
    if (
      code === 40100 &&
      !requestPath.includes('user/get/login') &&
      !requestPath.includes('user/login') &&
      !window.location.pathname.includes('/user/login')
    ) {
      window.location.href = `/user/login?redirect=${window.location.href}`;
      rawMessageError('请先登录');
      suppressNextErrorMessage = true;
      return Promise.reject(new Error('请先登录'));
    }

    // 处理错误响应
    if (code !== 0) {
      rawMessageError(data.message ?? '服务器错误');
      suppressNextErrorMessage = true;
      return Promise.reject(new Error(data.message ?? '服务器错误'));
    }
    
    return response.data;
  },
  (error) => {
    rawMessageError(error.message || '请求失败');
    suppressNextErrorMessage = true;
    return Promise.reject(error);
  }
);

export default request;
