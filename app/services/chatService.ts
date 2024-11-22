import { ModelType } from "@/app/store";
import { useChatStore, DEFAULT_TOPIC, createMessage } from "@/app/store/chat";
import { ChatSession, ChatMessage, MJMessage, Mask } from "@/app/types/";
import { useUserStore } from "@/app/store";
import { RequestMessage, api } from "../client/api";
import { SUMMARIZE_MODEL } from "../constant";

import { useAppConfig } from "../store";
import { usePluginStore } from "../store/plugin";
import { ChatControllerPool } from "../client/controller";

import { prettyObject } from "../utils/format";

import { ModelConfig } from "../store";
import { CreateChatData, createChat } from "./api/chats";
import useAuth from "../hooks/useAuth";
import { Store } from "antd/es/form/interface";
import { DocumentMeta } from "../api/langchain/tool/agent/agentapi";
import { Reference } from "../api/langchain/tool/agent/agentapi";
import { CodeBlock } from "../api/langchain/tool/agent/agentapi";

export const createChatDataAndFetchId = async (options: {
	user: number;
	sessionId: string;
	content: string;
	attachImages: string[] | undefined;
	recentMessages: ChatMessage[];
	model: ModelType;
	totalTokenCount: number;
	sender_name: string;
	sender_id?: string | number | undefined;
	contentType: string; // 增加 contentType 参数，默认为 "chatsession"
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
		sender_id,
		contentType, // 移除默认值
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
		sender_id: sender_id,
		token_counts_total: totalTokenCount,
	};

	try {
		const chatResponse = await createChat(createChatData);
		if (chatResponse.code == 4000) {
			throw new Error("登录已过期或账号无效, 请重新登录再试");
		}
		return { chat_id: chatResponse.chat_id, id: chatResponse.id };
	} catch (error) {
		console.error("Error creating chat data:", error);

		throw new Error("登录已过期或账号无效, 请重新登录再试");
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

export function handleChatCallbacks(
	botMessage: ChatMessage,
	userMessage: ChatMessage,
	session: ChatSession,
	onUpdateCallback?: (message: string) => void,
	onToolUpdateCallback?: (toolName: string, toolInput: string) => void,
	onFinishCallback?: (message: string) => void,
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
			if (onUpdateCallback) {
				onUpdateCallback(message);
			}
		},
		onToolUpdate: (
			toolName: string,
			toolInput: string,
			type?: string,
			references?: Reference[],
			documents?: DocumentMeta[],
			codeBlocks?: CodeBlock[],
		) => {
			botMessage.streaming = true;

			// 如果有工具名和输入，创建新的工具消息
			if (toolName && toolInput) {
				const tool = allPlugins.find((m) => m.toolName === toolName);
				const name = tool?.name;

				// Create new tool message
				const newToolMessage = {
					toolName: name || toolName,
					toolInput: toolInput,
					references: [], // 初始化空数组
					documents: [], // 初始化空数组
					codeBlocks: [], // 初始化空数组
				};

				// 添加新的工具消息
				botMessage.toolMessages!.push(newToolMessage);
			}

			// 如果有引用信息，更新最后一条工具消息
			if (references || documents || codeBlocks) {
				const lastToolMessage =
					botMessage.toolMessages![botMessage.toolMessages!.length - 1];
				if (lastToolMessage) {
					// 更新对应的引用信息
					if (references) lastToolMessage.references = references;
					if (documents) lastToolMessage.documents = documents;
					if (codeBlocks) lastToolMessage.codeBlocks = codeBlocks;
				}
			}

			// Call callback if provided
			if (onToolUpdateCallback) {
				onToolUpdateCallback(toolName, toolInput);
			}
		},
		onFinish: (message: string) => {
			if (message) {
				botMessage.content = message;
				botMessage.streaming = false;
			}
			ChatControllerPool.remove(session.id, botMessage.id);
			if (onFinishCallback) {
				onFinishCallback(message);
			}
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
			// chatStoreState.updateCurrentSession((session) => {
			// 	session.messages = session.messages.concat();
			// });
			ChatControllerPool.remove(session.id, botMessage.id);
			console.error("[Chat] failed ", error);
		},
		onController: (controller: AbortController) => {
			ChatControllerPool.addController(session.id, botMessage.id, controller);
		},
	};
}
// 然后创建一个统一的发送消息函数
export function sendChatMessage(
	sessionId: string,
	agent: Mask,
	sendMessages: ChatMessage[] | RequestMessage[],
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

	const modelConfig = agent.modelConfig;

	const chatOptions = {
		sessionId: sessionId,
		messages: sendMessages,
		config: { ...modelConfig, stream: stream ?? true },
		...callbacks,
	};

	// 根据是否启用插件使用不同的API
	const useToolAgent = agent.plugins?.length! > 0 && allPlugins.length > 0;

	if (useToolAgent) {
		console.log("[ToolAgent] start", sessionId);
		const pluginToolNames = agent.plugins;
		api.llm.toolAgentChat({
			chatSessionId: sessionId,
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
