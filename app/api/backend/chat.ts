import request from "@/app/utils/request";
import { User } from "../../store/user";
import { ModelType } from "../../store/config";
import { ChatMessage, MJMessage, MjConfig } from "../../store/chat";
import { Mask } from "@/app/store/mask";
import { data } from "cheerio/lib/api/attributes";

export interface CreateChatSessionData {
	user: number;
	topic?: string;
	prompt_id?: string;
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

export async function createChatSession(data: CreateChatSessionData) {
	return request({
		url: `/gpt/chat-sessions/`,
		method: "post",
		data,
	})
		.then((res) => res.data)
		.catch((err) => {
			// console.log(err);
			return err.response.data;
		});
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
		.then((res) => res.data)
		.catch((err) => {
			// console.log(err);
			return err;
		});
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
