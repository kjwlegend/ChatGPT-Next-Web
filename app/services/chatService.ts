import { DEFAULT_TOPIC, useChatStore } from "../store";

import { ChatSession, ChatMessage, MJMessage } from "@/app/types/";
import { useUserStore } from "../store";
import { RequestMessage, api } from "../client/api";
import { SUMMARIZE_MODEL } from "../constant";
import { createMessage } from "../store";

import { useAppConfig } from "../store";
import { usePluginStore } from "../store/plugin";
import { ChatControllerPool } from "../client/controller";

import { prettyObject } from "../utils/format";

import { ModelConfig } from "../store";
import { CreateChatData, createChat } from "./chats";
import useAuth from "../hooks/useAuth";

import { Store } from "antd/es/form/interface";

export const submitChatMessage = async (
	createChatData: CreateChatData,
	chatStore: Store,
) => {
	// console.log("createChatData trigger");

	try {
		const response = await createChat(createChatData); // 替换为实际的API调用
		const data = response.data;

		if (data) {
			// console.log("createChat success:", response);
			const newSessionId = data.chat_session;

			if (createChatData.chat_session !== newSessionId) {
				chatStore.updateSession(
					createChatData.chat_session,
					(session: ChatSession) => {
						session.id = newSessionId;
					},
				);
			}
			return data;
		}
		return response;
	} catch (error) {
		console.error("createChat error:", error);
		throw error; // 抛出错误以供调用者处理
	}
};

// 先定义一个处理回调的函数，以便重用
export function handleChatCallbacks(
	botMessage: ChatMessage,
	userMessage: ChatMessage,
	messageIndex: number,
	session: ChatSession,
) {
	const config = useAppConfig.getState();
	const pluginConfig = config.pluginConfig;
	const allPlugins = usePluginStore.getState().getAll();
	const chatStoreState = useChatStore.getState();
	const user = useUserStore.getState().user;

	return {
		onUpdate: (message: string) => {
			botMessage.streaming = true;
			if (message) {
				botMessage.content = message;
			}
			chatStoreState.updateCurrentSession((session) => {
				session.messages = session.messages.concat();
			});
		},
		onToolUpdate(toolName: string, toolInput: string) {
			botMessage.streaming = true;
			//  根据toolName获取对应的 toolName, 并输出对应的 name
			const tool = allPlugins.find((m) => m.toolName === toolName);
			const name = tool?.name;
			// console.log("toolName: ", toolName, "tool: ", tool?.name);
			if (name && toolInput) {
				botMessage.toolMessages!.push({
					toolName: name,
					toolInput,
				});
			}
			chatStoreState.updateCurrentSession((session) => {
				session.messages = session.messages.concat();
			});
		},
		onFinish: (message: string) => {
			if (message) {
				botMessage.content = message;
				// console.log("message111 finish: ", message);
				chatStoreState.updateSession(
					session.id,
					() => {
						session.responseStatus = true;
					},
					false,
				);
				botMessage.streaming = false;
				const tokenCount = estimateTokenLength(message);
				// console.log("botMessage streaming: ", botMessage.streaming);
				const content_type = "chatsession";
				const createChatData: CreateChatData = {
					user: user.id,
					content: message,
					chat_role: "assistant",
					chat_model: session.mask.modelConfig.model,
					content_type: content_type,
					object_id: session.id,
					sender_name: session.mask.name,
					token_counts_total: tokenCount,
				};

				const botResponse = createChat(createChatData); // 替换为实际的API调用
				//  botResponse 为 Promise 对象 , 获取其中的 chat_id 作为 botMessage 的 id
				botResponse.then((res) => {
					const data = res.data;
					if (data) {
						botMessage.id = data.chat_id.toString();
						botMessage.isFinished = true;
						botMessage.isTransfered = false;
						// console.log("botMessage id: ", botMessage.id);
						// 需要替换原本的message id 为新的id
						chatStoreState.onNewMessage(botMessage);
					}
				});
			}
			ChatControllerPool.remove(session.id, botMessage.id);
			// console.log("controller finish botMessage id: ", botMessage.id);
		},
		onError: (error: Error) => {
			const isAborted = error.message.includes("aborted");
			botMessage.content +=
				"\n\n" +
				prettyObject({
					error: true,
					message: error.message,
				});
			botMessage.streaming = false;
			userMessage.isError = !isAborted;
			botMessage.isError = !isAborted;
			chatStoreState.updateCurrentSession((session) => {
				session.messages = session.messages.concat();
			});
			ChatControllerPool.remove(session.id, botMessage.id ?? messageIndex);
			console.error("[Chat] failed ", error);
		},
		onController: (controller: AbortController) => {
			ChatControllerPool.addController(
				session.id,
				botMessage.id ?? messageIndex,
				controller,
			);
		},
	};
}

