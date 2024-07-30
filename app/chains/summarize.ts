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
import { createChatSession, UpdateChatSessionData } from "../api/backend/chat";
import { updateChatSession } from "../services/chats";
import { UserStore, useUserStore } from "@/app/store/user";
import { BUILTIN_MASKS } from "../masks";
import { Plugin, usePluginStore } from "../store/plugin";
import { ChatSession, Mask, ChatMessage, ChatToolMessage } from "../types/";
import { sendChatMessage } from "../services/chatService";
import { useChatStore, createMessage, DEFAULT_TOPIC } from "../store";
import { DoubleAgentChatMessage } from "../store/doubleAgents";
import { strictLLMResult } from "./basic";
import { getMessageTextContent } from "../utils";

function countMessages(msgs: ChatMessage[] | RequestMessage[]): number {
	return msgs.reduce(
		(pre, cur) => pre + estimateTokenLength(getMessageTextContent(cur)),
		0,
	);
}

export async function summarizeTitle(
	_session?: ChatSession,
): Promise<string | null> {
	const chatStoreState = useChatStore.getState();
	const config = useAppConfig.getState();
	const session = chatStoreState.getSession(_session);

	const messages = session.messages;
	const SUMMARIZE_MIN_LEN = 200;

	if (
		(session.topic === DEFAULT_TOPIC || session.topic === "闲聊") &&
		countMessages(messages) >= SUMMARIZE_MIN_LEN
	) {
		const topicMessages: RequestMessage[] = messages.map((msg) => ({
			role: msg.role,
			content: getMessageTextContent(msg),
		}));

		topicMessages.push({
			role: "user",
			content: Locale.Store.Prompt.Topic,
		});

		const message = await strictLLMResult(topicMessages);
		const topic = message.length > 0 ? trimTopic(message) : DEFAULT_TOPIC;

		chatStoreState.updateCurrentSession((session) => {
			session.topic = topic;
		});

		return topic;
	}

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
		historyMessageCount,
		sendMemory,
	} = modelConfig ?? {};

	const title = await summarizeTitle(session);
	const startIndex = Math.max(lastSummarizeIndex, clearContextIndex ?? 0);
	let toBeSummarizedMsgs = messages
		.filter((msg) => !msg.isError)
		.slice(startIndex) as RequestMessage[];

	const historyMsgLength = countMessages(toBeSummarizedMsgs);
	if (historyMsgLength > max_tokens) {
		toBeSummarizedMsgs = toBeSummarizedMsgs.slice(-historyMessageCount);
	}

	const memoryPrompt = chatStoreState.getMemoryPrompt();
	toBeSummarizedMsgs.unshift({
		role: memoryPrompt.role,
		content: memoryPrompt.content,
	});

	const newSummarizeIndex = messages.length;

	if (sendMemory) {
		const summarizeMessages: RequestMessage[] = toBeSummarizedMsgs.map(
			(msg) => ({
				role: msg.role,
				content: getMessageTextContent(msg),
			}),
		);

		summarizeMessages.push({
			role: "system",
			content: Locale.Store.Prompt.Summarize,
		});

		const message = await strictLLMResult(summarizeMessages);
		updateCurrentSession((session) => {
			session.lastSummarizeIndex = newSummarizeIndex;
			session.memoryPrompt = message;
		});

		const updateObject: UpdateChatSessionData = {
			session_summary: message,
		};

		if (title) {
			updateObject.topic = title;
		}

		await updateChatSession(updateObject, session.id);
	}
}

export async function contextSummarize(
	message: ChatMessage[] | DoubleAgentChatMessage[] | RequestMessage[],
	historysummary: string,
): Promise<string> {
	const summaryMessages: RequestMessage[] = [
		{
			role: "system",
			content: "这是我们之前讨论的要点摘要，请仔细阅读：" + historysummary,
		},
		{
			role: "system",
			content:
				"请基于刚才的对话内容和提供的摘要，精炼出一个新的总结，用于指导后续的对话。总结应简洁明了，控制在500字以内。如果现有信息不足以形成一个全面的总结，请输出'当前无足够信息提供记忆上下文'。",
		},
	];

	const newmessage = message
		.reverse()
		.map((msg) => ({
			role: msg.role,
			content: getMessageTextContent(msg),
		}))
		.concat(
			summaryMessages.map((msg) => ({
				role: msg.role,
				content: typeof msg.content === "string" ? msg.content : "",
			})),
		);

	const summary = await strictLLMResult(newmessage);
	return summary;
}
