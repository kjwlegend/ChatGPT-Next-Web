import {
	ChatSession,
	ChatMessage,
	DEFAULT_TOPIC,
	ChatToolMessage,
} from "../store";
import { useChatStore } from "../store";
import { MJMessage } from "../store";
import { useUserStore } from "../store";
import { RequestMessage, api } from "../client/api";
import { SUMMARIZE_MODEL } from "../constant";
import { createMessage } from "../store";

import { useAppConfig } from "../store";
import { usePluginStore } from "../store/plugin";
import { ChatControllerPool } from "../client/controller";

import { prettyObject } from "../utils/format";

import { ModelConfig } from "../store";
import { CreateChatData, createChat } from "../api/backend/chat";
import doubleAgent, {
	createDoubleAgentChatMessage,
} from "../store/doubleAgents";

import {
	DoubleAgentChatSession,
	DoubleAgentChatMessage,
} from "../store/doubleAgents";
import { create } from "domain";
import { send } from "process";

import {
	InitialConversationChatTemplate,
	ConversationChatTemplate,
} from "../chains/doubleagents";

// 假设我们有一个函数来启动对话
export function startConversation(
	conversationId: string,
	initialInput: string,
) {
	// 创建新会话

	const doubleAgentStore = doubleAgent.getState();

	const round =
		doubleAgentStore.conversations.find((m) => m.id === conversationId)
			?.round ?? 1;
	const userMessage: DoubleAgentChatMessage = createDoubleAgentChatMessage({
		role: "user",
		content: initialInput,
	});
	doubleAgentStore.updateMessages(conversationId, userMessage);

	sendFirstAIMessage(round, conversationId, initialInput);
	// return conversationId;
}

// 发送消息给firstAI
function sendFirstAIMessage(
	round: number,
	conversationId: string,
	messageContent: string,
) {
	const doubleAgentStore = doubleAgent.getState();
	const session = doubleAgentStore.conversations.find(
		(m) => m.id === conversationId,
	);
	if (!session || round >= session.totalRounds) {
		return null;
	}
	// 获取firstAI的配置

	const botMessage: DoubleAgentChatMessage = createDoubleAgentChatMessage({
		role: "assistant",
		content: "思考中...",
	});

	doubleAgentStore.updateMessages(conversationId, botMessage);

	const firstAIConfig = session.firstAIConfig;
	const role = "assistant";
	const modelConfig = firstAIConfig.modelConfig;
	const agentSetting = firstAIConfig.context.map((m) => m.content).join("\n");

	// 获取historymessage
	const historyMessages = doubleAgentStore.getHistory(conversationId);
	const reversedHistoryMessages = [...historyMessages].reverse();
	let historyMessagesContent = "";
	reversedHistoryMessages.forEach((m) => {
		historyMessagesContent += m.role + ":" + m.content + "\n";
	});
	let historysummary = "";

	let concatMessage = [];

	if (round > 1) {
		//
		const template = ConversationChatTemplate(
			agentSetting,
			session.topic,
			historysummary,
			historyMessagesContent,
		);
		concatMessage = [template];
	} else {
		const template = InitialConversationChatTemplate(
			agentSetting,
			session.topic,
		);
		const userMessage = createDoubleAgentChatMessage({
			role: "user",
			content: messageContent,
		});
		concatMessage = [template, userMessage];
	}

	// 创建消息对象

	// 调用发送函数
	sendChatMessage(
		modelConfig,
		concatMessage,
		handleChatCallbacks(role, conversationId),
	);
}

// 发送消息给secondAI
function sendSecondAIMessage(
	round: number,
	conversationId: string,
	messageContent: string,
) {
	const doubleAgentStore = doubleAgent.getState();
	const session = doubleAgentStore.conversations.find(
		(m) => m.id === conversationId,
	);
	if (!session || round >= session.totalRounds) {
		return null;
	}
	// 获取secondAI的配置
	const userMessage: DoubleAgentChatMessage = createDoubleAgentChatMessage({
		role: "user",
		content: "思考中...",
	});

	doubleAgentStore.updateMessages(conversationId, userMessage);

	const secondAIConfig = session.secondAIConfig;
	const role = "user";
	const modelConfig = secondAIConfig.modelConfig;
	const agentSetting = secondAIConfig.context.map((m) => m.content).join("\n");

	// 获取historymessage
	const historyMessages = doubleAgentStore.getHistory(conversationId);
	const reversedHistoryMessages = [...historyMessages].reverse();
	let historyMessagesContent = "";
	reversedHistoryMessages.forEach((m) => {
		historyMessagesContent += m.role + ":" + m.content + "\n";
	});
	let historysummary = "";
	let concatMessage = [];

	if (round > 1) {
		//
		const template = ConversationChatTemplate(
			agentSetting,
			session.topic,
			historysummary,
			historyMessagesContent,
		);
		concatMessage = [template];
	} else {
		const template = InitialConversationChatTemplate(
			agentSetting,
			session.topic,
		);
		const userMessage = createDoubleAgentChatMessage({
			role: "user",
			content: messageContent,
		});
		concatMessage = [template, userMessage];
	}

	// 创建消息对象

	// 调用发送函数
	sendChatMessage(
		modelConfig,
		concatMessage,
		handleChatCallbacks(role, conversationId),
	);
}

