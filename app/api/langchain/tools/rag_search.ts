import { Tool } from "@langchain/core/tools";
import { CallbackManagerForToolRun } from "@langchain/core/callbacks/manager";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { formatDocumentsAsString } from "langchain/util/document";
import { Embeddings } from "@langchain/core/embeddings";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

import { getServerSideConfig } from "@/app/config/server";
import { MyScaleStore } from "@langchain/community/vectorstores/myscale";

export class RAGSearch extends Tool {
	static lc_name() {
		return "RAGSearch";
	}

	get lc_namespace() {
		return [...super.lc_namespace, "ragsearch"];
	}

	private sessionId: string;
	private model: BaseLanguageModel;
	private embeddings: Embeddings;

	constructor(
		sessionId: string,
		model: BaseLanguageModel,
		embeddings: Embeddings,
	) {
		super();
		this.sessionId = sessionId;
		this.model = model;
		this.embeddings = embeddings;
	}

	/** @ignore */
	async _call(inputs: string, runManager?: CallbackManagerForToolRun) {
		const serverConfig = getServerSideConfig();
		if (!serverConfig.isEnableRAG)
			throw new Error("env ENABLE_RAG not configured");

		const vectorStore = await MyScaleStore.fromExistingIndex(this.embeddings, {
			host: process.env.MYSCALE_HOST || "",
			port: process.env.MYSCALE_PORT || "",
			username: process.env.MYSCALE_USERNAME || "",
			password: process.env.MYSCALE_PASSWORD || "",
			database: process.env.MYSCALE_DATABASE || "default",
			table: "vector_table",
		});

		let context;
		const returnCount = serverConfig.ragReturnCount
			? parseInt(serverConfig.ragReturnCount, 10)
			: 4;
		console.log("[rag-search]", {
			inputs,
			returnCount,
			sessionId: this.sessionId,
		});

		const results = await vectorStore.similaritySearch(inputs, returnCount, {
			whereStr: `metadata.sessionId = ${this.sessionId}`,
		});
		context = formatDocumentsAsString(results);
		console.log("[rag-search]", { context });
		return context;
	}

	name = "rag-search";

	description = `It is used to query documents entered by the user.The input content is the keywords extracted from the user's question, and multiple keywords are separated by spaces and passed in.`;
}
