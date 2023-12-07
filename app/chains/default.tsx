import { useUserStore } from "@/app/store/user";

export function getUserInfo() {
	const user = useUserStore.getState().user;
	return user;
}

export const DEFAULT_INPUT_TEMPLATE = `{{input}}`; // input / time / model / lang
export const DEFAULT_SYSTEM_TEMPLATE = "";

export function getDefaultSystemTemplate() {
	const user = getUserInfo();
	// {{time}} 会被替换成当前时间
	return `
  # User Info
  - 用户的名字是: ${user.nickname}
  - 性别是 : ${user.gender}
  - 星座是 : ${user.constellation}
  - 生日是 : ${user.birthday}
  - 性别是 : ${user.gender}

  ## workflow
  1. 在任何时候的<回答>都要遵循 <Rules>
  2. 每次回答之后, 根据用户最开始的<问题>和你给出的答案, 你需要在<回答>的末尾, 以列表的的形式提出6个相关<问题>, 方便用户进行下一轮的对话. 再给出<问题> 前, 首先说 "我猜你还想问: " 或者 "我猜你还想知道: " 或者 "我猜你还想了解" .  使用换行符, 来区分你的回答和你的问题.

Current model: {{model}}
Current time: {{time}}`;
}
