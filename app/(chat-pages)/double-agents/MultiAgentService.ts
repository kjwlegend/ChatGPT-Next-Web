import { DEFAULT_TOPIC } from "@/app/store";
import {
	MultiAgentChatMessage,
	MultiAgentChatSession,
} from "@/app/store/multiagents";
import {
	useChatStore,
	useUserStore,
	useAppConfig,
	usePluginStore,
	useAuthStore,
} from "@/app/store";
import { api } from "@/app/client/api";
import { ChatControllerPool } from "@/app/client/controller";
import { prettyObject } from "@/app/utils/format";
import { ModelConfig } from "@/app/store";
import {
	CreateChatData,
	createAgentChat,
	uploadMultiAgentSession,
} from "@/app/api/backend/chat";
import multipleAgentStore, {
	createMultiAgentChatMessage,
} from "@/app/store/multiagents";
import {
	ConversationChatTemplate,
	InitialConversationChatTemplate,
} from "@/app/chains/multiagents";
import { getMessageTextContent } from "@/app/utils";

export function startConversation(
	conversationId: string,
	initialInput: string,
) {
	const MultiAgentStore = multipleAgentStore.getState();
	const userId = useUserStore.getState().user.id;
	const conversation = MultiAgentStore.conversations.find(
		(m) => m.id === conversationId,
	);

	if (!conversation) return;

	const userMessage: MultiAgentChatMessage = createMultiAgentChatMessage({
		role: "user",
		content: initialInput,
	});
	MultiAgentStore.updateMessages(conversationId, userMessage);

	const chatSession = {
		session_id: conversationId,
		user: userId,
		initial_input: initialInput,
		total_rounds: conversation.totalRounds,
		topic: conversation.topic || DEFAULT_TOPIC,
		// Add any other necessary fields
	};

	uploadMultiAgentSession(conversationId, chatSession);
	sendNextAgentMessage(conversation.round, conversationId, initialInput);
}

async function sendNextAgentMessage(
	round: number,
	conversationId: string,
	messageContent: string,
) {
	const MultiAgentStore = multipleAgentStore.getState();
	const session = MultiAgentStore.conversations.find(
		(m) => m.id === conversationId,
	);
	const userId = useUserStore.getState().user.id;

	if (!session || round >= session.totalRounds || session.paused || !userId) {
		return null;
	}

	const nextAgentIndex = MultiAgentStore.decideNextAgent(
		conversationId,
		session.next_agent_type,
	);
	const nextAgentConfig = session.aiConfigs[nextAgentIndex];

	const botMessage: MultiAgentChatMessage = createMultiAgentChatMessage({
		role: "assistant",
		content: "思考中...",
		agentNum: nextAgentIndex,
	});

	MultiAgentStore.updateMessages(conversationId, botMessage);

	const modelConfig = nextAgentConfig.modelConfig;
	const historyMessages = MultiAgentStore.getHistory(conversationId);
	let concatMessage = [];

	if (round > 1) {
		const historySummary =
			await MultiAgentStore.summarizeSession(conversationId);
		const template = ConversationChatTemplate(
			nextAgentConfig,
			session.aiConfigs,
			session.topic,
			historySummary,
			historyMessages.map((m) => `${m.role}: ${m.content}`).join("\n"),
		);
		concatMessage = [template];
	} else {
		const template = InitialConversationChatTemplate(
			nextAgentConfig,
			session.aiConfigs,
			session.topic,
		);
		const userMessage = createMultiAgentChatMessage({
			role: "user",
			content: messageContent,
		});
		concatMessage = [template, userMessage];
	}

	sendChatMessage(
		nextAgentConfig,
		modelConfig,
		concatMessage,
		handleChatCallbacks("assistant", session, conversationId, nextAgentIndex),
	);
}

