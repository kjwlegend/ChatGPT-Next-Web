import { trimTopic } from "../utils";

import Locale, { getLang } from "../locales";
import { showToast } from "../components/ui-lib";
import { ModelConfig, ModelType, useAppConfig } from "@/app/store/config";

import { api, RequestMessage } from "../client/api";

import { estimateTokenLength } from "../utils/chat/token";

import { ChatSession, Mask, ChatMessage, ChatToolMessage } from "../types/";
import { useChatStore, createMessage, DEFAULT_TOPIC } from "../store";
import { MultiAgentChatMessage } from "../store/multiagents";
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

export async function summarizeSession(session: ChatSession): Promise<{
	summary: string;
	title: string | null;
	newSummarizeIndex: number;
}> {
	const {
		messages,
		mask: { modelConfig },
		lastSummarizeIndex,
		clearContextIndex,
		memoryPrompt,
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

	toBeSummarizedMsgs.unshift({
		role: "system",
		content:
			memoryPrompt?.length > 0 ? Locale.Store.Prompt.History(memoryPrompt) : "",
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

		const summary = await strictLLMResult(summarizeMessages);
		return { summary, title, newSummarizeIndex };
	}

	return { summary: "", title, newSummarizeIndex };
}

export async function contextSummarize(
	recentMessages: ChatMessage[] | MultiAgentChatMessage[],
	historySummary: string,
): Promise<string> {
	const systemMessages: RequestMessage[] = [
		{
			role: "system",
			content: `请基于以下信息创建一个新的总结：

1. 历史总结：
${historySummary}

2. 最近的对话内容：
[接下来会提供最近的对话内容]

请遵循以下指南：
1. 综合历史总结和最近的对话，创建一个新的、更新的总结。
2. 总结应该简洁明了，控制在300字以内。
3. 突出重要的新信息、关键点和任何显著的话题转变。
4. 保持总结的连贯性和上下文的完整性。


请提供新的总结：`,
		},
	];

	const recentMessageContents = recentMessages
		.slice(-10) // 只取最近的10条消息
		.map((msg) => {
			const content = getMessageTextContent(msg);
			const agentName = "agentName" in msg ? msg.agentName : null;

			return {
				role: msg.role,
				content: agentName ? `${agentName}说：${content}` : content,
			};
		});

	const allMessages = [...systemMessages, ...recentMessageContents];

	const summary = await strictLLMResult(allMessages);
	return summary;
}
