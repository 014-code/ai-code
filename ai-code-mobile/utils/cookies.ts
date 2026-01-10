// src/utils/token.ts
//rn本地存储库
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'ms-token';

export async function setToken(value: any) {
    try {
        const tokenValue = typeof value === 'string' ? value : JSON.stringify(value);
        await AsyncStorage.setItem(TOKEN_KEY, tokenValue);
    } catch (error) {
        console.error('保存 token 失败:', error);
    }
}

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

export async function removeToken() {
    try {
        await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
        console.error('删除 token 失败:', error);
    }
}

export async function hasToken() {
    try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        return !!token;
    } catch (error) {
        console.error('检查 token 失败:', error);
        return false;
    }
}