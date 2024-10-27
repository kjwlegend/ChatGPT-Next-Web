import { useUserStore } from "@/app/store/user";
import { RequestMessage, api } from "../client/api";

import Locale, { getLang } from "../locales";
import { ModelConfig } from "../store";
import { FileInfo } from "../client/platforms/utils";

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
	promptConfig?: PromptVariables,
	PromptVariables?: Record<string, string>,
): string {
	const injectSetting = {
		injectUserInfo: true,
		injectRelatedQuestions: true,
		...promptConfig,
	};

	console.log("inject setting", injectSetting);
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

export function ragSearchTemplate(files: FileInfo[]) {
	return `

	# Tools
	
	## rag-search
	
	You have the tool 'rag-search' with the following functions:
	issues queries to search the file(s) uploaded in the current conversation and displays the results.
	
	This tool is for browsing the files uploaded by the user.
	
	Parts of the documents uploaded by users will be automatically included in the conversation. Only use this tool when the relevant parts don't contain the necessary information to fulfill the user's request.
	
	If the user needs to summarize the document, they can summarize it through parts of the document.
	
	Think carefully about how the information you find relates to the user's request. Respond as soon as you find information that clearly answers the request.
	
	Issue multiple queries to the 'rag-search' command only when the user's question needs to be decomposed to find different facts. In other scenarios, prefer providing a single query. Avoid single-word queries that are extremely broad and will return unrelated results.
	
	Here are some examples of how to use the 'rag-search' command:
	User: What was the GDP of France and Italy in the 1970s? => rag-search(["france gdp 1970", "italy gdp 1970"])
	User: What does the report say about the GPT4 performance on MMLU? => rag-search(["GPT4 MMLU performance"])
	User: How can I integrate customer relationship management system with third-party email marketing tools? => rag-search(["customer management system marketing integration"])
	User: What are the best practices for data security and privacy for our cloud storage services? => rag-search(["cloud storage security and privacy"])
	
	The user has uploaded the following files:
	${files.map((file) => {
		return `filename: \`${file.originalFilename}\`
partialDocument: \`\`\`
${file.partial}
\`\`\``;
	})}
`;
}
