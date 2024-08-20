import { DEFAULT_TOPIC, ModelType, useChatStore } from "../store";

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
import { CreateChatData, createChat } from "./api/chats";
import useAuth from "../hooks/useAuth";

import { Store } from "antd/es/form/interface";

export const createChatDataAndFetchId = async (options: {
	user: number;
	sessionId: string;
	content: string;
	attachImages: string[] | undefined;
	recentMessages: ChatMessage[];
	model: ModelType;
	totalTokenCount: number;
	sender_name: string;
	contentType?: string; // 增加 contentType 参数，默认为 "chatsession"
	chat_role?: "user" | "assistant" | "system" | string;
}) => {
	const {
		user,
		sessionId,
		content,
		attachImages,
		recentMessages,
		model,
		totalTokenCount,
		sender_name,
		contentType = "chatsession",
		chat_role = "user",
	} = options;

	const createChatData: CreateChatData = {
		user: user,
		object_id: sessionId,
		content,
		chat_images: attachImages,
		memory: recentMessages,
		chat_role: chat_role,
		chat_model: model,
		content_type: contentType, // 使用传入的 contentType 参数
		sender_name: sender_name,
		token_counts_total: totalTokenCount,
	};

	try {
		const chatResponse = await createChat(createChatData);
		return { chat_id: chatResponse.chat_id, id: chatResponse.id };
	} catch (error) {
		console.error("Error creating chat data:", error);
		throw new Error("Failed to create chat data. Please try again later.");
	}
};
export const submitChatMessage = async (
	createChatData: CreateChatData,
	chatStore: Store,
) => {
	// console.log("createChatData trigger");

	try {
		const response = await createChat(createChatData); // 替换为实际的API调用
		const data = response.data;
		console.log("submit chat message createChatData: ", createChatData);
		if (data) {
			// console.log("createChat success:", response);
			const newSessionId = data.chat_session;

			console.log("newSessionId: ", newSessionId);

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
					const data = res;
					if (data) {
						botMessage.id = data.id;
						botMessage.chat_id = data.chat_id.toString();
						botMessage.isFinished = true;
						botMessage.isTransfered = false;
						botMessage.token_counts_total = tokenCount;
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

import { estimateTokenLength } from "../utils/token";
