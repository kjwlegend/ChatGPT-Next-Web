import { nanoid } from "nanoid";
import { ChatSession, ChatMessage } from "../../types/chat";
import { useAppConfig } from "../config";
import { Mask } from "../../types/mask";
import { createEmptyMask } from "../mask/utils";

export const createEmptySession = (props?: {
	id?: string;
	mask?: Mask;
}): ChatSession => ({
	id: props?.id ?? nanoid(),
	session_id: "",
	topic: "未命名话题",
	messages: [],
	modelConfig: { ...useAppConfig.getState().modelConfig },
	lastUpdateTime: Date.now(),
	createdAt: Date.now(),
	mask: props?.mask ?? createEmptyMask(),
	memoryPrompt: "",
	lastSummarizeIndex: 0,
	stat: {
		tokenCount: 0,
	},
	isworkflow: false,
	mjConfig: {
		size: "",
		quality: "",
		stylize: "",
		model: "",
	},
	isDoubleAgent: false,
});

export function createMessage(override: Partial<ChatMessage>): ChatMessage {
	const messageId = nanoid();
	return {
		id: messageId,
		nanoid: messageId,
		date: new Date().toLocaleString(),
		role: "user",
		content: "",
		toolMessages: [],
		image_url: [],
		...override,
	};
}

const MAX_ACTIVE_SESSIONS = 5; // 最大保留的活跃会话数

export function manageActiveSessions(
	activeSessionIds: string[],
	sessions: Record<string, ChatSession>,
	currentSessionId: string,
): { activeSessionIds: string[]; sessions: Record<string, ChatSession> } {
	// 创建新的活跃会话列表
	const newActiveSessionIds = [
		currentSessionId,
		...activeSessionIds.filter((id) => id !== currentSessionId),
	].slice(0, MAX_ACTIVE_SESSIONS);

	// 清理非活跃会话的消息
	const updatedSessions = { ...sessions };
	Object.keys(updatedSessions).forEach((sessionId) => {
		if (!newActiveSessionIds.includes(sessionId)) {
			updatedSessions[sessionId] = {
				...updatedSessions[sessionId],
				messages: [], // 清空非活跃会话的消息
			};
		}
	});

	return {
		activeSessionIds: newActiveSessionIds,
		sessions: updatedSessions,
	};
}
