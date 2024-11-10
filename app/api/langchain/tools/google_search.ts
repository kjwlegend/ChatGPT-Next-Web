import { DynamicTool, Tool } from "@langchain/core/tools";

interface SearchResult {
	title: string;
	link: string;
	snippet: string;
}

export class GoogleCustomSearch extends Tool {
	name = "web-search";
	description =
		"A wrapper around Google Custom Search. Input should be a search query.";
	apiKey: string;
	googleCSEId: string;

	constructor(config: { apiKey?: string; googleCSEId?: string }) {
		super();
		this.apiKey = config.apiKey || process.env.GOOGLE_SEARCH_API_KEY || "";
		this.googleCSEId = config.googleCSEId || process.env.GOOGLE_CSE_ID || "";
	}

	/** @ignore */
	async _call(input: string): Promise<string> {
		try {
			const url = new URL("https://proxy.xiaoguang.fun/customsearch/v1");
			url.searchParams.append("key", this.apiKey);
			url.searchParams.append("cx", this.googleCSEId);
			url.searchParams.append("q", input);

			console.log("[GoogleCustomSearch] url", url.toString());
			console.log("[GoogleCustomSearch] input", input);

			const response = await fetch(url.toString());
			const data = await response.json();
			console.log("[GoogleCustomSearch] data", data);

			if (!response.ok) {
				throw new Error(
					`Google Search API error: ${data.error?.message || "Unknown error"}`,
				);
			}

			// 格式化搜索结果
			const results: SearchResult[] =
				data.items?.map((item: any) => ({
					title: item.title,
					link: item.link,
					snippet: item.snippet,
				})) || [];

			// 构造结构化响应
			const responseStructured = {
				type: "reference",

				// 保存完整的引用信息
				references: results.map((result, index) => ({
					title: result.title,
					url: result.link,
					snippet: result.snippet,
					index: index + 1, // 保存引用编号
				})),
			};

			// 为了让 LLM 更容易理解，我们可以格式化最终的字符串
			return JSON.stringify({
				...responseStructured,
			});
		} catch (error) {
			console.error("[GoogleCustomSearch] Error:", error);
			throw error;
		}
	}

	static asDynamicTool(): DynamicTool {
		const googleSearch = new GoogleCustomSearch({});
		return new DynamicTool({
			name: "web-search",
			description: googleSearch.description,
			func: async (input: string) => googleSearch.invoke(input),
		});
	}
}
