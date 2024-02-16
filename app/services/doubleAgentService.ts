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
import {
	CreateChatData,
	DoubleAgentData,
	createAgentChat,
	createChat,
	uploadDoubleAgentSession,
} from "../api/backend/chat";
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
import useAuth from "../hooks/useAuth";
import { useAuthStore } from "../store/auth";
import { Mask } from "../store/mask";
import { first } from "cheerio/lib/api/traversing";

// 假设我们有一个函数来启动对话

export function startConversation(
	conversationId: string,
	initialInput: string,
) {
	// 创建新会话

	const doubleAgentStore = doubleAgent.getState();
	const userid = useUserStore.getState().user.id;
	const conversation = doubleAgentStore.conversations.find(
		(m) => m.id === conversationId,
	);
	const first_agent_setting = conversation?.firstAIConfig;
	const second_agent_setting = conversation?.secondAIConfig;
	const topic = conversation?.topic ?? DEFAULT_TOPIC;
	const totalRounds = conversation?.totalRounds ?? 1;
	const round = conversation?.round ?? 1;
	const userMessage: DoubleAgentChatMessage = createDoubleAgentChatMessage({
		role: "user",
		content: initialInput,
	});
	doubleAgentStore.updateMessages(conversationId, userMessage);

	const chatSession: DoubleAgentData = {
		session_id: conversationId,
		user: userid,
		initial_input: initialInput,
		totoal_rounds: totalRounds,
		topic: topic,
		first_agent_setting: first_agent_setting,
		second_agent_setting: second_agent_setting,
	};

	uploadDoubleAgentSession(conversationId, chatSession);

	sendFirstAIMessage(round, conversationId, initialInput);
	// return conversationId;
}

// 发送消息给firstAI
async function sendFirstAIMessage(
	round: number,
	conversationId: string,
	messageContent: string,
) {
	const doubleAgentStore = doubleAgent.getState();
	const session = doubleAgentStore.conversations.find(
		(m) => m.id === conversationId,
	);
	const userid = useUserStore.getState().user.id;

	if (!session || round >= session.totalRounds || session.paused || !userid) {
		// console.log("session", session, "round", round, "userid", userid);
		return null;
	}
	// 获取firstAI的配置

	const botMessage: DoubleAgentChatMessage = createDoubleAgentChatMessage({
		role: "assistant",
		content: "思考中...",
		agentNum: 1,
	});

	doubleAgentStore.updateMessages(conversationId, botMessage);

	const firstAIConfig = session.firstAIConfig;
	const secondAIConfig = session.secondAIConfig;
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
		historysummary = await doubleAgentStore.summarizeSession(conversationId);
		const template = ConversationChatTemplate(
			firstAIConfig,
			secondAIConfig,
			session.topic,
			historysummary,
			historyMessagesContent,
		);
		concatMessage = [template];
	} else {
		const template = InitialConversationChatTemplate(
			firstAIConfig,
			secondAIConfig,
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
		firstAIConfig,
		modelConfig,
		concatMessage,
		handleChatCallbacks(role, session, conversationId, 1),
	);
}

// 发送消息给secondAI
async function sendSecondAIMessage(
	round: number,
	conversationId: string,
	messageContent: string,
) {
	const doubleAgentStore = doubleAgent.getState();
	const session = doubleAgentStore.conversations.find(
		(m) => m.id === conversationId,
	);
	const userid = useUserStore.getState().user.id;

	if (!session || round >= session.totalRounds || session.paused || !userid) {
		return null;
	}
	// 获取secondAI的配置
	const userMessage: DoubleAgentChatMessage = createDoubleAgentChatMessage({
		role: "user",
		content: "思考中...",
		agentNum: 2,
	});

	doubleAgentStore.updateMessages(conversationId, userMessage);

	const secondAIConfig = session.secondAIConfig;
	const firstAIConfig = session.firstAIConfig;
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
		historysummary = await doubleAgentStore.summarizeSession(conversationId);
		const template = ConversationChatTemplate(
			secondAIConfig,
			firstAIConfig,
			session.topic,
			historysummary,
			historyMessagesContent,
		);
		concatMessage = [template];
	} else {
		const template = InitialConversationChatTemplate(
			secondAIConfig,
			firstAIConfig,
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
		secondAIConfig,
		modelConfig,
		concatMessage,
		handleChatCallbacks(role, session, conversationId, 2),
	);
}
// continue conversation function

