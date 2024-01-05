import { ChatSession, ChatMessage } from "../store";
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
import { Button, message } from "antd";
import { auth } from "../api/auth";
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
				chatStoreState.onNewMessage(botMessage);
				session.responseStatus = true;
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

	// 检查当前插件开启状态
	// console.log(
	// 	"config enable",
	// 	config.pluginConfig.enable,
	// 	"\n session",
	// 	session.mask.usePlugins,
	// 	"\n AllPlugin",
	// 	allPlugins.length,
	// 	allPlugins,
	// );

	if (useToolAgent) {
		console.log("[ToolAgent] start");
		const pluginToolNames = session.mask.plugins;
		api.llm.toolAgentChat({
			...chatOptions,
			agentConfig: {
				...pluginConfig,
				useTools: pluginToolNames,
			},
		});
	} else {
		api.llm.chat(chatOptions);
	}
}
