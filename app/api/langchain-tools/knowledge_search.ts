import { StructuredTool } from "langchain/tools";
import { z } from "zod";
import { getResponse } from "../embedding";
// This is an agent that can be used to make requests to the knowledge search API.
// It is a structured tool, so it can be used in the same way as other structured tools.

export class KnowledgeSearch extends StructuredTool {
	name = "knowledge_search";
	description = `knowledge search is an tool that can search for knowledge from the knowledge base. It is used when the origin model is not enough to answer the question.
    knowledge tool can search 4 types of knowledge base: personal, team, agent, public`;

	constructor() {
		super();
	}

	schema = z.object({
		query: z.string().describe("user questions"),
		knowledge_group: z
			.enum(["personal", "team", "agent", "public"])
			.default("personal")
			.describe("knowledge group"),
		knowledge_category: z
			.enum(["all", "news", "wiki", "qa", "forum"])
			.default("all")
			.describe("knowledge category"),
	});

	/** @ignore */
	async _call({
		query,
		knowledge_group,
		knowledge_category,
		max_results,
	}: z.infer<typeof this.schema>) {
		const data = {
			query: query,
			username: "kjwlegend",
			knowledge_group: knowledge_group,
			knowledge_category: knowledge_category,
		};
		// const response = await getResponse(
		//     data
		//     );
		//     console.log("知识库反馈:", response);

		const response = await fetch(
			"http://localhost:8000/api/gpt/context-search/",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			},
		).then((res) => res.json());

		const result = response.data;
		console.log("知识库反馈:", result);
		return result;
	}
}
