import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";
import { BaseLanguageModel } from "@langchain/core/language_models/base";

export const createRAGChain = (model: BaseLanguageModel) => {
	const template = `Context: {context}

Question: {question}

Please answer the question based on the given context. If the context doesn't provide enough information to answer the question, please state that you don't have enough information.

Answer:`;

	const prompt = PromptTemplate.fromTemplate(template);

	return new LLMChain({
		llm: model,
		prompt,
	});
};
