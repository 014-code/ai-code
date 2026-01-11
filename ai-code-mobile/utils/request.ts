/**
 * HTTP请求工具
 * 
 * 提供统一的HTTP请求接口，支持请求拦截、响应拦截、错误处理和登录态管理
 * 使用fetch API进行网络请求，自动处理token认证和登录失效场景
 */

import { ActionSheetIOS, Alert, Platform } from 'react-native';
import {
	getToken,
	hasToken,
	removeToken
} from "./cookies";
import { push } from './navigationManager';

/**
 * API基础URL
 * 
 * 根据运行平台自动选择对应的基础URL：
 * - Android模拟器：使用10.0.2.2访问宿主机localhost
 * - iOS模拟器/真机：使用localhost直接访问
 */
const BASE_URL = Platform.OS === 'android' 
  ? "http://10.0.2.2:8123" 
  : "http://localhost:8123";

/**
 * HTTP请求主函数
 * 
 * 统一的请求入口，处理所有HTTP请求的发送和响应
 * 支持GET、POST、PUT、PATCH等方法，自动处理token认证和登录态失效
 * 
 * @param options - 请求配置对象
 * @param options.url - 请求的相对路径
 * @param options.method - HTTP请求方法，默认为GET
 * @param options.data - POST/PUT/PATCH请求的请求体数据
 * @param options.params - GET请求的查询参数
 * @param options.header - 自定义请求头
 * @param options.isToken - 是否需要token认证，默认为true
 * @returns Promise<any> - 返回Promise对象，成功时解析为响应数据，失败时拒绝为错误信息
 */
export default async function (options: any = {}) {
	let {
		url = "", method = "GET", data = {}, params = {}, header = {}, isToken = true
	} = options;

	// 请求拦截：自动添加token到请求头
	if (isToken) {
		const token = await getToken();
		header = {
			...header,
			Authorization: token || ''
		};
	}

	// 设置默认请求头，指定内容类型为JSON
	const defaultHeaders = {
		'Content-Type': 'application/json',
		...header
	};

	// 构建fetch请求配置对象
	const requestConfig: any = {
		method,
		headers: defaultHeaders,
	};

	// 处理 GET 请求的查询参数
	if (method.toUpperCase() === 'GET') {
		const queryData = params || data;
		if (queryData) {
			const queryParams = new URLSearchParams();
			Object.keys(queryData).forEach(key => {
				if (queryData[key] !== null && queryData[key] !== undefined) {
					queryParams.append(key, String(queryData[key]));
				}
			});
			const queryString = queryParams.toString();
			if (queryString) {
				url += (url.includes('?') ? '&' : '?') + queryString;
			}
			console.log('GET 请求 URL:', BASE_URL + url);
			console.log('GET 请求参数:', queryData);
		}
	}

	// 处理 POST、PUT、PATCH 请求的请求体数据
	if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && data) {
		console.log('POST 请求数据:', data);
		requestConfig.body = JSON.stringify(data);
	}

	// 发起HTTP请求并返回Promise
	return new Promise((resolve, reject) => {
		fetch(BASE_URL + url, requestConfig)
			.then(response => {
				console.log('接口返回状态:', response.status);
				return response.json();
			})
			.then(result => {
				console.log('接口返回', result);
				// 响应拦截：处理成功响应
				if (result.code === 0) {
					resolve(result);
				} else if (result.code === 40300 || result.code === 40101 || result.code === 40100) {
					// 处理登录失效：token过期或无效
					loginInterception();
					reject(result);
				} else {
					// 处理其他业务错误
					reject(result);
				}
			})
			.catch(err => {
				console.error('请求失败:', err);
				reject(err);
			});
	});
}

/**
 * 登录拦截处理函数
 * 
 * 当检测到登录态失效时，清除本地token并提示用户重新登录
 * 根据不同平台显示不同的提示对话框：
 * - iOS：使用ActionSheetIOS显示操作面板
 * - Android：使用Alert显示确认对话框
 * 
 * @async
 * @returns Promise<void>
 */
async function loginInterception() {
	// 清除本地存储的token
	await removeToken();

	// 检查是否还有有效的token，避免重复提示
	const hasValidToken = await hasToken();
	if (!hasValidToken) {
		if (Platform.OS === 'ios') {
			// iOS平台使用ActionSheetIOS显示操作面板
			ActionSheetIOS.showActionSheetWithOptions(
				{
					options: ['取消', '确定'],
					title: '操作',
					message: `你的登录态已失效，是否重新登录？`,
				},
				async (buttonIndex) => {
					if (buttonIndex === 1) {
						// 用户点击确定，跳转到登录页面
						push('/user/login');
					}
				}
			);
		} else {
			// Android平台使用Alert显示确认对话框
			Alert.alert(
				'操作',
				`你的登录态已失效，是否重新登录？`,
				[
					{ text: '取消', style: 'cancel' },
					{
						text: '确定',
						style: 'destructive',
						onPress: async () => {
							// 用户点击确定，跳转到登录页面
							push('/user/login');
						},
					},
				]
			);
		}
	}
}