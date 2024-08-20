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
	agent?: number | string;
	session_topic?: string;

	//以下为可选属性
	id?: number | string;
	active?: boolean;
	custom_agent_data?: { [key: string]: any } | null;
	relative_docs?: { [key: string]: any } | null;
	session_description?: null | string;
	session_id?: string;
	session_summary?: null | string;
	token_counts_total?: number;
	created_at?: Date | string | undefined;
	updated_at?: Date | string | undefined;
	[property: string]: any;
}

export interface CreateChatData {
	user: string | number;
	object_id: string; // session_id
	chat_role: string;
	content: string | ChatMessage[];
	token_counts_total?: number;
	chat_model?: string;
	chat_images?: string[];
	function_calls?: string[];
	content_type: string;
	sender_id?: string;
	sender_name?: string;
	[property: string]: any;
}

export interface PaginationData {
	page?: number;
	limit?: number;
}
const appnamespace = AppMapping.llm;
export const createChatSession = api(appnamespace, "/user/chatsessions/");
export const getChatSession = apiGet(appnamespace, "/user/chatsessions/");
export const getChatSessionChats = apiGet(
	appnamespace,
	"/user/chatsessions/{:id}/chats",
);
export const updateChatSession = apiPut(
	appnamespace,
	"/user/chatsessions/:id/",
);

export const getChat = apiGet(appnamespace, "/user/chats/");
export const createChat = api(appnamespace, "/user/chats/");

export const createMultipleAgentSession = api(
	appnamespace,
	"/user/multiagentchatsessions/",
);
export const updateMultiAgentSession = apiPut(
	appnamespace,
	"/user/multiagentchatsessions/:id/",
);
export const getMultiAgentSession = apiGet(
	appnamespace,
	"/user/multiagentchatsessions/",
);
export const getMultiAgentSessionChats = apiGet(
	appnamespace,
	"/user/multiagentchatsessions/:id/chats",
);

export const getWorkflowSession = apiGet(
	appnamespace,
	"/user/workflowsessions/",
);
export const createWorkflowSession = api(
	appnamespace,
	"/user/workflowsessions/",
);
export const updateWorkflowSession = apiPut(
	appnamespace,
	"/user/workflowsessions/:id/",
);
export const deleteWorkflowSession = apiPut(
	appnamespace,
	"/user/workflowsessions/:id/",
);
export const getWorkflowSessionChatGroups = apiGet(
	appnamespace,
	"/user/workflowsessions/:id/get-chatgroup/",
);

// get chatgroup chats
export const getWorkflowSessionChats = apiGet(
	appnamespace,
	"/user/workflowsessions/:id/get-chatgroup-chats/",
);
// create workflowsession chatgroup
export const createWorkflowSessionChatGroup = api(
	appnamespace,
	"/user/workflowsessions/:id/create-chatgroup/",
);
// delete workflowsession chatgroup
export const deleteWorkflowSessionChatGroup = api(
	appnamespace,
	"/user/workflowsessions/:id/delete-chatgroup/",
);

export const updateWorkflowSessionChatGroupOrder = api(
	appnamespace,
	"/user/workflowsessions/:id/update-chatgroup-order/",
);

export const getPromptHotness = apiGet(appnamespace, "/prompthotness/");
