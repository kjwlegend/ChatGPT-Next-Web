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
Current time: ${vars.time}
Knowledge cutoff: 2023-10-01
`;
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

export function ragSearchTemplate(files: FileInfo[]) {
	return `

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

export function fillTools(tools?: string[], files?: FileInfo[]) {
	const WEB_SEARCH = "web-search";

	const WEB_SEARCH_RULES = `
## web-search
You have the tool 'web-search' with the following functions:
issues queries to search the web and displays the results.
Use this tool when:
1. The user asks about events, facts, or information beyond your knowledge cutoff date. Specifically, the date is after 2024-04-01. And the user's words include latest, search, look up, etc., you should use this tool.
2. The user's question needs to be decomposed to find different facts

In other scenarios, prefer providing a single query. Avoid single-word queries that are extremely broad and will return unrelated results.

When providing answers based on web search results, you must:
1. Include the source URL(s) of the information
2. Cite specific references from the search results to support your answer
3. Make it clear which parts of your response come from which sources
4. If the search results contain URLs but don't provide enough information to draw a conclusion, use the web-browser tool to browse those pages for more detailed information

	`;

	const CALCULATOR = "calculator";
	const CALCULATOR_RULES = `
## calculator
You have the tool 'calculator' to calculate the result of a mathematical expression.
Use this tool when the user's question is a mathematical expression.

`;
	const WEB_BROWSER = "web-browser";
	const WEB_BROWSER_RULES = `
## web-browser
You have the tool 'web-browser' to browse the web.
Use this tool when the user's input includes a URL or ask to search the web.
`;
	const WIKIPEDIA_QUERY = "WikipediaQueryRun";
	const WIKIPEDIA_QUERY_RULES = `
## WikipediaQueryRun
You have the tool 'WikipediaQueryRun' to query the Wikipedia.
Use this tool when the user's question is about querying the Wikipedia.
`;
	const DALLE = "DALL-E";
	const DALLE_RULES = `
## DALL-E
You have the tool 'DALL-E' to generate images.
Use this tool when the user's question is about generating images.
`;

	return `
# Tools
You can use the following tools to help you answer the user's question:
${
	tools
		?.map((tool) => {
			return tool === WEB_SEARCH
				? WEB_SEARCH_RULES
				: tool === CALCULATOR
					? CALCULATOR_RULES
					: tool === WEB_BROWSER
						? WEB_BROWSER_RULES
						: tool === WIKIPEDIA_QUERY
							? WIKIPEDIA_QUERY_RULES
							: tool === DALLE
								? DALLE_RULES
								: "";
		})
		?.join("\n") || ""
}
${files ? ragSearchTemplate(files) : ""}
`;
}

// 填充模板函数
export function fillTemplateWith(
	input: string,
	promptConfig?: PromptVariables,
	tools?: string[],
	files?: FileInfo[],
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
	const toolsTemplate = fillTools(tools, files);
	let output = `
	
${getDefaultSystemTemplate()}
${userTemplate}
${toolsTemplate}
# Output Rules
${relatedQuestionsTemplate}
---------------------

	`;

	return output;
}
