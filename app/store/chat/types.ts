import { ChatMessage, ChatSession } from "../../types/chat";
import { Mask } from "../../types/mask";
import { UserStore } from "../user";
import { FileInfo } from "@/app/client/platforms/utils";

export interface ChatState {
	sessions: Record<string, ChatSession>;
	currentSessionId: string | null;
	total: number;
}

export interface ChatActions {
	create: (mask?: Mask, userStore?: UserStore) => Promise<ChatSession>;
	updateState: (state: Partial<ChatState>) => void;
	add: (session: ChatSession) => Record<string, ChatSession>;
	updateSession: (
		id: string,
		updater: (session: ChatSession) => void,
		sync?: boolean,
	) => void;
	deleteSession: (id: string) => Promise<void>;
	onUserInput: (
		content: string,
		attachImages?: string[],
		attachFiles?: FileInfo[],
		_session?: ChatSession,
	) => Promise<void>;
	updateMessage: (
		sessionId: string,
		messageId: string,
		updater: (message: ChatMessage) => void,
	) => void;
	addMessageToSession: (sessionId: string, message: ChatMessage) => void;
	resetSession: (sessionId: string) => void;
	onNewMessage: (message: ChatMessage) => Promise<void>;
	getMessagesWithMemory: (session?: ChatSession) => ChatMessage[];
	clearSessions: () => void;
	sortSessions: () => void;
	markUpdate: () => void;
}

export interface ChatSelectors {
	selectSessions: () => Record<string, ChatSession>;
	selectSessionById: (id: string) => ChatSession | undefined;
	selectAllSessions: () => ChatSession[];
	selectCurrentSession: () => ChatSession;
	selectSessionByIndex: (index: number) => ChatSession | undefined;
	selectCurrentSessionIndex: () => number;
	selectSessionMessages: (sessionId: string) => ChatMessage[];
	selectSessionCount: () => number;
	selectMessageCount: (sessionId: string) => number;
	selectSortedSessions: () => ChatSession[];
	selectActiveSessions: () => ChatSession[];
	selectWorkflowSessions: () => ChatSession[];
}

export type ChatStore = ChatState & ChatActions & ChatSelectors;
