import { ActionSheetIOS, Alert, Platform } from 'react-native';
import {
	getToken,
	hasToken,
	removeToken
} from "./cookies";
import { push } from './navigationManager';

const BASE_URL = Platform.OS === 'android' 
  ? "http://10.0.2.2:8123" 
  : "http://localhost:8123"

export default async function (options: any = {}) {
	let {
		url = "", method = "GET", data = {}, params = {}, header = {}, isToken = true
	} = options

	// 请求拦截
	if (isToken) {
		const token = await getToken();
		header = {
			...header,
			Authorization: token || ''
		}
	}

	// 设置默认请求头
	const defaultHeaders = {
		'Content-Type': 'application/json',
		...header
	}

	// 构建请求配置
	const requestConfig: any = {
		method,
		headers: defaultHeaders,
	}

	// 处理 GET 请求的查询参数
	if (method.toUpperCase() === 'GET') {
		const queryData = params || data
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

	// 如果是 POST、PUT、PATCH 请求且有数据，添加到 body
	if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && data) {
		console.log('POST 请求数据:', data);
		requestConfig.body = JSON.stringify(data);
	}

	return new Promise((resolve, reject) => {
		fetch(BASE_URL + url, requestConfig)
			.then(response => {
				console.log('接口返回状态:', response.status);
				return response.json();
			})
			.then(result => {
				console.log('接口返回', result);
				if (result.code === 0) {
					resolve(result);
				} else if (result.code === 40300 || result.code === 40101 || result.code === 40100) {
					// 处理登录失效
					loginInterception();
					reject(result);
				} else {
					reject(result);
				}
			})
			.catch(err => {
				console.error('请求失败:', err);
				reject(err);
			});
	})
}

/**
 * 自定义登录拦截
 */
async function loginInterception() {
	// 清除本地存储的token
	await removeToken();

	// 检查是否有token
	const hasValidToken = await hasToken();
	if (!hasValidToken) {
		if (Platform.OS === 'ios') {
			ActionSheetIOS.showActionSheetWithOptions(
				{
					options: ['取消', '确定'],
					title: '操作',
					message: `你的登录态已失效，是否重新登录？`,
				},
				async (buttonIndex) => {
					if (buttonIndex === 1) {
						push('/user/login');
					}
				}
			);
		} else {
			// Android 使用 Alert
			Alert.alert(
				'操作',
				`你的登录态已失效，是否重新登录？`,
				[
					{ text: '取消', style: 'cancel' },
					{
						text: '确定',
						style: 'destructive',
						onPress: async () => {
							push('/user/login');
						},
					},
				]
			);
		}
	}
}