export function handleChatCallbacks(
	role: "system" | "assistant" | "user",
	_session: MultiAgentChatSession,
	conversationId: string,
	agentNum: number,
) {
	const config = useAppConfig.getState();
	const pluginConfig = config.pluginConfig;
	const allPlugins = usePluginStore.getState().getAll();
	const MultiAgentStore = multipleAgentStore.getState();
	const session =
		MultiAgentStore.conversations.find((m) => m.id === conversationId) ??
		_session;
	const messageIndex = session?.messages.length
		? session?.messages.length - 1
		: 0;
	const toolsMessage: ChatToolMessage[] =
		session?.messages[messageIndex].toolMessages || [];

	const user = useUserStore.getState().user;
	const messageTemplate = createMultiAgentChatMessage({
		role: role,
		content: "",
		streaming: true,
	});

	return {
		onUpdate: (message: string) => {
			messageTemplate.streaming = true;
			if (message) {
				messageTemplate.content = message;
				MultiAgentStore.updateSingleMessage(
					conversationId,
					messageIndex,
					message,
				);
			}
		},
		onToolUpdate(toolName: string, toolInput: string) {
			messageTemplate.streaming = true;
			const tool = allPlugins.find((m) => m.toolName === toolName);
			const name = tool?.name;
			if (name && toolInput) {
				toolsMessage.push({
					toolName: name,
					toolInput,
				});

				MultiAgentStore.updateSingleMessage(
					conversationId,
					messageIndex,
					getMessageTextContent(messageTemplate),
					toolsMessage,
				);
			}
		},
		onFinish: (message: string) => {
			messageTemplate.streaming = true;
			if (message) {
				messageTemplate.content = message;
				const round = MultiAgentStore.updateRound(conversationId).round;
				MultiAgentStore.updateSingleMessage(
					conversationId,
					messageIndex,
					message,
				);
				if (role === "assistant") {
					sendNextAgentMessage(round, conversationId, message);
					createAgentChats(conversationId, message, agentNum);
				} else {
					sendNextAgentMessage(round, conversationId, message);
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

			MultiAgentStore.updateMessages(conversationId, messageTemplate);
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

function sendChatMessage(
	aiConfig: Mask,
	modelConfig: ModelConfig,
	sendMessages: MultiAgentChatMessage[],
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

	const useToolAgent = pluginConfig.enable && allPlugins.length > 0;
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

export async function createAgentChats(
	sessionId: string,
	content: string,
	agentNum: number,
) {
	const userStore = useUserStore.getState();
	const MultiAgentStore = multipleAgentStore.getState();
	const session = MultiAgentStore.conversations.find((m) => m.id === sessionId);
	const AuthStore = useAuthStore.getState();

	if (!session) {
		return null;
	}

	const agentConfig = session.aiConfigs[agentNum];
	const model = agentConfig.modelConfig.model;
	const role = agentNum === 0 ? "assistant" : "user";
	const agentSetting = agentConfig.context.map((m) => m.content).join("\n");

	const historyMessages = MultiAgentStore.getHistory(sessionId);

	const createChatData: CreateChatData = {
		user: userStore.user.id,
		chat_session: sessionId,
		message: content,
		role: role,
		model: model,
		memory: historyMessages,
		round: session.round,
		agent_num: agentNum,
		is_double_agent: true,
	};

	const chatResponse = await createAgentChat(createChatData);

	if (chatResponse.code === 4000 || chatResponse.code === 401) {
		const response = {
			code: chatResponse.code,
			message: chatResponse.msg,
		};

		const error = createMultiAgentChatMessage({
			role: "assistant",
			content: "登录已过期，请重新登录",
		});

		MultiAgentStore.updateMessages(sessionId, error);
		AuthStore.logout();
		userStore.clearUser();

		throw response;
	}
}

export function continueConversation(conversationId: string, round: number) {
	const MultiAgentStore = multipleAgentStore.getState();
	const session = MultiAgentStore.conversations.find(
		(m) => m.id === conversationId,
	);

	if (!session || round >= session.totalRounds) {
		return null;
	}

	const messages = session.messages;
	const lastMessage = messages[messages.length - 1];
	const messageContent = getMessageTextContent(lastMessage);

	sendNextAgentMessage(round, conversationId, messageContent);
}

export function decideNextAgent(conversationId: string, strategy: "round-robin" | "random" | "intelligent"): number {
	const MultiAgentStore = multipleAgentStore.getState();
	const conversation = MultiAgentStore.conversations.find(conv => conv.id === conversationId);
	if (!conversation) throw new Error("Conversation not found");

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
