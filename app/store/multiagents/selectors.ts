import {
	MultiAgentState,
	MultiAgentChatSession,
	MultiAgentSelectors,
	MultiAgentChatMessage,
} from "./types";
import { estimateTokenLength } from "../../utils/chat/token";
import { getMessageTextContent } from "../../utils";

export const createMultiAgentSelectors = (
	get: () => MultiAgentState,
): MultiAgentSelectors => ({
	currentSession: () => {
		const { currentConversationId, conversations } = get();
		return (
			conversations.find((session) => session.id === currentConversationId) ||
			({} as MultiAgentChatSession)
		);
	},

	getCurrentMessages: () => {
		const { currentConversationId, conversations } = get();
		const session = conversations.find(
			(session) => session.id === currentConversationId,
		);
		return session?.messages || [];
	},

	sortedConversations: () => {
		const { conversations } = get();
		return [...conversations].sort(
			(a, b) => b.lastUpdateTime - a.lastUpdateTime,
		);
	},

	getHistory: (conversationId: string): MultiAgentChatMessage[] => {
		const MAX_TOKEN_COUNT = 3000;
		const conversation = get().conversations.find(
			(m) => m.id === conversationId,
		);

		if (!conversation) return [];

		// 获取历史消息
		const messages = conversation.messages.slice();
		const maxMessageCount = messages.length;

		// 根据token数量限制历史消息
		let tokenCount = 0;
		const historyMessages: MultiAgentChatMessage[] = [];

		for (let i = maxMessageCount - 1; i >= 0; i--) {
			const message = messages[i];
			const messageTokenCount = estimateTokenLength(
				getMessageTextContent(message),
			);

			if (tokenCount + messageTokenCount > MAX_TOKEN_COUNT) {
				break;
			}

			tokenCount += messageTokenCount;
			historyMessages.unshift(message);
		}

		return historyMessages;
	},

	// 获取会话的标签
	getSessionTags: (conversationId: string): string[] => {
		const conversation = get().conversations.find(
			(m) => m.id === conversationId,
		);
		return conversation?.selectedTags || [];
	},

	// 获取所有可用标签
	getTagsData: (): string[] => {
		return get().tagsData || [];
	},
});
