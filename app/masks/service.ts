import request from "@/app/utils/request";
import { ChatMessage, roleSettingType } from "@/app/types/";
import { ModelConfig } from "../store";
import { Lang } from "../locales";
// get prompt category url : /api/gpt/get-prompt-categories/

interface pageParams {
	page: number;
	limit: number;
}

interface Prompt {
	id: string;
	prompt_id?: number;
	name: string;
	category: string;
	author?: string;
	prompt_type?: string;
	topic?: string;
	avatar: string;
	featureMask?: boolean;
	constellation?: string;
	img?: string;
	description?: string;
	intro?: string;
	hideContext?: boolean;
	version?: string;
	context: ChatMessage[];
	modelConfig: ModelConfig;
	lang: Lang;
	builtin: boolean;
	syncGlobalConfig?: boolean;
	usePlugins?: boolean;
	plugins?: string[];
	hotness?: number;
	createdAt: number;
	roleSetting?: roleSettingType;
	[key: string]: any;
}

export async function getPromptCategory() {
	return request({
		url: `/gpt/get-prompt-categories/`,
		method: "get",
	})
		.then((res) => res.data)
		.catch((err) => {
			// console.log(err);
			return err.response.data;
		});
}

export async function getPrompt(data: pageParams) {
	return request({
		url: "/gpt/prompts-public/",
		method: "get",
		params: data,
	})
		.then((res) => res.data)
		.catch((err) => {
			return err.message;
		});
}

export async function createPrompt(data: Prompt) {
	return request({
		url: "/gpt/prompts-public/",
		method: "post",
		data,
	})
		.then((res) => res.data)
		.catch((err) => {
			return err.message;
		});
}
export async function updatePrompt(id:string, data: Prompt) {
	return request({
		url: `/gpt/prompts-public/${id}/`,
		method: "put",
		data,
	})
		.then((res) => res.data)
		.catch((err) => {
			return err.message;
		});
}
export async function deletePrompt(id: string) {
	return request({
		url: `/gpt/prompts-public/${id}/`,
		method: "delete",
	})
		.then((res) => res.data)
		.catch((err) => {
			return err.message;
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
