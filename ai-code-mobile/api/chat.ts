import request from "../utils/request";
import { ChatHistoryAddParams } from "./params/chatParams";

/**
 * 保存用户消息
 * 将用户发送的消息保存到聊天历史记录中
 * 
 * @param data - 聊天历史添加参数，包含应用ID、消息类型、消息内容和错误信息
 * @returns 返回保存用户消息的请求结果
 */
export function saveUserMessage(data: ChatHistoryAddParams) {
	return request({
		url: '/api/chat/history/save/user',
		method: "POST",
		data
	})
}

/**
 * 保存AI消息
 * 将AI回复的消息保存到聊天历史记录中
 * 
 * @param data - 聊天历史添加参数，包含应用ID、消息类型、消息内容和错误信息
 * @returns 返回保存AI消息的请求结果
 */
export function saveAIMessage(data: ChatHistoryAddParams) {
	return request({
		url: '/api/chat/history/save/ai',
		method: "POST",
		data,
	})
}

/**
 * 获取某应用最新历史对话信息
 * 查询指定应用的最新聊天历史记录
 * 
 * @param appId - 应用ID
 * @returns 返回最新聊天历史记录列表
 */
export function listLatestChatHistory(appId: string) {
	return request({
		url: '/api/chat/history/list/latest/vo',
		method: "GET",
		params: { appId },
	})
}

/**
 * 获取应用详情
 * 查询指定应用的详细信息
 * 
 * @param id - 应用ID
 * @returns 返回应用详情信息
 */
export function getAppVOById(id: string) {
	return request({
		url: '/api/app/get/vo',
		method: "GET",
		params: { id }
	})
}
