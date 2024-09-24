import { MultiAgentChatSession } from "../store/multiagents";
import { ChatSession } from "./chat";
import { workflowChatSession } from "./workflow";
// create a type that called sessionconfig exclue messages from (workflowChatSession | ChatSession )
export type sessionConfig =
	| ChatSession
	| workflowChatSession
	| MultiAgentChatSession;
