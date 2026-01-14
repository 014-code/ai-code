/**
 * HTTP请求工具
 * 基于axios封装，提供请求配置和响应处理
 */
import axios from 'axios';
import { message } from 'antd';

// 开发环境判断
const isDev = import.meta.env.MODE === 'development';

/**
 * 创建axios实例
 */
const request = axios.create({
  baseURL: isDev ? '/api' : '/api',  // API基础路径
  withCredentials: true,             // 携带凭证信息
  timeout: 60000,                    // 请求超时时间：60秒
});

/**
 * 响应数据结构接口
 */
interface ResponseStructure {
  success: boolean;  // 请求是否成功
  data: any;         // 响应数据
  code: number;      // 响应码
  message?: string;  // 响应消息
}

/**
 * 请求拦截器
 * 可用于添加认证信息等
 */
request.interceptors.request.use(
  (config) => {
    // 这里可以添加token等认证信息
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
      message.error('服务异常');
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
      message.error('请先登录');
      return Promise.reject(new Error('请先登录'));
    }

    // 处理错误响应
    if (code !== 0) {
      message.error(data.message ?? '服务器错误');
      return Promise.reject(new Error(data.message ?? '服务器错误'));
    }
    
    return response.data;
  },
  (error) => {
    message.error(error.message || '请求失败');
    return Promise.reject(error);
  }
);

export default request;
