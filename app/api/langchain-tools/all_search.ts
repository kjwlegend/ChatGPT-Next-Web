import { decode } from "html-entities";
import { convert as htmlToText } from "html-to-text";
import { Tool } from "langchain/tools";
import * as cheerio from "cheerio";
import { getRandomUserAgent } from "./ua_tools";

interface SearchResults {
	/** The web results of the search. */
	results: SearchResult[];
}

interface SearchResult {
	/** The URL of the result. */
	url: string;
	/** The title of the result. */
	title: string;
	/**
	 * The sanitized description of the result.
	 * Bold tags will still be present in this string.
	 */
	description: string;
}

async function search(
	input: string,
	maxResults: number,
	searchUrl: string,
	resultSelector: string,
): Promise<SearchResults> {
	const results: SearchResults = {
		results: [],
	};
	const headers = new Headers();
	headers.append("User-Agent", getRandomUserAgent());
	const resp = await fetch(`${searchUrl}${encodeURIComponent(input)}`, {
		headers: headers,
	});
	const respCheerio = cheerio.load(await resp.text());
	respCheerio(resultSelector).each((i, elem) => {
		const item = cheerio.load(elem);
		const linkElement = item("a");
		const url = (linkElement.attr("href") ?? "").trim();
		if (url !== "" && url !== "#") {
			const title = decode(linkElement.text());
			const description = item.text().replace(title, "").trim();
			results.results.push({
				url,
				title,
				description,
			});
		}
	});
	// console.log(results.results);
	return results;
}

export class BaiduSearch extends Tool {
	name = "baidu_search";
	maxResults = 10;
	searchUrl = "https://www.baidu.com/s?f=10&ie=utf-8&wd=";
	resultSelector = "div.c-container.new-pmd";

	/** @ignore */
	async _call(input: string) {
		const searchResults = await search(
			input,
			this.maxResults,
			this.searchUrl,
			this.resultSelector,
		);

		if (searchResults.results.length === 0) {
			return "No good search result found";
		}

		const results = searchResults.results
			.slice(0, this.maxResults)
			.map(({ title, description, url }) => htmlToText(description))
			.join("\n\n");
		return results;
	}

	description =
		"a search engine. useful for when you need to answer questions about current events. input should be a search query.";
}

export class GoogleSearch extends Tool {
	name = "google_search";
	maxResults = 10;
	searchUrl = "https://proxy.xiaoguang.online/search?nfpr=1&num=10&q=";
	resultSelector = "div.g";

	/** @ignore */
	async _call(input: string) {
		const searchResults = await search(
			input,
			this.maxResults,
			this.searchUrl,
			this.resultSelector,
		);

		if (searchResults.results.length === 0) {
			return "No good search result found";
		}

		const results = searchResults.results
			.slice(0, this.maxResults)
			.map(({ title, description, url }) => htmlToText(description))
			.join("\n\n");
		return results;
	}

	description =
		"a search engine. useful for when you need to answer questions about current events. input should be a search query.";
}

export class AllSearch extends Tool {
	name = "all_search";
	maxResults = 6;
	searchUrl = "https://proxy.xiaoguang.online/search?nfpr=1&num=10&q=";
	resultSelector = "div.g";

	/** @ignore */
	async _call(input: string) {
		const baiduSearch = await search(
			input,
			this.maxResults,
			"https://www.baidu.com/s?f=8&ie=utf-8&wd=",
			"div.c-container.new-pmd",
		);

		const googleSearch = await search(
			input,
			this.maxResults,
			"https://proxy.xiaoguang.online/search?nfpr=1&num=10&q=",
			"div.g",
		);

		if (baiduSearch.results.length === 0) {
			return "No good search result found";
		}

		if (googleSearch.results.length === 0) {
			return "No good search result found";
		}

		const results = baiduSearch.results
			.slice(0, this.maxResults)
			.map(({ title, description, url }) => htmlToText(description))
			.join("\n\n");

		console.log("baidu 结果条数", baiduSearch.results.length);

		const results2 = googleSearch.results
			.slice(0, this.maxResults)
			.map(({ title, description, url }) => htmlToText(description))
			.join("\n\n");

		console.log("google 结果条数", googleSearch.results.length);

		return results + "\n\n" + results2;
	}

	description =
		"a search engine. useful for when you need to answer questions about current events. input should be a search query.";
}
