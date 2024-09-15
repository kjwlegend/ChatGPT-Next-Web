import { DEFAULT_TOPIC } from "@/app/store";
import {
	MultiAgentChatMessage,
	MultiAgentChatSession,
} from "@/app/store/multiagents";
import { useChatStore, useUserStore, useAppConfig } from "@/app/store";
import { api } from "@/app/client/api";
import { ChatControllerPool } from "@/app/client/controller";
import { prettyObject } from "@/app/utils/format";
import { ModelConfig } from "@/app/store";

import {
	useMultipleAgentStore,
	createMultiAgentChatMessage,
} from "@/app/store/multiagents";
import {
	ConversationChatTemplate,
	InitialConversationChatTemplate,
} from "@/app/chains/multiagents";
import { getMessageTextContent } from "@/app/utils";
import { sendChatMessage } from "@/app/services/chatService";
import { AttachImages } from "../chats/chat/inputpanel/components/AttachImages";
import { AttachFiles } from "../chats/chat/inputpanel/components/AttachFiles";

export async function startConversation(
	conversationId: string,
	initialInput: string,
) {
	const MultiAgentStore = useMultipleAgentStore.getState();
	const userId = useUserStore.getState().user.id;
	const conversation = MultiAgentStore.conversations.find(
		(m) => m.id === conversationId,
	);

	if (!conversation) return;

	const userMessage = {
		content: initialInput,
		AttachImages: [],
		AttachFiles: [],
	};

	await MultiAgentStore.onUserInput(
		userMessage.content,
		userMessage.AttachImages,
		userMessage.AttachFiles,
		conversation,
	);

	sendNextAgentMessage(conversationId, initialInput);
}

export async function sendNextAgentMessage(
	conversationId: string,
	messageContent: string,
) {
	console.log("sendNextAgentMessage", conversationId, messageContent);
	const MultiAgentStore = useMultipleAgentStore.getState();
	const session = MultiAgentStore.conversations.find(
		(m) => m.id === conversationId,
	);
	const round = session?.round || 0;
	const userId = useUserStore.getState().user.id;

	if (!session || round >= session.totalRounds || session.paused || !userId) {
		return null;
	}

	const { botMessage, selectedAgent, nextAgentIndex } =
		MultiAgentStore.prepareBotMessage(conversationId);

	const modelConfig = selectedAgent.modelConfig;
	const historyMessages = MultiAgentStore.getHistory(conversationId);
	let concatMessage = [];

	if (round > 1) {
		const historySummary =
			await MultiAgentStore.summarizeSession(conversationId);
		const template = ConversationChatTemplate(
			selectedAgent,
			selectedAgent,
			session.topic,
			historySummary,
			historyMessages.map((m) => `${m.role}: ${m.content}`).join("\n"),
		);
		concatMessage = [template];
	} else {
		const template = InitialConversationChatTemplate(
			selectedAgent,
			selectedAgent,
			session.topic,
		);
		const userMessage = createMultiAgentChatMessage({
			role: "user",
			content: messageContent,
		});
		concatMessage = [template, userMessage];
	}

	const messageTemplate = createMultiAgentChatMessage({
		role: "assistant",
		content: "",
		streaming: true,
	});

	let callBackMessage = "";
	await sendChatMessage(selectedAgent, concatMessage, {
		onUpdate: (message: string) => {
			botMessage.content = message;
			MultiAgentStore.updateBotMessage(conversationId, botMessage);
		},
		onToolUpdate: (toolName: string, toolInput: string) => {
			const toolsMessage = [];
			if (toolName && toolInput) {
				toolsMessage.push({
					toolName: toolName,
					toolInput,
				});
				MultiAgentStore.updateBotMessage(conversationId, botMessage);
			}
		},
		onFinish: async (message: string) => {
			botMessage.content = message;
			await MultiAgentStore.finalizeBotMessage(conversationId, botMessage);
		},

		onError: (error: Error) => {
			const isAborted = error.message.includes("aborted");
			messageTemplate.content +=
				"\n\n" +
				prettyObject({
					error: true,
					message: error.message,
				});
			messageTemplate.streaming = false;

			MultiAgentStore.updateMessages(conversationId, messageTemplate);
			ChatControllerPool.remove(session.id, messageTemplate.id);
			console.error("[Chat] failed ", error);
		},
		onController: (controller: AbortController) => {
			ChatControllerPool.addController(
				session.id,
				messageTemplate.id,
				controller,
			);
		},
	});
}

export function continueConversation(conversationId: string, round: number) {
	const MultiAgentStore = useMultipleAgentStore.getState();
	const session = MultiAgentStore.conversations.find(
		(m) => m.id === conversationId,
	);

	if (!session || round >= session.totalRounds) {
		return null;
	}

	const messages = session.messages;
	const lastMessage = messages[messages.length - 1];
	const messageContent = getMessageTextContent(lastMessage);

	sendNextAgentMessage(conversationId, messageContent);
}

export function decideNextAgent(conversationId: string): number {
	const MultiAgentStore = useMultipleAgentStore.getState();
	const conversation = MultiAgentStore.conversations.find(
		(conv) => conv.id === conversationId,
	);

	if (!conversation) throw new Error("Conversation not found");

	const strategy = conversation.next_agent_type;

	const totalAgents = conversation.aiConfigs.length;
	switch (strategy) {
		case "round-robin":
			return conversation.round % totalAgents;
		case "random":
			return Math.floor(Math.random() * totalAgents);
		case "intelligent":
			// 实现智能选择逻辑
			return 0;
		default:
			throw new Error("Unknown strategy");
	}
}
