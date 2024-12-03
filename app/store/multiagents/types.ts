import { Mask } from "@/app/types/mask";
import { ChatMessage } from "@/app/types/chat";
import { ChatToolMessage } from "@/app/types/chat";
import { FileInfo } from "../../client/platforms/utils";

export interface MultimodalContent {
	type: "text" | "image_url";
	text?: string;
	image_url?: {
		url: string;
	};
}

export interface MultiAgentChatMessage extends ChatMessage {
	agentId: number | string | null;
	agentName: string;
	content: string | MultimodalContent[];
}

export interface MultiAgentChatSession {
	id: string;
	aiConfigs: Mask[];
	topic: string;
	userAdditionInput?: string;
	messages: MultiAgentChatMessage[];
	lastUpdateTime: number;
	updated_at: string;
	created_at: string;
	memory?: any;
	totalRounds: number;
	round: number;
	paused?: boolean;
	next_agent_type: "round-robin" | "random" | "intelligent";
	conversation_mode: "chat" | "task";
	selectedTags?: string[];
}

export interface MultiAgentState {
	currentConversationId: string;
	conversations: MultiAgentChatSession[];
	tagsData?: string[];
}

export interface MultiAgentActions {
	startConversation: (
		topic: string,
		conversationId: string,

		initialInput: string,
	) => void;
	setCurrentConversationId: (id: string) => void;
	addAgent: (conversationId: string, config: Mask) => void;
	setAIConfig: (conversationId: string, agentId: number, config: Mask) => void;
	clearAIConfig: (conversationId: string, agentId: number) => void;
	clearConversation: (conversationId: string) => void;
	addMessage: (conversationId: string, message: MultiAgentChatMessage) => void;
	updateTags: (conversationId: string, tags: string[]) => void;
	setTagsData: (tags: string[]) => void;
	fetchNewConversations: (data: any) => void;
	fetchNewMessages: (conversationId: string, messages: any) => void;
	updateSingleMessage: (
		conversationId: string,
		messageId: string,
		newMessageContent: ChatMessage,
		toolsMessage?: ChatToolMessage[],
		newMessageId?: string,
	) => void;
	updateMultiAgentsChatsession: (
		conversationId: string,
		updates: Partial<MultiAgentChatSession>,
	) => void;
	putMultiAgentSessionData: (conversationId: string) => Promise<void>;
	updateConversation: (
		conversationId: string,
		conversation: MultiAgentChatSession,
	) => void;
	deleteConversation: (conversationId: string | number) => void;
	updateRound: (conversationId: string) => { round: number };
	summarizeSession: (conversationId: string) => Promise<any>;
	handleUserInput: (
		content: string,
		attachImages: string[],
		attachFiles: FileInfo[] | undefined,
		session: MultiAgentChatSession,
	) => Promise<{
		userMessage: MultiAgentChatMessage;
		recentMessages: MultiAgentChatMessage[];
	}>;
	onUserInput: (
		content: string,
		attachImages: string[],
		attachFiles: FileInfo[] | undefined,
		session: MultiAgentChatSession,
	) => Promise<void>;
	prepareBotMessage: (conversationId: string) => Promise<{
		botMessage: MultiAgentChatMessage;
		selectedAgent: Mask;
		nextAgentIndex: number;
	}>;
	updateBotMessage: (
		sessionId: string,
		message: MultiAgentChatMessage,
		newMessageId?: string,
	) => void;
	finalizeBotMessage: (
		sessionId: string,
		message: MultiAgentChatMessage,
	) => Promise<MultiAgentChatMessage>;
	decideNextAgent: (conversationId: string) => Promise<number>;
}

export interface MultiAgentSelectors {
	currentSession: () => MultiAgentChatSession;
	getCurrentMessages: () => MultiAgentChatMessage[];
	sortedConversations: () => MultiAgentChatSession[];
	getHistory: (conversationId: string) => MultiAgentChatMessage[];
	getSessionTags: (conversationId: string) => string[];
	getTagsData: () => string[];
}

export type MultiAgentStore = MultiAgentState &
	MultiAgentActions &
	MultiAgentSelectors;
