import request from "@/app/utils/request";
import { User } from "../../store/user";
import { ModelType } from "../../store/config";
import { ChatMessage, MJMessage, MjConfig, Mask } from "@/app/types/index";
import { data } from "cheerio/lib/api/attributes";

export interface CreateChatSessionData {
	user: number;
	id?: string;
	topic?: string;
	prompt_id?: number | string;
	hide?: boolean;
}

export interface CreateChatData {
	user: number;
	chat_session: string;
	role: "user" | "assistant";
	message: string | ChatMessage[];
	mjstatus?: MJMessage;
	memory?: ChatMessage[];
	token_count?: number;
	model?: string;
	round?: number;
	agent_num?: number;
	is_double_agent?: boolean;
	[property: string]: any;
}

export interface ChatSessionData {
	user: number;
	page?: number;
	limit?: number;
}

// 定义响应数据的接口
interface ResponseData {
	status?: number | string;
	data?: any; // 根据实际情况，你可能需要更具体的类型
	message?: string;
	msg?: string; // 有些API可能使用msg而不是message
}

// 定义错误响应的接口
interface ErrorResponse {
	response?: {
		data: ResponseData;
	};
}

function handleErrorMessage(message: string): never {
	const errorMap: { [key: string]: string } = {
		令牌过期: "登录已过期",
		身份认证: "请登录后再继续操作",
		"matching query does not exist": "对话数据错误, 请新建对话",
		对象不存在: "对话数据错误, 请新建对话",
	};

	// 查找对应的错误信息并抛出
	for (const key in errorMap) {
		if (message.includes(key)) {
			throw new Error(errorMap[key]);
		}
	}

	// 如果没有匹配的特定错误信息，抛出原始消息
	throw new Error(message);
}
function handleResponse(res: ResponseData): any {
	const { status, data } = res;
	const code = data.code;

	// console.log("res 1st", res, status, data, "code", code);

	// 成功响应
	if ((status === 201 || status === 200) && data.data !== null) {
		console.log("success");
		return data;
	}

	// 错误处理
	if ([4000, 401].includes(code)) {
		const message = data.message || data.msg;
		console.log("---------------");
		return handleErrorMessage(message);
	}

	// 默认未知错误
	throw new Error("未知错误");
}

function handleError(err: ErrorResponse): never {
	console.log("err", err);
	// 检查错误是否已经是一个明确的消息
	if (err instanceof Error) {
		throw new Error(err.message);
	}

	// 原有的基于响应的错误处理
	if (err.response && err.response.data) {
		// 假设 err.response.data 是一个字符串或者有 message 属性
		if (typeof err.response.data === "string") {
			throw new Error(err.response.data);
		} else if (err.response.data.message) {
			throw new Error(err.response.data.message);
		}
	}

	// 默认错误消息
	throw new Error("网络错误");
}
export async function createChatSession(data: CreateChatSessionData) {
	return request({
		url: `/gpt/chat-sessions/`,
		method: "post",
		data,
	})
		.then(handleResponse)
		.catch(handleError);
}

export async function getChatSession(data: ChatSessionData) {
	return request({
		url: `/gpt/chat-sessions/`,
		method: "get",
		params: data,
	})
		.then((res) => res.data)
		.catch((err) => {
			// console.log(err);
			return err.response.data;
		});
}

//  get single session
export async function getSingleChatSession(id: string) {
	return request({
		url: `/gpt/chat-sessions/by_session_id/${id}/`,
		method: "get",
	})
		.then(handleResponse)
		.catch(handleError);
}

// update chatSession

export interface UpdateChatSessionData {
	topic?: String | null;
	session_summary?: String;
	mask?: Mask;
	mjConfig?: MjConfig;
	hide?: boolean;
	[property: string]: any;
}

export async function updateChatSession(
	id: string,
	data: UpdateChatSessionData,
) {
	return request({
		url: `/gpt/chat-sessions/by_session_id/${id}/`,
		method: "put",
		data,
	})
		.then(handleResponse)
		.catch(handleError);
}

export interface ChatData {
	chat_session: string;
	user: number;
	[property: string]: any;
}

export async function getChat(data: ChatData) {
	return request({
		url: `/gpt/chats/`,
		method: "get",
		params: data,
	})
		.then((res) => res.data)
		.catch((err) => {
			// console.log(err);
			return err.response.data;
		});
}
export async function createChat(data: CreateChatData) {
	return request({
		url: `/gpt/chats/`,
		method: "post",
		data,
	})
		.then(handleResponse)
		.catch(handleError);
}
export async function createAgentChat(data: CreateChatData) {
	return request({
		url: `/gpt/agent-chats/`,
		method: "post",
		data,
	})
		.then((res) => res.data)
		.catch((err) => {
			// console.log(err);
			return err;
		});
}

// get prompthotness
export async function getPromptHotness() {
	return request({
		url: `/gpt/prompt-hotness/`,
		method: "get",
	})
		.then((res) => res.data)
		.catch((err) => {
			// console.log(err);
			return err.response.data;
		});
}

/**
 * Request
 */

export interface DoubleAgentData {
	user: number;
	initial_input?: string;
	iteration?: number;
	topic?: string;
	first_agent_setting?: Mask;
	second_agent_setting?: Mask;
	[property: string]: any;
}

export async function createDoubleAgentSession(data: DoubleAgentData) {
	return request({
		url: `/gpt/doubleagent-chat-sessions/`,
		method: "post",
		data,
	})
		.then((res) => res.data)
		.catch((err) => {
			return err.response.msg;
		});
}

// update double agent chatSession

export async function uploadDoubleAgentSession(
	id: string,
	data: UpdateChatSessionData,
) {
	return request({
		url: `/gpt/doubleagent-chat-sessions/by_session_id/${id}/`,
		method: "put",
		data,
	})
		.then((res) => res.data)
		.catch((err) => {
			return err.response.msg;
		});
}

// get / post / put / delete Workflow-sessions

export interface WorkflowSessionData {
	user: number;
	topic?: string;
	chat_session?: string;
	page?: number;
	limit?: number;
}

export async function getWorkflowSession(data: WorkflowSessionData) {
	return request({
		url: `/gpt/workflow-sessions/`,
		method: "get",
		params: data,
	})
		.then((res) => res.data)
		.catch((err) => {
			return err.response.msg;
		});
}

export interface CreateWorkflowSessionData {
	user: number;
	topic?: string;
	chat_session?: string;
}

export async function createWorkflowSession(data: CreateWorkflowSessionData) {
	return request({
		url: `/gpt/workflow-sessions/`,
		method: "post",
		data,
	})
		.then((res) => res.data)
		.catch((err) => {
			return err.response.msg;
		});
}

// update workflow session

export interface UpdateWorkflowSessionData {
	topic?: string;
	chat_session?: string[];
	[property: string]: any;
}

export async function updateWorkflowSession(
	id: string,
	data: UpdateWorkflowSessionData,
) {
	return request({
		url: `/gpt/workflow-sessions/${id}/`,
		method: "put",
		data,
	})
		.then((res) => res.data)
		.catch((err) => {
			return err.response.msg;
		});
}

// delete workflow session

export async function deleteWorkflowSession(id: string) {
	return request({
		url: `/gpt/workflow-sessions/${id}/`,
		method: "delete",
	})
		.then((res) => res.data)
		.catch((err) => {
			return err.response.msg;
		});
}
