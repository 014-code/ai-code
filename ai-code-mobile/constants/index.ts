import { Platform } from 'react-native'

/**
 * 静态资源基础URL
 * 根据运行平台自动选择合适的服务器地址
 * Android模拟器使用 10.0.2.2 访问主机localhost
 * iOS模拟器和真机使用 localhost
 */
export const STATIC_BASE_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:8080' 
  : 'http://localhost:8080'
