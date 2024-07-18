import { api, apiGet, apiPut } from "./api";

import { ChatMessage, MJMessage, MjConfig, Mask } from "@/app/types/index";
import { AppMapping } from "./api";

/**
 * Request
 *
 * ChatSession
 */
export interface CreateChatSessionData {
	user: number;
	agent: number | string;
	session_topic: string;

	//以下为可选属性
	id?: number;
	active?: boolean;
	created_at?: Date;
	custom_agent_data?: { [key: string]: any } | null;
	relative_docs?: { [key: string]: any } | null;
	session_description?: null | string;
	session_id?: string;
	session_summary?: null | string;
	token_counts_total?: number;
	updated_at?: Date;
	[property: string]: any;
}

export interface CreateChatData {
	user: string | number;
	object_id: string; // session_id
	chat_role: "user" | "assistant";
	content: string | ChatMessage[];
	token_counts_total?: number;
	chat_model?: string;
	chat_images?: string[];
	function_calls?: string[];
	sender_name?: string;
	[property: string]: any;
}

export interface PaginationData {
	page?: number;
	limit?: number;
}
const appnamespace = AppMapping.llm;
export const createChatSession = api(appnamespace, "/chatsessions/");
export const getChatSession = apiGet(appnamespace, "/chatsessions/");
export const getChatSessionChats = apiGet(
	appnamespace,
	"/chatsessions/{:id}/chats",
);
export const updateChatSession = apiPut(appnamespace, "/chatsessions/:id/");

export const getChat = apiGet(appnamespace, "/user/chats/");
export const createChat = api(appnamespace, "/user/chats/");

export const createMultipleAgentSession = api(
	appnamespace,
	"/multiagentchatsessions/",
);
export const updateMultiAgentSession = apiPut(
	appnamespace,
	"/multiagentchatsessions/:id/",
);
export const getMultiAgentSession = apiGet(
	appnamespace,
	"/multiagentchatsessions/",
);
export const getMultiAgentSessionChats = apiGet(
	appnamespace,
	"/multiagentchatsessions/:id/chats",
);

export const getWorkflowSession = apiGet(appnamespace, "/workflowsessions/");
export const createWorkflowSession = api(appnamespace, "/workflowsessions/");
export const updateWorkflowSession = apiPut(appnamespace, "/workflowsessions/");
export const deleteWorkflowSession = api(appnamespace, "/workflowsessions/");
export const getWorkflowSessionChatGroups = apiGet(
	appnamespace,
	"/workflowsessions/:id/chatgroups",
);

export const getPromptHotness = apiGet(appnamespace, "/prompthotness/");
