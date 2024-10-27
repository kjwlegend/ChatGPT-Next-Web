import { ChatOpenAI } from "@langchain/openai";
import { getServerSideConfig } from "@/app/config/server";

export const getChatModel = (
	apiKey: string,
	baseUrl: string,
	modelName: string,
	temperature: number,
	streaming: boolean = false,
) => {
	const serverConfig = getServerSideConfig();

	if (serverConfig.isAzure) {
		return new ChatOpenAI({
			temperature,
			streaming,
			azureOpenAIApiKey: apiKey,
			azureOpenAIApiVersion: serverConfig.azureApiVersion,
			azureOpenAIApiDeploymentName: modelName,
			azureOpenAIBasePath: baseUrl,
		});
	} else {
		return new ChatOpenAI(
			{
				modelName,
				openAIApiKey: apiKey,
				temperature,
				streaming,
			},
			{ basePath: baseUrl },
		);
	}
};
