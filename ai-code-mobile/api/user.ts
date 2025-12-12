import request from "../utils/request";
import { UserLoginParams, UserRegisterParams } from "./params/userParams";

/**
 * 登录
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
 */
export function getUserInfo() {
	return request({
		url: '/api/user/get/login',
		method: "GET",
	})
}

/**
 * 退出登录
 */
export function userLogout() {
	return request({
		url: '/api/user/logout',
		method: "POST",
	})
}

/**
 * 注册
 */
export function register(data: UserRegisterParams) {
	return request({
		url: '/api/user/register',
		method: "POST",
		data,
		isToken: false
	})
}