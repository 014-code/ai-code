import request from "../utils/request";
import { ChatHistoryAddParams } from "./params/chatParams";

/**
 * 保存用户消息
 */
export function saveUserMessage(data: ChatHistoryAddParams) {
	return request({
		url: '/api/chat/history/save/user',
		method: "POST",
		data
	})
}

/**
 * 保存ai消息
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
 */
export function getAppVOById(id: string) {
	return request({
		url: '/api/app/get/vo',
		method: "GET",
		params: { id }
	})
}