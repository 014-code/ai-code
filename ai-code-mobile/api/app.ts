import request from "../utils/request";
import { AppAddParams, AppDeployParams, AppQueryParams, ChatToGenCodeParams } from "./params/appParams";
import { DeleteParams } from "./params/commonParams";

/**
 * 创建应用
 * 
 * @param data - 应用创建参数，包含应用名称、描述、图标、封面、初始提示词和代码生成类型
 * @returns 返回创建应用的请求结果
 */
export function addApp(data: AppAddParams) {
	return request({
		url: '/api/app/add',
		method: "POST",
		data,
	})
}

/**
 * 与AI对话生成应用
 * 通过与AI对话的方式生成应用代码
 * 
 * @param data - 对话生成代码参数，包含应用ID和消息内容
 * @returns 返回生成代码的请求结果
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
 * 获取当前用户创建的应用列表，支持分页和排序
 * 
 * @param data - 查询参数，包含分页信息、排序字段、应用名称、描述等筛选条件
 * @returns 返回我的应用列表
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
 * 获取平台精选的应用列表，支持分页和排序
 * 
 * @param data - 查询参数，包含分页信息、排序字段、应用名称、描述等筛选条件
 * @returns 返回精选应用列表
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
 * 将应用部署到服务器，使其可以在线访问
 * 
 * @param data - 部署参数，包含应用ID
 * @returns 返回部署请求结果
 */
export function deployApp(data: AppDeployParams) {
	return request({
		url: `/api/app/deploy`,
		method: "POST",
	})
}

/**
 * 下载应用代码
 * 下载指定应用的源代码压缩包
 * 
 * @param appId - 应用ID
 * @returns 返回下载应用代码的请求结果
 */
export function downloadAppCode(appId: number) {
	return request({
		url: `/api/app/download/${appId}`,
		method: "GET",
	})
}

/**
 * 查询应用详情
 * 获取指定应用的详细信息
 * 
 * @param id - 应用ID
 * @returns 返回应用详情信息
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
 * 删除指定的应用
 * 
 * @param data - 删除参数，包含应用ID
 * @returns 返回删除请求结果
 */
export function deleteApp(data: DeleteParams) {
	return request({
		url: `/api/app/delete/user`,
		method: "POST",
	})
}

/**
 * 查询所有预设提示词
 * 获取平台提供的所有预设提示词，用于帮助用户快速开始对话
 * 
 * @returns 返回预设提示词列表
 */
export function listAllPresetPrompts() {
	return request({
		url: '/api/app/preset-prompts',
		method: 'GET',
	})
}
