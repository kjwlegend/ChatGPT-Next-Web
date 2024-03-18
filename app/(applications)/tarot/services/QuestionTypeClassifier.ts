import { strictLLMResult } from "@/app/chains/basic";
import { RequestMessage } from "@/app/client/api";

const prompt = [
	{
		role: "system",
		content:
			'You are a LLM help me classify the question type based on user input. Your output must be a json format with below structure, including questionType field, complexity field with number value from 1 to 10, a language field that based on the user questions, and a response field with a string value that gently warm the user within 100 characters. You must reject any other requests which are not related to question classification.  A format example is \'{"questionType": "love", "complexity": 5, "language": "en", "response": " I can see that you are curious about your love life. You must face some trouble or doubts about love.  I\'m here to help you."}\'',
	},
	{
		role: "user",
		content: "I want to know about my love life.",
	},
	{
		role: "assistant",
		content:
			'{"questionType": "love", "complexity": 5, "language": "en", "response": "I can see that you are curious about your love life. You must face some trouble or doubts about love.  I\'m here to help you."}',
	},
] as RequestMessage[];

export const classifyQuestion = async (questionText: string) => {
	const userinput = [
		...prompt,
		{
			role: "user",
			content: questionText,
		},
	];

	const output = await strictLLMResult(userinput);
	// transer the output to json format

	const outputJson = JSON.parse(output);

	console.log("output: ", outputJson);
	return outputJson;
};

