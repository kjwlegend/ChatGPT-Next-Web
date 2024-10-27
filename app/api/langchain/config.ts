import { getServerSideConfig } from "@/app/config/server";

export const LangchainConfig = {
	getOpenAIApiKey: (token: string) => {
		const serverConfig = getServerSideConfig();
		const isApiKey = !token.startsWith(process.env.ACCESS_CODE_PREFIX || "");
		let apiKey = serverConfig.apiKey;
		if (isApiKey && token) {
			apiKey = token;
		}
		return apiKey;
	},

	getOpenAIBaseUrl: (reqBaseUrl?: string) => {
		const serverConfig = getServerSideConfig();
		let baseUrl = "https://api.openai.com/v1";
		if (serverConfig.baseUrl) baseUrl = serverConfig.baseUrl;
		if (reqBaseUrl?.startsWith("http://") || reqBaseUrl?.startsWith("https://"))
			baseUrl = reqBaseUrl;
		if (!baseUrl.endsWith("/v1"))
			baseUrl = baseUrl.endsWith("/") ? `${baseUrl}v1` : `${baseUrl}/v1`;
		return baseUrl;
	},

	getRagConfig: () => {
		const serverConfig = getServerSideConfig();
		return {
			chunkSize: serverConfig.ragChunkSize
				? parseInt(serverConfig.ragChunkSize, 10)
				: 2000,
			chunkOverlap: serverConfig.ragChunkOverlap
				? parseInt(serverConfig.ragChunkOverlap, 10)
				: 200,
			returnCount: serverConfig.ragReturnCount
				? parseInt(serverConfig.ragReturnCount, 10)
				: 4,
		};
	},

	isRagEnabled: () => {
		const serverConfig = getServerSideConfig();
		return serverConfig.isEnableRAG || false;
	},
};