// 然后创建一个统一的发送消息函数
export function sendChatMessage(
	session: ChatSession,
	sendMessages: ChatMessage[] | RequestMessage[],
	callbacks: {
		onUpdate?: (message: string) => void;
		onFinish: (message: string) => void;
		onError?: (error: Error) => void;
		onController?: (controller: AbortController) => void;
		onToolUpdate?: (toolName: string, toolInput: string) => void;
	},
	modelConfig?: ModelConfig,
	stream?: boolean,
) {
	const config = useAppConfig.getState();
	const pluginConfig = config.pluginConfig;
	const allPlugins = usePluginStore.getState().getAll();

	if (!modelConfig) {
		modelConfig = session.mask.modelConfig;
	}

	const chatOptions = {
		messages: sendMessages,
		config: { ...modelConfig, stream: stream ?? true },
		...callbacks,
	};

	// console.log("chatoptions", chatOptions);

	// 根据是否启用插件使用不同的API
	const useToolAgent =
		pluginConfig.enable && session.mask.usePlugins && allPlugins.length > 0;

	if (useToolAgent) {
		console.log("[ToolAgent] start");
		const pluginToolNames = session.mask.plugins;
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

import { createEmptyMask } from "../store/mask";
import { estimateTokenLength } from "../utils/token";

export function updateChatSessions(newSessionsData: any[]) {
	const chatStore = useChatStore.getState();

	newSessionsData.forEach((sessionData) => {
		const existingSessionIndex = chatStore.sessions.findIndex(
			(s) => s.id === sessionData.id,
		);
		const exists = existingSessionIndex !== -1;

		const newSession: ChatSession = {
			id: sessionData.id,
			session_id: sessionData.session_id,
			topic: sessionData.session_topic ?? DEFAULT_TOPIC,
			memoryPrompt: sessionData.session_summary,
			messages: [],
			stat: {
				tokenCount: sessionData.token_counts_total,
			},
			lastSummarizeIndex: 0,
			clearContextIndex: undefined,
			mask: sessionData.mask ?? createEmptyMask(),
			responseStatus: undefined,
			isworkflow: false,
			mjConfig: sessionData.mjConfig,
			chat_count: 0,
			updated_at: sessionData.updated_at,
			created_at: sessionData.created_at,
			lastUpdate: Date.parse(sessionData.updated_at),
		};

		if (!exists) {
			chatStore.addSession(newSession);
			console.log("add new session: ", newSession.id);
		} else {
			const existingSession = chatStore.sessions[existingSessionIndex];

			if (newSession.lastUpdate! > existingSession.lastUpdate) {
				chatStore.updateSession(newSession.id!, () => newSession);
				console.log("update session: ", newSession.id);
			}
		}
	});
}

// 获取服务器消息列表
export function UpdateChatMessages(id: string | number, messagesData: any[]) {
	const chatStore = useChatStore.getState();
	const session = chatStore.sessions.find((s) => s.id === id);
	if (!session) return;
	const session_id = session?.session_id;

	messagesData.forEach((messageData) => {
		// 检查是否已经存在该消息
		const exists = session?.messages.some((m) => m.id == messageData.id);
		if (exists) {
			console.log("message already exists: ", messageData.id);
			return;
		}

		const newMessage: ChatMessage = {
			id: messageData.id.toString(),
			chat_id: messageData.chat_id.toString(),
			role: messageData.chat_role, // 确保这里的转换是安全的
			image_url: messageData.chat_images,
			date: messageData.created_at,
			content: messageData.content,
			function_calls: messageData.function_calls,
			token_counts_total: messageData.token_counts_total,
			sender_name: messageData.sender_name,
			chat_model: messageData.chat_model,

			// 下面属性可能被移除
			mjstatus: messageData.mjstatus,
		};

		// 使用 chatStore 的方法来添加新消息
		chatStore.addMessageToSession(session_id, newMessage);
	});
}
