import request from "@/app/utils/request";
import { User } from "../../store/user";
import { ModelType } from "../../store/config";
import { ChatMessage } from "../../store/chat";

export interface CreateChatSessionData {
	user: number;
	session_topic?: string;
	prompt_id?: string;
	hide?: boolean;
}

export interface CreateChatData {
	user: number;
	chat_session: string;
	role: "user" | "assistant";
	message: string | ChatMessage[];
	memory?: ChatMessage[];
	token_count?: number;
	model?: string;
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

export interface ChatData {
	chat_session: string;
	user: string;
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