// 先定义一个处理回调的函数，以便重用
export function handleChatCallbacks(
	role: "system" | "assistant" | "user",
	conversationId: string,
) {
	const config = useAppConfig.getState();
	const pluginConfig = config.pluginConfig;
	const allPlugins = usePluginStore.getState().getAll();
	const doubleAgentStore = doubleAgent.getState();
	const session = doubleAgentStore.conversations.find(
		(m) => m.id === conversationId,
	);
	const messageIndex = session?.messages.length
		? session?.messages.length - 1
		: 0;

	const toolsMessage: ChatToolMessage[] =
		session?.messages[messageIndex].toolMessages || [];

	console.log("session", session);
	console.log("messageIndex", messageIndex);
	const user = useUserStore.getState().user;
	const messageTemplate = createDoubleAgentChatMessage({
		role: role,
		content: "",
		streaming: true,
	});

	return {
		onUpdate: (message: string) => {
			messageTemplate.streaming = true;
			if (message) {
				// console.log(message);
				messageTemplate.content = message;
				doubleAgentStore.updateSingleMessage(
					conversationId,
					messageIndex,
					message,
				);
			}
		},
		onToolUpdate(toolName: string, toolInput: string) {
			messageTemplate.streaming = true;
			//  根据toolName获取对应的 toolName, 并输出对应的 name
			const tool = allPlugins.find((m) => m.toolName === toolName);
			const name = tool?.name;
			// console.log("toolName: ", toolName, "tool: ", tool?.name);
			if (name && toolInput) {
				toolsMessage.push({
					toolName: name,
					toolInput,
				});

				doubleAgentStore.updateSingleMessage(
					conversationId,
					messageIndex,
					messageTemplate.content,
					toolsMessage,
				);
			}
		},
		onFinish: (message: string) => {
			messageTemplate.streaming = true;
			if (message) {
				messageTemplate.content = message;
				console.log("message111 finish: ", message);

				// doubleAgentStore.updateMessages(conversationId, messageTemplate);
				// update round
				const round = doubleAgentStore.updateRound(conversationId).round;
				console.log("round", round);
				doubleAgentStore.updateSingleMessage(
					conversationId,
					messageIndex,
					message,
				);
				// 如果是assistant的回复，则将回复传递给下一个AI
				if (role === "assistant") {
					sendSecondAIMessage(round, conversationId, message);
				} else {
					// 如果是user的回复，则将回复传递给firstAI
					sendFirstAIMessage(round, conversationId, message);
				}
			}
			ChatControllerPool.remove(session.id, messageTemplate.id);
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

			doubleAgentStore.updateMessages(conversationId, messageTemplate);
			ChatControllerPool.remove(session.id, messageTemplate.id ?? messageIndex);
			console.error("[Chat] failed ", error);
		},
		onController: (controller: AbortController) => {
			ChatControllerPool.addController(
				session.id,
				messageTemplate.id ?? messageIndex,
				controller,
			);
		},
	};
}

// 然后创建一个统一的发送消息函数
export function sendChatMessage(
	modelConfig: ModelConfig,
	sendMessages: DoubleAgentChatMessage[],
	callbacks: {
		onUpdate?: (message: string) => void;
		onFinish: (message: string) => void;
		onError?: (error: Error) => void;
		onController?: (controller: AbortController) => void;
		onToolUpdate?: (toolName: string, toolInput: string) => void;
	},
	stream?: boolean,
) {
	const config = useAppConfig.getState();
	const pluginConfig = config.pluginConfig;
	const allPlugins = usePluginStore.getState().getAll();

	const chatOptions = {
		messages: sendMessages,
		config: { ...modelConfig, stream: stream ?? true },
		...callbacks,
	};

	// console.log("chatoptions", chatOptions);

	// 根据是否启用插件使用不同的API
	const useToolAgent = pluginConfig.enable && allPlugins.length > 0;
	// const useToolAgent = false;
	if (useToolAgent) {
		console.log("[ToolAgent] start");
		const pluginToolNames = [
			"web-search",
			"dalle_image_generator",
			"arxiv",
			"doc_search",
			"calculator",
		];
		api.llm.toolAgentChat({
			messages: sendMessages,
			config: { ...modelConfig, stream: stream ?? true },
			agentConfig: {
				...pluginConfig,
				useTools: pluginToolNames,
			},
			...callbacks,
		});
	} else {
		api.llm.chat(chatOptions);
	}
}
