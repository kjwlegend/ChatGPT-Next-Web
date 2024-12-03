import { ChatSession, ChatMessage } from "@/app/types/chat";
import { createMessage } from "@/app/store/chat";
import { fillTemplateWith, ragSearchTemplate } from "@/app/chains/base";
import Locale, { getLang } from "@/app/locales";
import { estimateTokenLength } from "@/app/utils/chat/token";
import { getMessageTextContent } from "@/app/utils";
import { workflowChatSession } from "@/app/types/";

import { FileInfo } from "@/app/client/platforms/utils";
export function getMessagesWithMemory(
	session: ChatSession | workflowChatSession,
	tools?: string[],
	files?: FileInfo[],
) {
	// 定义一个session

	const modelConfig = session.mask.modelConfig;
	const clearContextIndex = session.clearContextIndex ?? 0;
	const messages = session.messages.slice();
	const totalMessageCount = session.messages.length;

	// in-context prompts
	const contextPrompts = session.mask.context.slice();

	// system prompts, to get close to OpenAI Web ChatGPT
	const shouldInjectSystemPrompts = modelConfig.enableInjectSystemPrompts;
	const injectSetting = {
		injectUserInfo: modelConfig.enableUserInfos,
		injectRelatedQuestions: modelConfig.enableRelatedQuestions,
	};
	const systemPrompts = [
		createMessage({
			role: "system",
			content: fillTemplateWith("", injectSetting, tools, files),
		}),
	];

	const MemoryPrompt = {
		role: "system",
		content:
			session.memoryPrompt?.length > 0
				? Locale.Store.Prompt.History(session.memoryPrompt)
				: "",
		date: "",
	} as ChatMessage;
	// long term memory
	const shouldSendLongTermMemory =
		modelConfig.sendMemory &&
		session.memoryPrompt &&
		session.memoryPrompt.length > 0 &&
		session.lastSummarizeIndex > clearContextIndex;
	const longTermMemoryPrompts = shouldSendLongTermMemory ? [MemoryPrompt] : [];
	const longTermMemoryStartIndex = session.lastSummarizeIndex;

	// short term memory
	const shortTermMemoryStartIndex = Math.max(
		0,
		totalMessageCount - modelConfig.historyMessageCount,
	);

	// lets concat send messages, including 4 parts:
	// 0. system prompt: to get close to OpenAI Web ChatGPT
	// 1. long term memory: summarized memory messages
	// 2. pre-defined in-context prompts
	// 3. short term memory: latest n messages
	// 4. newest input message
	const memoryStartIndex = shouldSendLongTermMemory
		? Math.min(longTermMemoryStartIndex, shortTermMemoryStartIndex)
		: shortTermMemoryStartIndex;
	// and if user has cleared history messages, we should exclude the memory too.
	const contextStartIndex = Math.max(clearContextIndex, memoryStartIndex);
	const maxTokenThreshold = modelConfig.max_tokens;

	// get recent messages as much as poss_baseible
	const reversedRecentMessages = [];
	for (
		let i = totalMessageCount - 1, tokenCount = 0;
		i >= contextStartIndex && tokenCount < maxTokenThreshold;
		i -= 1
	) {
		const msg = messages[i];
		if (!msg || msg.isError) continue;
		tokenCount += estimateTokenLength(getMessageTextContent(msg));
		reversedRecentMessages.push(msg);
	}

	// concat all messages
	const recentMessages = [
		...systemPrompts,
		...longTermMemoryPrompts,
		...contextPrompts,
		...reversedRecentMessages.reverse(),
	];
	//  update session tokenCount

	const recentMessagesText = recentMessages.map((m) => m.content).join("\n");

	const recentMessagesTokenCount = estimateTokenLength(recentMessagesText);

	return { recentMessages, recentMessagesTokenCount };
}
