import { trimTopic } from "../utils";

import Locale, { getLang } from "../locales";
import { showToast } from "../components/ui-lib";
import { ModelConfig, ModelType, useAppConfig } from "@/app/store/config";
import { createEmptyMask } from "@/app/store/mask";
import { KnowledgeCutOffDate, StoreKey, SUMMARIZE_MODEL } from "../constant";

import { api, RequestMessage } from "../client/api";
import { ChatControllerPool } from "../client/controller";
import { prettyObject } from "../utils/format";
import { estimateTokenLength } from "../utils/token";
import { nanoid } from "nanoid";
import {
	createChatSession,
	updateChatSession,
	UpdateChatSessionData,
} from "../api/backend/chat";
import { UserStore, useUserStore } from "@/app/store/user";
import { BUILTIN_MASKS } from "../masks";
import { Plugin, usePluginStore } from "../store/plugin";
import { ChatSession, Mask, ChatMessage, ChatToolMessage } from "../types/";
import { sendChatMessage } from "../services/chatService";
import { useChatStore, createMessage, DEFAULT_TOPIC } from "../store";
import { DoubleAgentChatMessage } from "../store/doubleAgents";
import { strictLLMResult } from "./basic";

function countMessages(msgs: ChatMessage[]) {
	return msgs.reduce((pre, cur) => pre + estimateTokenLength(cur.content), 0);
}

export async function summarizeTitle(
	_session?: ChatSession,
): Promise<String | null> {
	const chatStoreState = useChatStore.getState();
	const config = useAppConfig.getState();
	const session = chatStoreState.getSession(_session);

	// remove error messages if any
	const messages = session.messages;

	// should summarize topic after chatting more than 50 words
	const SUMMARIZE_MIN_LEN = 50;
	if (
		config.enableAutoGenerateTitle &&
		session.topic === DEFAULT_TOPIC &&
		countMessages(messages) >= SUMMARIZE_MIN_LEN
	) {
		const topicMessages = messages.concat(
			createMessage({
				role: "user",
				content: Locale.Store.Prompt.Topic,
			}),
		);

		// Wrap sendChatMessage in a Promise to handle the async onFinish callback
		return new Promise((resolve) => {
			sendChatMessage(session, topicMessages, {
				onFinish(message) {
					chatStoreState.updateCurrentSession(
						(session) =>
							(session.topic =
								message.length > 0 ? trimTopic(message) : DEFAULT_TOPIC),
					);
					// Resolve the Promise with the message data
					resolve(message);
				},
			});
		});
	}

	// If conditions are not met, return null
	return null;
}
export async function summarizeSession(_session?: ChatSession) {
	const chatStoreState = useChatStore.getState();

	const { getSession, updateCurrentSession } = chatStoreState;
	const session = getSession(_session);
	const {
		messages,
		mask: { modelConfig },
		lastSummarizeIndex,
		clearContextIndex,
	} = session;
	const {
		max_tokens = 4000,
		compressMessageLengthThreshold,
		historyMessageCount,
		sendMemory,
	} = modelConfig ?? {};

	const title = await summarizeTitle(session);
	// remove error messages if any

	// console.log("title: ", title);

	const startIndex = Math.max(lastSummarizeIndex, clearContextIndex ?? 0);
	let toBeSummarizedMsgs = messages
		.filter((msg) => !msg.isError)
		.slice(startIndex);

	const historyMsgLength = countMessages(toBeSummarizedMsgs);
	if (historyMsgLength > max_tokens) {
		toBeSummarizedMsgs = toBeSummarizedMsgs.slice(-historyMessageCount);
	}

	// add memory prompt
	toBeSummarizedMsgs.unshift(chatStoreState.getMemoryPrompt());
	const newSummarizeIndex = messages.length;

	// console.log(
	// 	"[Chat History] ",
	// 	toBeSummarizedMsgs,
	// 	historyMsgLength,
	// 	compressMessageLengthThreshold,
	// );

	if (
		// historyMsgLength > compressMessageLengthThreshold &&
		sendMemory
	) {
		const summarizeMessages = toBeSummarizedMsgs.concat(
			createMessage({
				role: "system",
				content: Locale.Store.Prompt.Summarize,
				date: "",
			}),
		);

		// 使用新的 sendChatMessage 函数
		sendChatMessage(session, summarizeMessages, {
			onUpdate: (message) => {
				session.memoryPrompt = message;
			},
			onFinish: (message) => {
				// console.log("[Memory] ", message);
				updateCurrentSession((session) => {
					session.lastSummarizeIndex = newSummarizeIndex;
					session.memoryPrompt = message; // Update the memory prompt for stored it in local storage
				});

				// 准备更新的对象
				let updateObject: UpdateChatSessionData = {
					session_summary: message,
				};

				// 只有当 title 有效时，才添加 topic 到更新对象中
				if (title) {
					updateObject.topic = title;
				}

				// 调用更新会话的接口
				const res = updateChatSession(session.id, updateObject);
				// console.log("updateChatSession: ", res);
			},
			onError: (err) => {
				console.error("[Summarize] ", err);
			},
		});
	}
}

export async function contextSummarize(
	message: ChatMessage[] | DoubleAgentChatMessage[],
	historysummary: string,
) {
	// 将历史消息的内容和历史消息的摘要传入, 调用sendchatmessage函数 进行内容总结,并直接返回新的 summary
	// summary messages 包含, prompt, historysummary, message

	const summaryMessages = [
		createMessage({
			role: "system",
			content: "这是我们之前讨论的要点摘要，请仔细阅读：" + historysummary,
		}),
		createMessage({
			role: "system",
			content:
				"请基于刚才的对话内容和提供的摘要，精炼出一个新的总结，用于指导后续的对话。总结应简洁明了，控制在200字以内。如果现有信息不足以形成一个全面的总结，请输出'当前无足够信息提供记忆上下文'。",
		}),
	];
	const newmessage = message.reverse().concat(summaryMessages);
	console.log("newmessage: ", newmessage);

	const summary = await strictLLMResult(newmessage);
	// console.log("summary: ", summary);
	return summary;
}
