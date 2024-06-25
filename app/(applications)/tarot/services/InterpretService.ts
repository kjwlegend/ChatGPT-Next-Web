import { strictLLMResult } from "@/app/chains/basic";
import { RequestMessage } from "@/app/client/api";
import { TarotCardType } from "../types/TarotCard";
import { TarotSpread } from "../types/TarotSpread";
// 定义TarotCard类型

// 构建塔罗牌解释的prompt
const tarotPrompt = [
	{
		role: "system",
		content:
			"You are a LLM that provides detailed interpretations of tarot cards based on their positions in a spread, the spread name, and a specific user question. Your output must be a string value containing the interpretation of the card. ",
	},
	// 这里将添加更多的消息对象
] as RequestMessage[];

// 新增解释塔罗牌的函数
export const interpretTarotCard = async (
	spreadName: string,
	positionMeaning: string,
	card: TarotCardType,
	userQuestion: string,
	language: string,
) => {
	// 构建用户输入
	const userInput: RequestMessage[] = [
		...tarotPrompt,
		{
			role: "user",
			content: `Please interpret the card "${card.name} ${
				card.isReversed ? "Reversed" : "Upright"
			}" in the "${positionMeaning}" position of a "${spreadName}" spread for the user question: "${userQuestion}". You must connect the user question to card interpretation in a clear and specific manner, providing actionable advice based on the card's meaning and the user's situation. Please provide the interpretation in ${language}.`,
		},
	];

	const model = "gpt-3.5-turbo-0125";

	// 调用LLM服务
	const output = await strictLLMResult(userInput, model);
	// 输出结果
	// console.log("Tarot card interpretation: ", output);
	return output;
};

// 构建牌阵解释的prompt
const tarotSpreadPrompt = [
	{
		role: "system",
		content:
			"You are a LLM that provides detailed interpretations of tarot spreads based on the spread name, card positions, cards, and a specific user question. Your output must be a string value containing the interpretation of the spread. You must reject any other requests which are not related to tarot spread interpretation. You don't need to provide the card interpretation in this task, but just the spread interpretation overvall related to the user question.",
	},
	// 这里将添加更多的消息对象
] as RequestMessage[];

// 新增解释牌阵的函数
export const interpretTarotSpread = async (
	tarotSpread: TarotSpread,
	userQuestion: string,
	language: string = "zh",
) => {
	// 构建用户输入
	const userInput: RequestMessage[] = [
		...tarotSpreadPrompt,
		{
			role: "user",
			content: `Please interpret the "${
				tarotSpread.name
			}" tarot spread for the question: "${userQuestion}". ${tarotSpread.positions
				.map(
					(position, index) =>
						`Position ${index + 1}: "${position.meaning}", Card: "${
							position.card?.name
						} - ${position.card?.isReversed ? "Reversed" : "Upright"} - ${
							position.card?.isReversed
								? position.card?.meaningReversed
								: position.card?.meaningPositive
						}"`,
				)
				.join(" ")}.
		You must connect each position and card interpretation to the user's question in a clear and specific manner, providing actionable advice based on each card's meaning and the user's situation. Please provide the interpretation in ${language}.`,
		},
	];

	const model = "gpt-4o";

	// 调用LLM服务
	const output = await strictLLMResult(userInput, model);
	// 输出结果
	// console.log("Tarot spread interpretation: ", output);
	return output;
};
