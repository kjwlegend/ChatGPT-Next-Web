import { useUserStore } from "@/app/store/user";
import { RequestMessage, api } from "../client/api";
import { SUMMARIZE_MODEL } from "../constant";
import { ChatMessage } from "../store";
import { DoubleAgentChatMessage } from "../store/doubleAgents";
// 定义一个公共函数，它接受 prompt 作为参数
export function strictLLMResult(
	prompt: RequestMessage[] | any,
): Promise<string> {
	// console.log("strictLLMResult: ", prompt);
	const chatOptions = {
		messages: prompt,
		config: {
			temperature: 0.5,
			top_p: 1,
			model: SUMMARIZE_MODEL, // 假设 SUMMARIZE_MODEL 是一个已定义的常量
			stream: false,
		},
	};

	return new Promise<string>((resolve, reject) => {
		api.llm.chat({
			...chatOptions,
			onFinish: (message: string) => {
				// console.log("onFinish: ", message);
				resolve(message); // 使用 resolve 来解析 Promise
			},
			onError: (error: Error) => {
				console.error("onError: ", error);
				reject(error); // 使用 reject 来拒绝 Promise
			},
		});
	});
}
