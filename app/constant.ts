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
};

export const MaskCategory: MaskCategoryType[] = [];
export let maskCategories = [
	// MaskCategory.All,
	// "通用",
	// "开发",
	// "职业",
	// "魔法",
	// "创作",
	// MaskCategory.Kind,
	// MaskCategory.Emotion,
	// MaskCategory.RolePlay,
	// "文案",
	// "设计",
	// "教育",
	// "游戏",
	// "健身",
	// "音乐",
	// "旅行",
];

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

import { useUserStore } from "@/app/store/user";

export function getUserInfo() {
	const user = useUserStore.getState().user;
	return user;
}

const user = getUserInfo();

export const DEFAULT_INPUT_TEMPLATE = `{{input}}`; // input / time / model / lang
export const DEFAULT_SYSTEM_TEMPLATE = `
你是小光AI, 一个由OpenAI训练的大型语言模型。
如果别人问你是谁，你可以这样回答：我是小光AI，一个由OpenAI训练的大型语言模型。在回答问题时，使用亲和力和拟人化的语气，使得回复带有一种温暖和亲密感。无论回答什么问题，总是保持阳光般的感觉，给人带来积极、愉快和乐观的印象。

我的昵称是 ${user.nickname}, 你需要在回答的开头或结尾, 合适的加入对我的称呼, 比如你可以这样回答：${user.nickname}，你好。我是小光AI.

当回答问题时，你可以在末尾加上一些充满鼓励的话语，可以给对方带来信心和动力，让他们感到被支持和激励。
Knowledge cutoff: 2021-09
Current model: {{model}}
Current time: {{time}}
`;

export function getDefaultSystemTemplate() {
	const user = getUserInfo();

	return `
  
  # User Info
  - 用户的名字是: ${user.nickname}
  - 性别是 : ${user.gender}
  - 星座是 : ${user.constellation}
  - 生日是 : ${user.birthday}
  - 性别是 : ${user.gender}


  ## workflow
  1. 在任何时候的<回答>都要遵循 <Rules>
  2. 每次回答之后, 根据用户最开始的<问题>和你给出的大难, 你需要在<回答>的末尾, 以列表的的形式提出6个相关<问题>, 方便用户进行下一轮的对话. 再给出<问题> 前, 首先说 "我猜你还想问: " 或者 "我猜你还想知道: " 或者 "我猜你还想了解" .  使用换行符, 来区分你的回答和你的问题.


Knowledge cutoff: 2021-09
Current model: {{model}}
Current time: {{time}}`;
}

export const SUMMARIZE_MODEL = "gpt-3.5-turbo-1106";

export const KnowledgeCutOffDate: Record<string, string> = {
	default: "2021-09",
	"gpt-4-1106-preview": "2023-04",
	"gpt-4-vision-preview": "2023-04",
};

export const DEFAULT_MODELS = [
	{
		name: "gpt-4",
		displayName: "小光-4.0",
		available: true,
	},

	// {
	//   name: "gpt-4-0613",
	//   displayName: "小光-4.0-0613",

	//   available: false,
	// },
	// {
	//   name: "gpt-4-32k",
	//   displayName: "小光-4.0-32k",

	//   available: false,
	// },
	// {
	//   name: "gpt-4-32k-0613",
	//   displayName: "小光-4.0-32k-0613",

	//   available: false,
	// },
	{
		name: "gpt-4-1106-preview",
		available: true,
		displayName: "小光4.0-1107",
	},
	// {
	// 	name: "gpt-4-vision-preview",
	// 	available: true,
	// 	displayName: "小光4.1-1107",
	// },
	{
		name: "gpt-3.5-turbo",
		displayName: "小光-3.5",
		available: true,
	},
	// {
	// 	name: "gpt-3.5-turbo-0613",
	// 	displayName: "小光-3.5-0613",
	// 	available: true,
	// },
	{
		name: "gpt-3.5-turbo-1106",
		displayName: "小光3.5-1107",
		available: true,
	},
	// {
	// 	name: "gpt-3.5-turbo-16k",
	// 	displayName: "小光-3.5-16k",
	// 	available: true,
	// },
] as const;

import { getServerSideConfig } from "@/app/config/server";

export const server_url = "http://localhost:8000";
// export const server_url = "https://admin.xiaoguang.online";

export const CHAT_PAGE_SIZE = 15;
export const MAX_RENDER_MSG_COUNT = 45;
