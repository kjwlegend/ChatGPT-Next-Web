import { useUserStore } from "@/app/store/user";
import { RequestMessage, api } from "../client/api";

import Locale, { getLang } from "../locales";
import { ModelConfig } from "../store";

export function getUserInfo() {
	const user = useUserStore.getState().user;
	const gender =
		user.gender === "0" ? "未知" : user.gender === "1" ? "男" : "女";
	const zodiac = user.zodiac === "" ? "未知" : user.zodiac;
	const nickname = user.nickname === "" ? "神秘人" : user.nickname;

	const userData = {
		nickname,
		gender,
		zodiac,
		birthday: user.birthday === "" ? "未知" : user.birthday,
	};
	return userData;
}

export const DEFAULT_INPUT_TEMPLATE = `{{input}}`; // input / time / model / lang
export const DEFAULT_SYSTEM_TEMPLATE = "";

export function getDefaultSystemTemplate() {
	const vars = {
		time: new Date().toLocaleString(),
		lang: getLang(),
	};

	return `
# Output background
Output Lang: ${vars.lang}
Current time: ${vars.time}`;
}

function getUserInfoTemplate() {
	const user = getUserInfo();

	const { nickname, gender, zodiac, birthday } = user;

	return `
## User Info
- 用户的名字是: ${nickname}
- 性别是 : ${gender}
- 星座是 : ${zodiac}
- 生日是 : ${birthday} 
Your answers must be related to the user's information.
  `;
}

function generateRelatedQuestions(): string {
	return `
## Related Questions rules
每次回答之后, 根据用户最开始的<问题>和你给出的答案, 你需要在<回答>的末尾, 以列表的的形式提出6个相关<问题>, 方便用户进行下一轮的对话. 再给出<问题> 前, 首先说 "我猜你还想问: " 或者 "我猜你还想知道: " 或者 "我猜你还想了解" .  使用换行符, 来区分你的回答和你的问题.
`;
}

function insertPromptVariables(variablelist: object) {
	let output = "";

	Object.entries(variablelist).forEach(([name, value]) => {
		output += `{{${name}}}: {{${value}}}\n`;
	});
	return output;
}

interface PromptVariables {
	injectUserInfo: boolean;
	injectRelatedQuestions: boolean;
}

// 填充模板函数
export function fillTemplateWith(
	input: string,
	injectSetting?: PromptVariables,
	PromptVariables?: Record<string, string>,
): string {
	injectSetting = {
		injectUserInfo: false,
		injectRelatedQuestions: false,
		...injectSetting,
	};

	const userTemplate = injectSetting.injectUserInfo
		? getUserInfoTemplate()
		: "";
	const relatedQuestionsTemplate = injectSetting.injectRelatedQuestions
		? generateRelatedQuestions()
		: "";

	let output = `
	
${getDefaultSystemTemplate()}
${userTemplate}
${relatedQuestionsTemplate}
---------------------

	`;

	return output;
}
