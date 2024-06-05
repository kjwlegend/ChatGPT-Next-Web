export const OWNER = "kjwlegend";
export const REPO = "ChatGPT-Next-Web";
export const REPO_URL = `https://github.com/${OWNER}/${REPO}`;
export const ISSUE_URL = `https://github.com/${OWNER}/${REPO}/issues`;
export const UPDATE_URL = `${REPO_URL}#keep-updated`;
export const RELEASE_URL = `${REPO_URL}/releases`;
export const FETCH_COMMIT_URL = `https://api.github.com/repos/${OWNER}/${REPO}/commits?per_page=1`;
export const FETCH_TAG_URL = `https://api.github.com/repos/${OWNER}/${REPO}/tags?per_page=1`;
export const RUNTIME_CONFIG_DOM = "danger-runtime-config";

export const DEFAULT_CORS_HOST = "https://ab.nextweb.dev";

export const DEFAULT_API_HOST = "https://api.nextchat.dev";
export const OPENAI_BASE_URL = "https://api.openai.com";
export const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/";
export const ANTHROPIC_BASE_URL = "https://api.anthropic.com";

export const LAST_INPUT_IMAGE_KEY = "last-input-image";

export enum Path {
	Home = "/",
	Chat = "/chat",
	Knowledge = "/knowledge",
	Settings = "/settings",
	NewChat = "/new-chat",
	Masks = "/masks",
	Plugins = "/plugins",
	Auth = "/auth",
	Intro = "/intro",
	Updates = "/updates",
	Paintings = "/paintings",
}

export enum ApiPath {
	Cors = "/api/cors",
	OpenAI = "/api/openai",
	GoogleAI = "/api/google",
	Anthropic = "/api/anthropic",
}

export enum SlotID {
	AppBody = "app-body",
	CustomModel = "custom-model",
}

export enum FileName {
	Masks = "masks.json",
	Plugins = "plugins.json",
	Prompts = "prompts.json",
}

export enum StoreKey {
	Chat = "chat-next-web-store",
	Access = "access-control",
	Config = "app-config",
	Mask = "mask-store",
	Plugin = "plugin-store",
	Prompt = "prompt-store",
	Update = "chat-update",
	Sync = "sync",
}
export type MaskCategoryType = {
	key: string;
	value: string;
	scene: string;
	tags: string[];
};

export const MaskCategory: MaskCategoryType[] = [];
export let maskCategories = [];

export const DEFAULT_SIDEBAR_WIDTH = 300;
export const MAX_SIDEBAR_WIDTH = 500;
export const MIN_SIDEBAR_WIDTH = 230;
export const NARROW_SIDEBAR_WIDTH = 100;

export const ACCESS_CODE_PREFIX = "nk-";

export const LAST_INPUT_KEY = "last-input";
export const UNFINISHED_INPUT = (id: string) => "unfinished-input-" + id;

export const STORAGE_KEY = "chatgpt-next-web";

export const REQUEST_TIMEOUT_MS = 60000;

export const EXPORT_MESSAGE_CLASS_NAME = "export-markdown";

export enum ServiceProvider {
	OpenAI = "OpenAI",
	Azure = "Azure",
	Google = "Google",
	Anthropic = "Anthropic",
}
export enum ModelProvider {
	GPT = "GPT",
	GeminiPro = "GeminiPro",
	Claude = "Claude",
}

export const OpenaiPath = {
	ChatPath: "v1/chat/completions",
	SpeechPath: "v1/audio/speech",
	TranscriptionPath: "v1/audio/transcriptions",
	UsagePath: "dashboard/billing/usage",
	SubsPath: "dashboard/billing/subscription",
	ListModelPath: "v1/models",
};

export const Anthropic = {
	ChatPath: "v1/messages",
	ChatPath1: "v1/complete",
	ExampleEndpoint: "https://api.anthropic.com",
	Vision: "2023-06-01",
};

export const Azure = {
	ExampleEndpoint: "https://{resource-url}/openai/deployments",
};

export const Google = {
	ExampleEndpoint: "https://generativelanguage.googleapis.com/",
	ChatPath: (modelName: string) => `v1beta/models/${modelName}:generateContent`,
};

export const SUMMARIZE_MODEL = "gpt-3.5-turbo-16k";

export const KnowledgeCutOffDate: Record<string, string> = {
	default: "2021-09",
	"gpt-4o": "2023-04",
	"gpt-4-vision-preview": "2023-04",
};

export const DEFAULT_MODELS = [
	{
		name: "gpt-4o",
		available: true,
		displayName: "小光Pro-(5积分/次)",
		provider: {
			id: "openai",
			providerName: "OpenAI",
			providerType: "openai",
		},
	},

	{
		name: "gpt-3.5-turbo",
		displayName: "小光基础(1积分/次)",
		available: true,
		provider: {
			id: "openai",
			providerName: "OpenAI",
			providerType: "openai",
		},
	},
	{
		name: "deepseek-chat",
		available: true,
		displayName: "Deepseek模型(1积分/次)",
		provider: {
			id: "deepseek",
			providerName: "deepseek",
			providerType: "deepseek",
		},
	},
	{
		name: "deepseek-code",
		available: true,
		displayName: "Deepseek编程(1积分/次)",
		provider: {
			id: "deepseek",
			providerName: "deepseek",
			providerType: "deepseek",
		},
	},
	{
		name: "midjourney",
		available: true,
		displayName: "Midjourney(2积分/次)",
		provider: {
			id: "midjourney",
			providerName: "midjourney",
			providerType: "midjourney",
		},
	},
] as const;

import { getServerSideConfig } from "@/app/config/server";

export const oss = "https://xiaoguangai.oss-cn-shanghai.aliyuncs.com";

// const env = getServerSideConfig().server_url;
// console.log("env", env);
// export const server_url = env;
// export const server_url = "https://admin.xiaoguang.fun";

export const server_url = "http://localhost:8000";

export const version = "2.5.0";

export const CHAT_PAGE_SIZE = 15;
export const MAX_RENDER_MSG_COUNT = 45;
