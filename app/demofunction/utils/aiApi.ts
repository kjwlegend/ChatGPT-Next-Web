import {
	AIConfig,
	AIMessage,
	AIRequestBody,
	AIResponseHandler,
} from "../types/ai";

export class AIApi {
	private config: AIConfig;

	constructor(config: AIConfig) {
		this.config = {
			baseURL: "https://oneapi.xiaoguang.fun/v1",
			maxTokens: 1000,
			temperature: 0.7,

			...config,
		};
	}

	async streamChat(
		messages: AIMessage[],
		onResponse: AIResponseHandler,
		signal?: AbortSignal,
	): Promise<void> {
		const requestBody: AIRequestBody = {
			model: this.config.model,
			messages,
			stream: true,
			temperature: this.config.temperature,
			max_tokens: this.config.maxTokens,
		};

		try {
			const response = await fetch(`${this.config.baseURL}/chat/completions`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${this.config.apiKey}`,
				},
				body: JSON.stringify(requestBody),
				signal,
			});

			if (!response.ok) {
				throw new Error(`API request failed: ${response.statusText}`);
			}

			const reader = response.body?.getReader();
			if (!reader) throw new Error("Response body is null");

			const decoder = new TextDecoder();
			let buffer = "";

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split("\n");
				buffer = lines.pop() || "";

				for (const line of lines) {
					if (line.startsWith("data: ")) {
						const data = line.slice(6);
						if (data === "[DONE]") return;
						try {
							onResponse(data);
						} catch (error) {
							console.error("Error processing response:", error);
						}
					}
				}
			}
		} catch (error) {
			if (error.name === "AbortError") {
				console.log("Request aborted");
			} else {
				throw error;
			}
		}
	}

	async chat(messages: AIMessage[]): Promise<string> {
		const requestBody: AIRequestBody = {
			model: this.config.model,
			messages,
			temperature: this.config.temperature,
			max_tokens: this.config.maxTokens,
		};

		const response = await fetch(`${this.config.baseURL}/chat/completions`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${this.config.apiKey}`,
			},
			body: JSON.stringify(requestBody),
		});

		if (!response.ok) {
			throw new Error(`API request failed: ${response.statusText}`);
		}

		const data = await response.json();
		return data.choices[0].message.content;
	}
}
