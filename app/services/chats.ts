import { api, apiGet } from "./api";

import { ChatMessage, MJMessage, MjConfig, Mask } from "@/app/types/index";
import { AppMapping } from "./api";
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
export const updateChatSession = api(appnamespace, "/chatsessions/:id/");
export const getChat = apiGet(appnamespace, "/chats/");
export const createChat = api(appnamespace, "/chats/");

export const createMultipleAgentSession = api(
	appnamespace,
	"/multiagentchatsessions/",
);
export const updateMultiAgentSession = api(
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
export const updateWorkflowSession = api(appnamespace, "/workflowsessions/");
export const deleteWorkflowSession = api(appnamespace, "/workflowsessions/");
export const getWorkflowSessionChatGroups = apiGet(
	appnamespace,
	"/workflowsessions/:id/chatgroups",
);

export const getPromptHotness = apiGet(appnamespace, "/prompthotness/");
