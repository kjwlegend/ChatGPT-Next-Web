import { ChatSession } from "./chat";

export interface WorkflowGroup {
	id: string;
	topic: string;
	description: string;
	summary: string;
	agent_numbers: number;
	chat_session_ids: string[];
	updated_at: string;
	created_at: string;
	lastUpdateTime: number | string | Date;

	[key: string]: any;
}
export type workflowChatSession = ChatSession & {
	workflow_group_id: string;
	order: number;
	enableAutoFlow?: boolean;
};



interface MultipleAgent {
	multiple_agent_id: string;
	multiple_agent_name: string;
	image?: string;
	language?: string;
	description?: string;
	active: boolean;
	multiple_agent_type: string;
	agents: string[];
	agents_num: number;
	agents_data?: any;
	use_count: number;
	tags?: string[];
	creator?: string;
	created_at: string;
	updated_at: string;
}
