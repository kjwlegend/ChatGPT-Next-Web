import { trimTopic } from "../utils";

import Locale, { getLang } from "../locales";
import { showToast } from "../components/ui-lib";
import { ModelConfig, ModelType, useAppConfig } from "@/app/store/config";
import { createEmptyMask, Mask } from "@/app/store/mask";
import { KnowledgeCutOffDate, StoreKey, SUMMARIZE_MODEL } from "../constant";

import { api, RequestMessage } from "../client/api";
import { ChatControllerPool } from "../client/controller";
import { prettyObject } from "../utils/format";
import { estimateTokenLength } from "../utils/token";
import { nanoid } from "nanoid";
import { createChatSession } from "../api/chat";
import { UserStore, useUserStore } from "@/app/store/user";
import { BUILTIN_MASKS } from "../masks";
import type { BuiltinMask } from "../masks";
import { Plugin, usePluginStore } from "../store/plugin";

import {
	useChatStore,
	ChatMessage,
	ChatToolMessage,
	createMessage,
	ChatSession,
	DEFAULT_TOPIC,
} from "../store";

function countMessages(msgs: ChatMessage[]) {
	return msgs.reduce((pre, cur) => pre + estimateTokenLength(cur.content), 0);
}

export function summarizeTitle(_session?: ChatSession) {
	const chatStoreState = useChatStore.getState();
	const config = useAppConfig.getState();
	const session = chatStoreState.getSession(_session);

	// remove error messages if any
	const messages = session.messages;

	// should summarize topic after chating more than 50 words
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
		chatStoreState.sendChatMessage(session, topicMessages, {
			onFinish(message) {
				chatStoreState.updateCurrentSession(
					(session) =>
						(session.topic =
							message.length > 0 ? trimTopic(message) : DEFAULT_TOPIC),
				);
			},
		});
	}
}

export function summarizeSession(_session?: ChatSession) {
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

	summarizeTitle(session);
	// remove error messages if any

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

	console.log(
		"[Chat History] ",
		toBeSummarizedMsgs,
		historyMsgLength,
		compressMessageLengthThreshold,
	);

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
		chatStoreState.sendChatMessage(session, summarizeMessages, {
			onUpdate: (message) => {
				session.memoryPrompt = message;
			},
			onFinish: (message) => {
				console.log("[Memory] ", message);
				updateCurrentSession((session) => {
					session.lastSummarizeIndex = newSummarizeIndex;
					session.memoryPrompt = message; // Update the memory prompt for stored it in local storage
				});
			},
			onError: (err) => {
				console.error("[Summarize] ", err);
			},
		});
	}
}
