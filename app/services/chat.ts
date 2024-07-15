import { AppMapping, api, apiGet } from "./api";
import { ChatMessage, MJMessage, MjConfig, Mask } from "@/app/types/index";

// 定义接口
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

export interface UpdateChatSessionData {
	topic?: String | null;
	session_summary?: String;
	mask?: Mask;
	mjConfig?: MjConfig;
	hide?: boolean;
	[property: string]: any;
}

export interface ChatData {
	chat_session: string;
	user: number;
	[property: string]: any;
}

export interface DoubleAgentData {
	user: number;
	initial_input?: string;
	iteration?: number;
	topic?: string;
	first_agent_setting?: Mask;
	second_agent_setting?: Mask;
	[property: string]: any;
}

export interface WorkflowSessionData {
	user: number;
	topic?: string;
	chat_session?: string;
	page?: number;
	limit?: number;
}

export interface CreateWorkflowSessionData {
	user: number;
	topic?: string;
	chat_session?: string;
}

export interface UpdateWorkflowSessionData {
	topic?: string;
	chat_session?: string[];
	[property: string]: any;
}

const appnamespace = AppMapping.llm;

export const getChat = apiGet(appnamespace, "/user/chats/");
export const createChat = api(appnamespace, "/user/chats/");

export const createChatSession = api(appnamespace, "/chatsessions/");
export const updateChatSession = api(appnamespace, "/chatsessions/:id/");
export const getChatSession = apiGet(appnamespace, "/chatsessions/");

export const getChatSessionChats = apiGet(
	appnamespace,
	"/chatsessions/:id/chats/",
);

export const createMultiAgentSession = api(
	appnamespace,
	"/multiagentchatsessions/",
);
export const getMultiAgentSessionChats = apiGet(
	appnamespace,
	"/multiagentchatsessions/:id/chats/",
);
export const updateMultiAgentSession = api(
	appnamespace,
	"/multiagentchatsessions/:id/",
);

export const createWorkflowSession = api(appnamespace, "/workflowsessions/");
export const getWorkflowSession = apiGet(appnamespace, "/workflowsessions/");
export const updateWorkflowSession = api(
	appnamespace,
	"/workflowsessions/:id/",
);
export const getWorkflowSessionGroups = apiGet(
	appnamespace,
	"/workflowsessions/:id/chatgroups/",
);
export const getWorkflowSessionChats = apiGet(
	appnamespace,
	"/workflowsessions/:id/chats/",
);
