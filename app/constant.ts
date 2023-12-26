export const OWNER = "kjwlegend";
export const REPO = "ChatGPT-Next-Web";
export const REPO_URL = `https://github.com/${OWNER}/${REPO}`;
export const ISSUE_URL = `https://github.com/${OWNER}/${REPO}/issues`;
export const UPDATE_URL = `${REPO_URL}#keep-updated`;
export const RELEASE_URL = `${REPO_URL}/releases`;
export const FETCH_COMMIT_URL = `https://api.github.com/repos/${OWNER}/${REPO}/commits?per_page=1`;
export const FETCH_TAG_URL = `https://api.github.com/repos/${OWNER}/${REPO}/tags?per_page=1`;
export const RUNTIME_CONFIG_DOM = "danger-runtime-config";

export const DEFAULT_CORS_HOST = "https://ab.nextweb.fun";
export const DEFAULT_API_HOST = `${DEFAULT_CORS_HOST}/api/proxy`;
export const OPENAI_BASE_URL = "https://api.openai.com";

export const LAST_INPUT_IMAGE_KEY = "last-input-image";

export enum Path {
	Home = "/",
	Chat = "/chat",
	Settings = "/settings",
	NewChat = "/new-chat",
	Masks = "/masks",
	Plugins = "/plugins",
	Auth = "/auth",
	Intro = "/intro",
	Updates = "/updates",
}

export enum ApiPath {
	Cors = "/api/cors",
	OpenAI = "/api/openai",
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
}

export const OpenaiPath = {
	ChatPath: "v1/chat/completions",
	UsagePath: "dashboard/billing/usage",
	SubsPath: "dashboard/billing/subscription",
	ListModelPath: "v1/models",
};

export const Azure = {
	ExampleEndpoint: "https://{resource-url}/openai/deployments/{deploy-id}",
};

export const SUMMARIZE_MODEL = "gpt-3.5-turbo-16k";

export const KnowledgeCutOffDate: Record<string, string> = {
	default: "2021-09",
	"gpt-4-1106-preview": "2023-04",
	"gpt-4-vision-preview": "2023-04",
};

export const DEFAULT_MODELS = [
	{
		name: "gpt-4",
		displayName: "小光Pro-(5次/消息)",
		available: true,
	},
	{
		name: "gpt-4-1106-preview",
		available: true,
		displayName: "小光4.0-(5次/消息)",
	},
	{
		name: "gpt-3.5-turbo-1106",
		displayName: "3.5-插件型(1次/消息)",
		available: true,
	},
	{
		name: "gpt-3.5-turbo-16k",
		displayName: "3.5-长文本(1次/消息)",
		available: true,
	},
	{
		name: "gpt-4-vision-preview",
		available: true,
		displayName: "(测试功能-暂不可用)",
	},
] as const;

import { getServerSideConfig } from "@/app/config/server";

// when it's build mode, I want the server_url to be admin.xiaoguang.fun otherwise localhost:8000

export const server_url =
	process.env.ENVIRONMENT == "PROD"
		? "https://admin.xiaoguang.fun"
		: "http://localhost:8000";

// export const server_url = "https://admin.xiaoguang.fun";

// export const server_url = "http://localhost:8000";
export const version = "1.5.0";

export const CHAT_PAGE_SIZE = 15;
export const MAX_RENDER_MSG_COUNT = 45;

console.log(process.env.ENVIRONMENT);
console.log(process.env.ENVIRONMENT == "DEV");

console.log("URL", server_url);
