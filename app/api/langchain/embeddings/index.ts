import { OpenAIEmbeddings } from "@langchain/openai";
import { LangchainConfig } from "../config";
import { getServerSideConfig } from "@/app/config/server";

export const getEmbeddings = (apiKey: string, baseUrl: string) => {
	return new OpenAIEmbeddings(
		{
			modelName:
				getServerSideConfig().ragEmbeddingModel ?? "text-embedding-3-large",
			openAIApiKey: apiKey,
		},
		{ basePath: baseUrl },
	);
};
