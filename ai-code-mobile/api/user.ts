import request from "../utils/request";
import { UserLoginParams, UserRegisterParams } from "./params/userParams";

/**
 * 用户登录
 * 通过账号密码进行用户登录验证
 * 
 * @param data - 登录参数，包含用户账号和密码
 * @returns 返回登录结果，包含用户信息和token
 */
export function login(data: UserLoginParams) {
	return request({
		url: '/api/user/login',
		method: "POST",
		data,
		isToken: false
	})
}

/**
 * 获取当前用户信息
 * 获取当前登录用户的详细信息
 * 
 * @returns 返回当前用户信息
 */
export function getUserInfo() {
	return request({
		url: '/api/user/get/login',
		method: "GET",
	})
}

/**
 * 退出登录
 * 清除当前用户的登录状态
 * 
 * @returns 返回退出登录结果
 */
export function userLogout() {
	return request({
		url: '/api/user/logout',
		method: "POST",
	})
}

/**
 * 用户注册
 * 创建新用户账号
 * 
 * @param data - 注册参数，包含用户账号、密码和确认密码
 * @returns 返回注册结果
 */
export function register(data: UserRegisterParams) {
	return request({
		url: '/api/user/register',
		method: "POST",
		data,
		isToken: false
	})
}
