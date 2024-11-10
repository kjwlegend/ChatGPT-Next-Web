import { Tool } from "@langchain/core/tools";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { Embeddings } from "@langchain/core/embeddings";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import axios from "axios";
import * as cheerio from "cheerio";

export class WebBrowserTool extends Tool {
	name = "web-browser";
	description =
		"Useful for when you need to find something on or summarize a webpage. Input should be a comma separated list of 'valid URL including protocol','what you want to find on the page or empty string for a summary'";

	private model: BaseLanguageModel;
	private embeddings: Embeddings;

	constructor({
		model,
		embeddings,
	}: {
		model: BaseLanguageModel;
		embeddings: Embeddings;
	}) {
		super();
		this.model = model;
		this.embeddings = embeddings;
	}

	/** @ignore */
	async _call(input: string): Promise<string> {
		try {
			// 解析输入
			const [url, task = ""] = input.split(",").map((x) => x.trim());
			if (!url) throw new Error("URL is required");

			// 获取网页内容
			const response = await axios.get(url);
			const html = response.data;
			const $ = cheerio.load(html);

			// 清理文本
			$("script, style, nav, footer, header").remove();
			const text = $("body").text().replace(/\s+/g, " ").trim();

			// 分割文本
			const splitter = new RecursiveCharacterTextSplitter({
				chunkSize: 2000,
				chunkOverlap: 200,
			});
			const docs = await splitter.createDocuments([text]);

			// 创建向量存储
			const vectorStore = await MemoryVectorStore.fromDocuments(
				docs,
				this.embeddings,
			);

			let relevantDocs: Document[];
			if (task) {
				// 如果有特定任务，查找相关内容
				relevantDocs = await vectorStore.similaritySearch(task, 3);
			} else {
				// 否则使用所有文档
				relevantDocs = docs;
			}

			// 构建提示
			const content = relevantDocs.map((doc) => doc.pageContent).join("\n");
			const prompt = task
				? `Based on the following content, answer the question or find the information about: ${task}\n\nContent: ${content}`
				: `Summarize the following content:\n\nContent: ${content}`;
			// 获取 AI 响应
			const aiResponse = await this.model.invoke(prompt);

			// 构造结构化输出
			const result = {
				// content: aiResponse,
				references: [
					{
						title: $("title").text() || url,
						url: url,
						snippet: aiResponse,
					},
				],
			};

			return JSON.stringify(result);
		} catch (error) {
			console.error("[WebBrowserTool] Error:", error);
			throw error;
		}
	}
}
