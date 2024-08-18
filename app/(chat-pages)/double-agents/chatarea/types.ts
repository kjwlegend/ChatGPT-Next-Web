export interface AIConfig {
	id: number;
	name: string;
	description: string;
	modelConfig: {
		model: string;
		temperature: number;
		top_p: number;
		presence_penalty: number;
		frequency_penalty: number;
	};
	plugins: string[];
}

export interface MultiAgentChatSession {
	id: string;
	aiConfigs: AIConfig[];
}
