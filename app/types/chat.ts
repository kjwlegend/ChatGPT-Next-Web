import { RequestMessage } from "../client/api";
import { FileInfo } from "../client/platforms/utils";
import { ModelType } from "../store";
import { Mask } from "./mask";

export type ChatMessage = RequestMessage & {
	date: string;
	id: string;
	chat_id?: string;
	nanoid?: string;
	model?: ModelType;
	image_url?: string[];
	mjstatus?: MJMessage;
	toolMessages?: ChatToolMessage[];
	streaming?: boolean;
	isError?: boolean;
	preview?: boolean;
	isFinished?: boolean;
	token_counts_total?: number;
	lastUpdateTime?: number;
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
}

export interface ChatSession {
	id: string;
	session_id: string;
	topic: string;
	memoryPrompt: string;
	messages: ChatMessage[];
	stat: ChatStat;
	lastUpdateTime: any;
	lastSummarizeIndex: number;
	clearContextIndex?: number;
	mask: Mask;
	responseStatus?: boolean;
	isworkflow?: boolean;
	mjConfig: MjConfig;
	chat_count?: number;
	isDoubleAgent?: boolean;
	created_at?: string;
	updated_at?: string;

	attachFiles?: FileInfo[];

	[key: string]: any;
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
