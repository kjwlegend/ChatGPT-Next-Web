import { nanoid } from "nanoid";
import { ChatSession, ChatMessage } from "../../types/chat";
import { useAppConfig } from "../config";
import { Mask } from "../../types/mask";
import { createEmptyMask } from "../mask/utils";

export const createEmptySession = (props?: {
	id?: string;
	mask?: Mask;
}): ChatSession => ({
	id: props?.id ?? nanoid(),
	session_id: "",
	topic: "未命名话题",
	messages: [],
	modelConfig: { ...useAppConfig.getState().modelConfig },
	lastUpdateTime: Date.now(),
	createdAt: Date.now(),
	mask: props?.mask ?? createEmptyMask(),
	memoryPrompt: "",
	lastSummarizeIndex: 0,
	stat: {
		tokenCount: 0,
	},
	isworkflow: false,
	mjConfig: {
		size: "",
		quality: "",
		stylize: "",
		model: "",
	},
	isDoubleAgent: false,
});

export function createMessage(override: Partial<ChatMessage>): ChatMessage {
	const messageId = nanoid();
	return {
		id: messageId,
		nanoid: messageId,
		date: new Date().toLocaleString(),
		role: "user",
		content: "",
		toolMessages: [],
		image_url: [],
		...override,
	};
}
