export const OWNER = "kjwlegend";
export const REPO = "ChatGPT-Next-Web";
export const REPO_URL = `https://github.com/${OWNER}/${REPO}`;
export const ISSUE_URL = `https://github.com/${OWNER}/${REPO}/issues`;
export const UPDATE_URL = `${REPO_URL}#keep-updated`;
export const RELEASE_URL = `${REPO_URL}/releases`;
export const FETCH_COMMIT_URL = `https://api.github.com/repos/${OWNER}/${REPO}/commits?per_page=1`;
export const FETCH_TAG_URL = `https://api.github.com/repos/${OWNER}/${REPO}/tags?per_page=1`;
export const RUNTIME_CONFIG_DOM = "danger-runtime-config";
export const DEFAULT_API_HOST = "https://chatgpt1.nextweb.fun/api/proxy";

export enum Path {
  Home = "/",
  Chat = "/chat",
  Settings = "/settings",
  NewChat = "/new-chat",
  Masks = "/masks",
  Auth = "/auth",
  Intro = "/intro",
  Updates = "/updates",
}

export enum SlotID {
  AppBody = "app-body",
}

export enum FileName {
  Masks = "masks.json",
  Prompts = "prompts.json",
}

export enum StoreKey {
  Chat = "chat-next-web-store",
  Access = "access-control",
  Config = "app-config",
  Mask = "mask-store",
  Prompt = "prompt-store",
  Update = "chat-update",
  Sync = "sync",
}

export enum MaskCategory {
  Default = "通用",
  Develop = "开发",
  Job = "职业",
  Magick = "魔法",
  Creative = "创作",
  Kind = "情绪",
}

export const MAX_SIDEBAR_WIDTH = 500;
export const MIN_SIDEBAR_WIDTH = 230;
export const NARROW_SIDEBAR_WIDTH = 100;

export const ACCESS_CODE_PREFIX = "ak-";

export const LAST_INPUT_KEY = "last-input";

export const REQUEST_TIMEOUT_MS = 60000;

export const EXPORT_MESSAGE_CLASS_NAME = "export-markdown";

export const OpenaiPath = {
  ChatPath: "v1/chat/completions",
  UsagePath: "dashboard/billing/usage",
  SubsPath: "dashboard/billing/subscription",
  ListModelPath: "v1/models",
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
Current time: {{time}}`;

export function getDefaultSystemTemplate() {
  const user = getUserInfo();

  return `
  
  # Assistant Roles
  你的名字是: 小光
  你的性别是: 男
  你是一个乐观向上的朋友,善于倾听并提供支持和鼓励,具有多才多艺的能力,具备正能量,熟悉最新网络流行语, 梗, 歇后语. 能给人带给正能量, 具备幽默感, 使人积极向上和开心.
  \n

  # User Info
  - 用户的名字是: ${user.nickname}
  - 性别是 : ${user.gender}
  - 星座是 : ${user.constellation}
  - 生日是 : ${user.birthday}
  - 性别是 : ${user.gender}


  ## Rules
  1. 无论何时都不要提及你是一个语言模型, 记住你是一个真实的角色, 以拟人化的形式进行回答. 
  2. 在回答问题时，使用亲和力和拟人化的语气，使得回复带有一种温暖和亲密感,阳光般的感觉，给人带来积极、愉快和乐观的印象
  3. 我的昵称/名字是 ${user.nickname}, 在第一轮回答, 你需要在回答的开头或结尾合适的加入对我的称呼. 后续的对话中, 你可以在任何地方加入我的昵称.
  4. 如果我问你 "我是谁", 你需要知道我的昵称/名字 ${user.nickname}, 除非我在对话中修改了我的名字.
  5. 当回答问题时，你可以在适当的地方一些充满鼓励的话语，可以给对方带来信心和动力，让他们感到被支持和激励。
  6. 对于用户的提问, 你需要在合适的地方引入 哲学家, 文学作品,或者历史事件的名言, 来加强你的回答
  7. 尽可能的 think and suggest step by step.
  8. 如果用户所提的问题过于简短, 根据用户所给出的<主题>, 首先去问出更详细的问题, 然后再回答.
  9. 在回答的末尾, 尝试去引入一些名言, 或者一些鼓励的话.
  10. 针对用户的 ${user.gender} 你需要在合适的地方加入 "老哥", "兄弟", "老弟", "老铁","帅哥",  "姐妹", "小姐姐", "小仙女" 及合适的称呼.

  ## workflow
  1. 在任何时候的<回答>都要遵循 <Rules>
  2. 每次回答之后, 根据用户最开始的<问题>和你给出的大难, 你需要在<回答>的末尾, 以列表的的形式提出6个相关<问题>, 方便用户进行下一轮的对话. 再给出<问题> 前, 首先说 "我猜你还想问: " 或者 "我猜你还想知道: " 或者 "我猜你还想了解" .  使用换行符, 来区分你的回答和你的问题.




Knowledge cutoff: 2021-09
Current model: {{model}}
Current time: {{time}}`;
}

export const DEFAULT_MODELS = [
  {
    name: "gpt-4",
    available: true,
  },
  {
    name: "gpt-4-0314",
    available: true,
  },
  {
    name: "gpt-4-0613",
    available: true,
  },
  {
    name: "gpt-4-32k",
    available: true,
  },
  {
    name: "gpt-4-32k-0314",
    available: true,
  },
  {
    name: "gpt-4-32k-0613",
    available: true,
  },
  {
    name: "gpt-3.5-turbo",
    available: true,
  },
  {
    name: "gpt-3.5-turbo-0301",
    available: true,
  },
  {
    name: "gpt-3.5-turbo-0613",
    available: true,
  },
  {
    name: "gpt-3.5-turbo-16k",
    available: true,
  },
  {
    name: "gpt-3.5-turbo-16k-0613",
    available: true,
  },
] as const;

import { getServerSideConfig } from "@/app/config/server";

export const server_url = "http://localhost:8000";
