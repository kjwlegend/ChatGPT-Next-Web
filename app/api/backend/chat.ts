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
	code?: number | string;
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

function handleResponse(res: ResponseData): any {
	const { code, data } = res;
	console.log("res 1st", res);
	if ((code === 201 || code === 200) && data) {
		return data; // 正常返回
	} else if (code === 4000 || code === 401) {
		const message = data.message || data.msg;
		console.log(message);
		if (message.includes("令牌过期")) {
			throw new Error("登录已过期");
		}
		if (message.includes("身份认证")) {
			throw new Error("请登录后再继续操作");
		}
		if (
			message.includes("matching query does not exist") ||
			message.includes("对象不存在")
		) {
			throw new Error("对话数据错误, 请新建对话");
		}
		throw new Error(message); // 其他4000错误
	}
	throw new Error("未知错误"); // 其他情况
}

function handleError(err: ErrorResponse): any {
	console.log("err", err);
	// 检查错误是否已经是一个明确的消息
	if (err instanceof Error) {
		return { message: err.message };
	}

	// 原有的基于响应的错误处理
	if (err.response && err.response.data) {
		return err.response.data;
	}

	// 默认错误消息
	return { message: "网络错误" };
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
		.then((res) => res.data)
		.catch((err) => {
			// console.log(err);
			return err.response.data;
		});
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
		.then((res) => res.data)
		.catch((err) => {
			// console.log(err);
			return err.response.data;
		});
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
