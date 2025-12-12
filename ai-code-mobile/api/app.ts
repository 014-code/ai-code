import request from "../utils/request";
import { AppAddParams, AppDeployParams, AppQueryParams, ChatToGenCodeParams } from "./params/appParams";
import { DeleteParams } from "./params/commonParams";

/**
 * 创建应用
 */
export function addApp(data: AppAddParams) {
	return request({
		url: '/api/app/add',
		method: "POST",
		data,
	})
}

/**
 * 与ai对话生成应用
 */
export function chatToGenCode(data: ChatToGenCodeParams) {
	return request({
		url: '/api/app/chat/gen/code',
		method: "POST",
		data,
	})
}

/**
 * 查询我的应用
 */
export function myAppList(data: AppQueryParams) {
	return request({
		url: '/api/app/my/list/page/vo',
		method: "POST",
		data,
	})
}

/**
 * 查询精选应用
 */
export function featuredList(data: AppQueryParams) {
	return request({
		url: '/api/app/featured/list/page/vo',
		method: "POST",
		data,
	})
}

/**
 * 部署应用
 */
export function deployApp(data: AppDeployParams) {
	return request({
		url: `/api/app/deploy`,
		method: "POST",
	})
}

/**
 * 下载应用代码
 */
export function downloadAppCode(appId: number) {
	return request({
		url: `/api/app/download/${appId}`,
		method: "GET",
	})
}

/**
 * 查询应用详情
 */
export function getAppVOById(id: number) {
	return request({
		url: `/api/app/get/vo`,
		method: "GET",
		params: { id }
	})
}

/**
 * 删除应用
 */
export function deleteApp(data: DeleteParams) {
	return request({
		url: `/api/app/delete/user`,
		method: "POST",
	})
}