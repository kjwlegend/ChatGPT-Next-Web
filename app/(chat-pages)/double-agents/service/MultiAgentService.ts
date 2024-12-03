import { useUserStore } from "@/app/store";
import { api } from "@/app/client/api";
import { ChatControllerPool } from "@/app/client/controller";
import { prettyObject } from "@/app/utils/format";
import { ModelConfig } from "@/app/store";

import { useMultipleAgentStore } from "@/app/store/multiagents/index";
import { createMultiAgentChatMessage } from "@/app/store/multiagents/utils";
import { ConversationChatTemplate } from "@/app/chains/multiagents";
import { getMessageTextContent } from "@/app/utils";
import { sendChatMessage } from "@/app/services/chatService";
import { AttachImages } from "../../chats/chat/inputpanel/components/AttachImages";
import { AttachFiles } from "../../chats/chat/inputpanel/components/AttachFiles";
import { estimateTokenLength } from "@/app/utils/chat/token";

export async function sendNextAgentMessage(
	conversationId: string,
	messageContent: string,
	attachImages: string[] = [],
) {
	// console.log(
	// 	"sendNextAgentMessage",
	// 	conversationId,
	// 	messageContent,
	// 	attachImages,
	// );
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
		await MultiAgentStore.prepareBotMessage(conversationId);

	const modelConfig = selectedAgent.modelConfig;
	const historyMessages = MultiAgentStore.getHistory(conversationId);
	const chatmode = session.conversation_mode;
	let concatMessage = [];

	// 处理消息内容，包括文本和图片
	let mContent: any[] = [{ type: "text", text: messageContent }];
	if (attachImages && attachImages.length > 0) {
		mContent = mContent.concat(
			attachImages.map((url) => ({
				type: "image_url",
				image_url: { url },
			})),
		);
	}

	const userDirection = session.userAdditionInput;

	const historySummary =
		(await MultiAgentStore.summarizeSession(conversationId)) ?? "";

	const template = ConversationChatTemplate(
		selectedAgent,
		session.aiConfigs, // 假设这里存储了所有的agent配置
		session.topic,
		historySummary,
		historyMessages,
		userDirection,
		chatmode,
	);

	concatMessage = [template];

	const userMessage = createMultiAgentChatMessage({
		role: "user",
		content: mContent,
	});
	concatMessage.push(userMessage);

	await sendChatMessage(session.id, selectedAgent, concatMessage, {
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
			const Messagetoken = estimateTokenLength(message);
			const summaryToken = estimateTokenLength(
				MultiAgentStore.getHistory(conversationId).join("\n"),
			);
			botMessage.token_counts_total = Messagetoken + summaryToken;
			await MultiAgentStore.finalizeBotMessage(conversationId, botMessage);
			// 结束后继续发送
			sendNextAgentMessage(conversationId, message);
			// console.log("sendNextAgentMessage", conversationId, message);
		},
		onError: (error: Error) => {
			const messageTemplate = createMultiAgentChatMessage({
				role: "assistant",
				content: "",
				streaming: true,
			});

			const isAborted = error.message.includes("aborted");
			messageTemplate.content +=
				"\n\n" +
				prettyObject({
					error: true,
					message: error.message,
				});
			messageTemplate.streaming = false;

			MultiAgentStore.addMessage(conversationId, messageTemplate);
			ChatControllerPool.remove(session.id, messageTemplate.id);
			console.error("[Chat] failed ", error);
		},
		onController: (controller: AbortController) => {
			ChatControllerPool.addController(session.id, botMessage.id, controller);
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
