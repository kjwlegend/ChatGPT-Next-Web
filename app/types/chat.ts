import { RequestMessage } from "../client/api";
import { ModelType } from "../store";
import { Mask } from "./mask";

export type ChatMessage = RequestMessage & {
	date: string;
	id: string;
	model?: ModelType;
	image_url?: string;
	mjstatus?: MJMessage;
	toolMessages?: ChatToolMessage[];
	streaming?: boolean;
	isError?: boolean;
	preview?: boolean;
	isFinish?: boolean;
	[key: string]: any;
};

export interface ChatToolMessage {
	toolName: string;
	toolInput?: string;
}

export type MjConfig = {
	size: string;
	quality: string;
	stylize: string;
	model: string;
	speed?: string;
	seed?: string;
};

export interface ChatStat {
	tokenCount: number;
	wordCount: number;
	charCount: number;
}

export interface ChatSession {
	id: string;
	topic: string;
	memoryPrompt: string;
	messages: ChatMessage[];
	stat: ChatStat;
	lastUpdate: number;
	lastSummarizeIndex: number;
	clearContextIndex?: number;
	mask: Mask;
	responseStatus?: boolean;
	isworkflow?: boolean;
	mjConfig: MjConfig;
	chat_count?: number;
	isDoubleAgent?: boolean;
}

export interface MJMessage {
	action: string;
	description: string;
	failReason: string;
	finishTime: number;
	id: string;
	imageUrl: string;
	progress: string;
	prompt: string;
	promptInput?: string;
	promptEn: string;
	properties: Record<string, unknown>;
	startTime: number;
	state: string;
	status: string;
	submitTime: number;
}
