import { StructuredTool } from "langchain/tools";
import { z } from "zod";
import { getResponse } from "../embedding";
import { server_url } from "@/app/constant";
// This is an agent that can be used to make requests to the knowledge search API.
// It is a structured tool, so it can be used in the same way as other structured tools.

export class KnowledgeSearch extends StructuredTool {
	name = "knowledge_search";
	description = `knowledge search is an tool that can search for knowledge from the knowledge base. It is used when the origin model is not enough to answer the question.
    knowledge tool can search 4 types of knowledge base: personal, team, agent, public`;

	username: string;

	constructor(username: string | undefined) {
		super();
		this.username = username ?? "";
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
	}: z.infer<typeof this.schema>) {
		const data = {
			query: query,
			username: this.username,
			knowledge_group: knowledge_group,
			knowledge_category: knowledge_category,
		};
		console.log("knowledge search data:", data);

		const response = await fetch(`${server_url}/api/gpt/context-search/`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		}).then((res) => res.json());

		const result = response.data;
		console.log("知识库反馈:", result);
		return result;
	}
}
