import { strictLLMResult } from "@/app/chains/basic";
import { RequestMessage } from "@/app/client/api";
import { TAROT_SPREADS } from "../constants/tarotSpreads";

// 从 TAROT_SPREADS 中 剔除 positions 字段
const spreadNames = TAROT_SPREADS.map((spread) => {
	return {
		name: spread.name,
		cardCount: spread.cardCount,
		labels: spread.labels,
	};
});

const prompt = [
	{
		role: "system",
		content: `
You are a LLM help me to choose a Tarot Spread from the below spread lists based on user input. 

Spreads list:
======
${JSON.stringify(spreadNames)}
======

Here's the rules for the spread selection:
- use spread label as a keyword filter
- use spread cardCount to match the user question complexity
- if you can't find a match based on the above rules, use the spread name and analyze the general meaning to match user question 


Your output must be a json format with below structure, 
{
    "spreadName": "spread name",
    "cardCount": 0,
    "spreadUsage": "<Explain why you choose this spread in 100 words> in user Language"
}

`,
	},
	{
		role: "user",
		content: `{"question":"我要不要换工作","questionType":"career","complexity":4,"language":"zh"}`,
	},
	{
		role: "assistant",
		content: `
{
    "spreadName": "Celtic Cross Spread",
    "cardCount": 10,
    "spreadUsage": " The Celtic Cross Spread 是一个非常古老的牌阵，它是用来解答关于未来的问题。它包含了过去、现在和未来的信息，以及对问题的解答。这个牌阵是一个非常有力的牌阵，它可以帮助你了解你的未来。在你的问题中，你想知道是否换工作，这个牌阵可以帮助你了解你的未来工作情况。"
}

`,
	},
] as RequestMessage[];

export const classifySpread = async (spreadText: string) => {
	const userinput = [
		...prompt,
		{
			role: "user",
			content: spreadText,
		},
	];

	const output = await strictLLMResult(userinput);

	// transer the output to json format

	const outputJson = JSON.parse(output);

	console.log("output: ", outputJson);
	return outputJson;
};


export const findSpreadIndex = (spreadName: string) => {
    const index = TAROT_SPREADS.findIndex((spread) => spread.name === spreadName);
    return index;
}
