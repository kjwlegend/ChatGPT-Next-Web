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
import doubleAgent from "../store/doubleAgents";
import { sendChatMessage } from "./chatService";
// 假设我们有一个函数来启动对话
export function startConversation(
	startNewConversation: any,

	topic: string,
	initialInput: string,
	userid: number,
) {
	// 创建新会话

	// 设置当前会话ID
	const conversationId = startNewConversation(topic, initialInput, userid);

	// 发送初始消息给firstAI
	sendFirstAIMessage(conversationId, topic);
	console.log("startConversation", topic);
	// return conversationId;
}

// 发送消息给firstAI
function sendFirstAIMessage(conversationId, messageContent) {
	const session = {
		/* ... */
	}; // 获取或创建当前会话的session对象
	const firstAIConfig =
		doubleAgentStore.conversations[conversationId].firstAIConfig;
	const botMessage = {
		/* ... */
	}; // 创建用于存储AI回复的消息对象
	const userMessage = {
		/* ... */
	}; // 创建用于存储用户消息的消息对象

	// 调用发送函数
	sendChatMessage(
		session,
		[messageContent],
		handleChatCallbacks(botMessage, userMessage, 0, session),
		firstAIConfig,
	);
}

// 在firstAI完成回复后，将回答传递给secondAI
function handleFirstAIFinish(conversationId, firstAIResponse) {
	// 存储firstAI的回答
	doubleAgentStore.conversations[conversationId].initialInput = firstAIResponse;

	// 发送消息给secondAI
	sendSecondAIMessage(conversationId, firstAIResponse);
}

// 发送消息给secondAI
function sendSecondAIMessage(conversationId, messageContent) {
	const session = {
		/* ... */
	}; // 获取或创建当前会话的session对象
	const secondAIConfig =
		doubleAgentStore.conversations[conversationId].secondAIConfig;
	const botMessage = {
		/* ... */
	}; // 创建用于存储AI回复的消息对象
	const userMessage = {
		/* ... */
	}; // 创建用于存储用户消息的消息对象

	// 调用发送函数
	sendChatMessage(
		session,
		[messageContent],
		handleChatCallbacks(botMessage, userMessage, 0, session),
		secondAIConfig,
		true,
	);
}

// 处理回调的函数
function handleChatCallbacks(botMessage, userMessage, messageIndex, session) {
	// ...现有的回调逻辑

	return {
		// ...现有的回调函数
		onFinish: (message) => {
			// ...现有的onFinish逻辑

			// 如果是firstAI完成了回复，启动secondAI的回复
			if (session.role === "assistant") {
				handleFirstAIFinish(session.currentConversationId, message);
			}
		},
		// ...其他回调函数
	};
}
