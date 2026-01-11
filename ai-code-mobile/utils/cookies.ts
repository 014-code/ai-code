/**
 * Token管理工具
 * 
 * 提供用户认证token的存储、获取、删除和检查功能
 * 使用AsyncStorage进行本地持久化存储，支持字符串和对象类型的token
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Token存储键名
 * 用于在AsyncStorage中存储和获取token的固定键名
 */
const TOKEN_KEY = 'ms-token';

/**
 * 保存token到本地存储
 * 
 * @param value - 要保存的token值，可以是字符串或对象类型
 * @returns Promise<void> - 保存操作完成
 */
export async function setToken(value: any) {
    try {
        const tokenValue = typeof value === 'string' ? value : JSON.stringify(value);
        await AsyncStorage.setItem(TOKEN_KEY, tokenValue);
    } catch (error) {
        console.error('保存 token 失败:', error);
    }
}

/**
 * 从本地存储获取token
 * 
 * @returns Promise<any> - 返回token值，如果不存在则返回null
 * 支持返回字符串或解析后的对象类型
 */
export async function getToken() {
    try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (!token) return null;
        try {
            return JSON.parse(token);
        } catch {
            return token;
        }
    } catch (error) {
        console.error('获取 token 失败:', error);
        return null;
    }
}

/**
 * 从本地存储删除token
 * 
 * @returns Promise<void> - 删除操作完成
 */
export async function removeToken() {
    try {
        await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
        console.error('删除 token 失败:', error);
    }
}

/**
 * 检查本地是否存在token
 * 
 * @returns Promise<boolean> - 返回true表示存在token，false表示不存在
 */
export async function hasToken() {
    try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        return !!token;
    } catch (error) {
        console.error('检查 token 失败:', error);
        return false;
    }
}