export function continueConversation(conversationId: string, round: number) {
	const doubleAgentStore = doubleAgent.getState();
	const session = doubleAgentStore.conversations.find(
		(m) => m.id === conversationId,
	);
	if (!session || round >= session.totalRounds) {
		return null;
	}
	const messages = session?.messages;

	// check the last message 's agentNum
	const lastMessage = messages[messages.length - 1];
	const lastAgentNum = lastMessage.agentNum;

	const messageContent = lastMessage.content;
	// 如果是第一个AI的回复，则将回复传递给下一个AI

	// 使用 switch 语句根据代理编号发送消息
	switch (lastAgentNum) {
		case 1:
			// 如果是第一个AI的回复，则将回复传递给下一个AI
			sendSecondAIMessage(round, conversationId, messageContent);
			break;
		case 2:
			// 如果是第二个AI的回复，则直接发送给AI 1
			sendFirstAIMessage(round, conversationId, messageContent);
			break;
		default:
			// 如果 agentNum 不是 1 或 2，这里可以添加额外的逻辑或者抛出错误
			console.error("Invalid agentNum:", lastAgentNum);
			sendFirstAIMessage(round, conversationId, messageContent);

			// 可以选择抛出错误或者执行其他默认行为
			break;
	}
}

// 先定义一个处理回调的函数，以便重用
export function handleChatCallbacks(
	role: "system" | "assistant" | "user",
	_session: DoubleAgentChatSession,
	conversationId: string,
	agentNum: number,
) {
	const config = useAppConfig.getState();
	const pluginConfig = config.pluginConfig;
	const allPlugins = usePluginStore.getState().getAll();
	const doubleAgentStore = doubleAgent.getState();
	const session =
		doubleAgentStore.conversations.find((m) => m.id === conversationId) ??
		_session;
	const messageIndex = session?.messages.length
		? session?.messages.length - 1
		: 0;
	const toolsMessage: ChatToolMessage[] =
		session?.messages[messageIndex].toolMessages || [];

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
				// console.log("message111 finish: ", message);

				// doubleAgentStore.updateMessages(conversationId, messageTemplate);
				// update round
				const round = doubleAgentStore.updateRound(conversationId).round;
				// console.log("round", round);
				doubleAgentStore.updateSingleMessage(
					conversationId,
					messageIndex,
					message,
				);
				// 如果是assistant的回复，则将回复传递给下一个AI
				if (role === "assistant") {
					sendSecondAIMessage(round, conversationId, message);
					createAgentChats(conversationId, message, agentNum);
				} else {
					// 如果是user的回复，则将回复传递给firstAI
					sendFirstAIMessage(round, conversationId, message);
					createAgentChats(conversationId, message, agentNum);
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
function sendChatMessage(
	aiConfig: Mask,
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
	const allPlugins = aiConfig.plugins ?? [];

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
		const pluginToolNames = allPlugins;

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

// update createChats function
export async function createAgentChats(
	sessionId: string,
	content: string,
	agentNum: number,
) {
	const userStore = useUserStore.getState();
	const doubleAgentStore = doubleAgent.getState();
	const session = doubleAgentStore.conversations.find(
		(m) => m.id === sessionId,
	);
	const AuthStore = useAuthStore.getState();

	if (!session) {
		return null;
	}

	let model = "";
	let role: "user" | "assistant" = "user";
	let agentSetting;
	if (agentNum === 1) {
		model = session.firstAIConfig.modelConfig.model;
		role = "assistant";
		agentSetting = session.firstAIConfig.context
			.map((m) => m.content)
			.join("\n");
	} else if (agentNum === 2) {
		model = session.secondAIConfig.modelConfig.model;
		role = "user";
		agentSetting = session.secondAIConfig.context
			.map((m) => m.content)
			.join("\n");
	} else {
		model = session.firstAIConfig.modelConfig.model;
	}

	const historyMessages = doubleAgentStore.getHistory(sessionId);

	const createChatData: CreateChatData = {
		user: userStore.user.id, // 替换为实际的用户 ID
		chat_session: sessionId, // 替换为实际的聊天会话 ID
		message: content, // 使用用户输入作为 message 参数
		role: role,
		model: model,
		memory: historyMessages,
		round: session.round,
		agent_num: agentNum,
		is_double_agent: true,
	};

	// console.log("createChatData", createChatData);

	const chatResponse = await createAgentChat(createChatData); // 替换为实际的API调用\
	// console.log("chatResponse", chatResponse);
	// if chatResponse code return 4000 or 401 , throw error
	if (chatResponse.code === 4000 || chatResponse.code === 401) {
		const response = {
			code: chatResponse.code,
			message: chatResponse.msg,
		};

		const error = createDoubleAgentChatMessage({
			role: "assistant",
			content: "登录已过期，请重新登录",
		});

		doubleAgentStore.updateMessages(sessionId, error);
		AuthStore.logout();
		userStore.clearUser();

		throw response;
	}
}
