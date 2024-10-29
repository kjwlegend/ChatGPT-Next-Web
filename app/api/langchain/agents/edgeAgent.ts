import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { ArxivAPIWrapper } from "@/app/api/langchain/tools/arxiv";
import { DallEAPIWrapper } from "@/app/api/langchain/tools/dalle_image_generator";
import { StableDiffusionWrapper } from "@/app/api/langchain/tools/stable_diffusion_image_generator";
import { Calculator } from "@langchain/community/tools/calculator";
import { WebBrowser } from "langchain/tools/webbrowser";
import { Embeddings } from "@langchain/core/embeddings";
import { WolframAlphaTool } from "@/app/api/langchain/tools/wolframalpha";
import { BilibiliVideoInfoTool } from "@/app/api/langchain/tools/bilibili_vid_info";
import { BilibiliVideoSearchTool } from "@/app/api/langchain/tools/bilibili_vid_search";
import { BilibiliVideoConclusionTool } from "@/app/api/langchain/tools/bilibili_vid_conclusion";
import { BilibiliMusicRecognitionTool } from "@/app/api/langchain/tools/bilibili_music_recognition";
// import { RAGSearch } from "@/app/api/langchain/tools/rag_search";
export class EdgeTool {
	private apiKey: string | undefined;

	private baseUrl: string;

	private model: BaseLanguageModel;

	private embeddings: Embeddings;

	private callback?: (data: string) => Promise<void>;

	constructor(
		apiKey: string | undefined,
		baseUrl: string,
		model: BaseLanguageModel,
		embeddings: Embeddings,
		callback?: (data: string) => Promise<void>,
	) {
		this.apiKey = apiKey;
		this.baseUrl = baseUrl;
		this.model = model;
		this.embeddings = embeddings;
		this.callback = callback;
	}

	async getCustomTools(): Promise<any[]> {
		const webBrowserTool = new WebBrowser({
			model: this.model,
			embeddings: this.embeddings,
		});
		const calculatorTool = new Calculator();
		const dallEAPITool = new DallEAPIWrapper(
			this.apiKey,
			this.baseUrl,
			this.callback,
		);
		const stableDiffusionTool = new StableDiffusionWrapper();
		const arxivAPITool = new ArxivAPIWrapper();
		const wolframAlphaTool = new WolframAlphaTool();
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
			bilibiliVideoInfoTool,
			bilibiliVideoSearchTool,
			bilibiliMusicRecognitionTool,
			bilibiliVideoConclusionTool,
		];
		return tools;
	}
}
