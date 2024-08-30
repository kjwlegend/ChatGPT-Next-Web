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
};
