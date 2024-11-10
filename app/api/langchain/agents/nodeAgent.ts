import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { PDFBrowser } from "@/app/api/langchain/tools/pdf_browser";
import { ArxivAPIWrapper } from "@/app/api/langchain/tools/arxiv";
import { DallEAPINodeWrapper } from "@/app/api/langchain/tools/dalle_image_generator_node";
import { StableDiffusionNodeWrapper } from "@/app/api/langchain/tools/stable_diffusion_image_generator_node";

import { Calculator } from "@langchain/community/tools/calculator";
import { WebBrowser } from "langchain/tools/webbrowser";
import { Embeddings } from "@langchain/core/embeddings";
import { WolframAlphaTool } from "@/app/api/langchain/tools/wolframalpha";
import { BilibiliVideoInfoTool } from "@/app/api/langchain/tools/bilibili_vid_info";
import { BilibiliVideoSearchTool } from "@/app/api/langchain/tools/bilibili_vid_search";
import { BilibiliVideoConclusionTool } from "@/app/api/langchain/tools/bilibili_vid_conclusion";
import { BilibiliMusicRecognitionTool } from "@/app/api/langchain/tools/bilibili_music_recognition";
import { RAGSearch } from "../tools/rag_search";
import { WebBrowserTool } from "../tools/web_browser";

export class NodeJSTool {
	private apiKey: string | undefined;
	private baseUrl: string;
	private model: BaseLanguageModel;
	private embeddings: Embeddings;
	private sessionId: string;
	private ragEmbeddings: Embeddings;
	private callback?: (data: string) => Promise<void>;

	constructor(
		apiKey: string | undefined,
		baseUrl: string,
		model: BaseLanguageModel,
		embeddings: Embeddings,
		sessionId: string,
		ragEmbeddings: Embeddings,
		callback?: (data: string) => Promise<void>,
	) {
		this.apiKey = apiKey;
		this.baseUrl = baseUrl;
		this.model = model;
		this.embeddings = embeddings;
		this.sessionId = sessionId;
		this.ragEmbeddings = ragEmbeddings;
		this.callback = callback;
	}

	async getCustomTools(): Promise<any[]> {
		const webBrowserTool = new WebBrowserTool({
			model: this.model,
			embeddings: this.embeddings,
		});
		const calculatorTool = new Calculator();
		const dallEAPITool = new DallEAPINodeWrapper(
			this.apiKey,
			this.baseUrl,
			this.callback,
		);
		const stableDiffusionTool = new StableDiffusionNodeWrapper();
		const arxivAPITool = new ArxivAPIWrapper();
		const wolframAlphaTool = new WolframAlphaTool();
		const pdfBrowserTool = new PDFBrowser(this.model, this.embeddings);
		const bilibiliVideoInfoTool = new BilibiliVideoInfoTool();
		const bilibiliVideoSearchTool = new BilibiliVideoSearchTool();
		const bilibiliVideoConclusionTool = new BilibiliVideoConclusionTool();
		const bilibiliMusicRecognitionTool = new BilibiliMusicRecognitionTool();
		let tools = [
			calculatorTool,
			webBrowserTool,
			dallEAPITool,
			stableDiffusionTool,
			arxivAPITool,
			wolframAlphaTool,
			pdfBrowserTool,
			bilibiliVideoInfoTool,
			bilibiliVideoSearchTool,
			bilibiliMusicRecognitionTool,
			bilibiliVideoConclusionTool,
		];
		if (!!process.env.ENABLE_RAG) {
			tools.push(new RAGSearch(this.sessionId, this.model, this.ragEmbeddings));
		}
		return tools;
	}
}
