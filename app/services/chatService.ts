import { ChatSession, ChatMessage, DEFAULT_TOPIC } from "../store";
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
			botMessage.streaming = false;
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

				const createChatData: CreateChatData = {
					user: user.id,
					chat_session: session.id,
					message: message,
					role: "assistant",
					model: session.mask.modelConfig.model,
				};
				const botResponse = createChat(createChatData); // 替换为实际的API调用
				//  botResponse 为 Promise 对象 , 获取其中的 chat_id 作为 botMessage 的 id
				botResponse.then((res) => {
					const data = res.data;
					if (data) {
						botMessage.id = data.chat_id.toString();
						console.log("botMessage id: ", botMessage.id);
						// 需要替换原本的message id 为新的id
						chatStoreState.onNewMessage(botMessage);
					}
				});
			}
			ChatControllerPool.remove(session.id, botMessage.id);
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
		pluginConfig.enable &&
		session.mask.usePlugins &&
		allPlugins.length > 0 &&
		session.mask.modelConfig.model !== "gpt-4-vision-preview";

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

// 获取服务器对话列表
export function UpdateChatSessions(newSessionsData: any[]) {
	const chatStore = useChatStore.getState();
	console.log("newSessionsData: ", newSessionsData);
	// 遍历接口返回的会话数据

	newSessionsData.forEach((sessionData) => {
		// 检查chatstore.sessions中是否已经存在该会话

		const exists = chatStore.sessions.some(
			(s) => s.id === sessionData.session_id,
		);
		console.log("exists: ", exists, "sessionData: ", sessionData);

		// 如果不存在，则创建一个新的ChatSession对象并添加到chatstore.sessions中
		if (!exists) {
			const newSession: ChatSession = {
				id: sessionData.session_id,
				topic: sessionData.topic ?? DEFAULT_TOPIC, // 如果session_topic为null，则使用空字符串
				memoryPrompt: sessionData.session_summary, // 根据实际情况填充
				messages: [], // 根据实际情况填充
				stat: {
					tokenCount: 0,
					wordCount: 0,
					charCount: 0,
				}, // 根据实际情况填充
				lastUpdate: Date.parse(sessionData.last_updated),
				lastSummarizeIndex: sessionData.lastSummarizeIndex, // 根据实际情况填充
				clearContextIndex: undefined, // 根据实际情况填充
				mask: sessionData.mask ?? createEmptyMask(), // 根据实际情况填充
				responseStatus: undefined, // 根据实际情况填充
				isworkflow: sessionData.isworkflow, // 根据实际情况填充
				mjConfig: sessionData.mjConfig,
				chat_count: sessionData.chat_count,
			};
			chatStore.addSession(newSession);
			// console.log("newSession", newSession);
		}
	});
}

// 获取服务器消息列表
export function UpdateChatMessages(sessionId: string, messagesData: any[]) {
	const chatStore = useChatStore.getState();
	const session = chatStore.sessions.find((s) => s.id === sessionId);

	messagesData.forEach((messageData, index) => {
		// 检查是否已经存在该消息

		const exists = session?.messages.some((m) => m.id === messageData.chat_id);
		// console.log(exists, index);
		if (exists) return;

		const newMessage: ChatMessage = {
			date: messageData.create_date,
			id: messageData.chat_id.toString(),
			role: messageData.role, // 确保这里的转换是安全的
			content: messageData.message,
			mjstatus: messageData.mjstatus,

			// 根据需要添加其他属性
		};

		// 使用 chatStore 的方法来添加新消息
		chatStore.addMessageToSession(sessionId, newMessage);
	});
}
