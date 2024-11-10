import { NextRequest, NextResponse } from "next/server";
import { getServerSideConfig } from "@/app/config/server";
import { BaseCallbackHandler } from "@langchain/core/callbacks/base";

import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { AgentExecutor, AgentStep } from "langchain/agents";
import { ACCESS_CODE_PREFIX, ServiceProvider } from "@/app/constant";

// import * as langchainTools from "@langchain/core/tools";
import * as langchainTools from "@/app/api/langchain/tools";
import { DuckDuckGo } from "@/app/api/langchain/tools/duckduckgo_search";
import { HttpGetTool } from "@/app/api/langchain/tools/http_get";
import {
	DynamicTool,
	Tool,
	StructuredToolInterface,
} from "@langchain/core/tools";
import { convertToOpenAITool } from "@langchain/core/utils/function_calling";

import { useAccessStore } from "@/app/store";

import { formatToOpenAIToolMessages } from "langchain/agents/format_scratchpad/openai_tools";
import {
	OpenAIToolsAgentOutputParser,
	type ToolsAgentStep,
} from "langchain/agents/openai/output_parser";
import { RunnableSequence } from "@langchain/core/runnables";
import {
	ChatPromptTemplate,
	MessagesPlaceholder,
} from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import {
	BaseMessage,
	FunctionMessage,
	ToolMessage,
	SystemMessage,
	HumanMessage,
	AIMessage,
} from "@langchain/core/messages";

import { MultimodalContent } from "@/app/client/api";
import { GoogleCustomSearch } from "@/app/api/langchain/tools";

export interface RequestMessage {
	role: string;
	content: string | MultimodalContent[];
}

export interface RequestBody {
	chatSessionId: string;
	messages: RequestMessage[];
	isAzure: boolean;
	azureApiVersion?: string;
	model: string;
	stream?: boolean;
	temperature: number;
	presence_penalty?: number;
	frequency_penalty?: number;
	top_p?: number;
	baseUrl?: string;
	apiKey?: string;
	maxIterations: number;
	returnIntermediateSteps: boolean;
	useTools: (undefined | string)[];
}

// 首先定义一些类型
export interface Reference {
	title?: string;
	url: string;
	snippet?: string;
}

export interface DocumentMeta {
	id?: string;
	title?: string;
	source?: string;
	score?: number;
	metadata?: Record<string, any>;
}

export interface CodeBlock {
	language?: string;
	code: string;
	filename?: string;
}

export class ResponseBody {
	isSuccess: boolean = true;
	isToolMessage: boolean = false;
	type: "text" | "tool" | "reference" | "document" | "code" = "text";
	message: string = "";

	// 工具相关
	toolName?: string;
	toolInput?: any;

	// 引用相关
	references?: Reference[];

	// RAG 相关
	documents?: DocumentMeta[];

	// 代码相关
	codeBlocks?: CodeBlock[];
}

export interface ToolInput {
	input: string;
}

export class AgentApi {
	private encoder: TextEncoder;
	private transformStream: TransformStream;
	private writer: WritableStreamDefaultWriter<any>;
	private controller: AbortController;

	constructor(
		encoder: TextEncoder,
		transformStream: TransformStream,
		writer: WritableStreamDefaultWriter<any>,
		controller: AbortController,
	) {
		this.encoder = encoder;
		this.transformStream = transformStream;
		this.writer = writer;
		this.controller = controller;
	}

	async getHandler(reqBody: any) {
		var writer = this.writer;
		var encoder = this.encoder;
		var controller = this.controller;
		return BaseCallbackHandler.fromMethods({
			async handleLLMNewToken(token: string) {
				if (token && !controller.signal.aborted) {
					var response = new ResponseBody();
					response.message = token;
					await writer.ready;
					await writer.write(
						encoder.encode(`data: ${JSON.stringify(response)}\n\n`),
					);
				}
			},
			async handleChainError(err, runId, parentRunId, tags) {
				if (controller.signal.aborted) {
					console.warn("[handleChainError]", "abort");
					await writer.close();
					return;
				}
				console.log("[handleChainError]", err, "writer error");
				var response = new ResponseBody();
				response.isSuccess = false;
				response.message = err;
				await writer.ready;
				await writer.write(
					encoder.encode(`data: ${JSON.stringify(response)}\n\n`),
				);
				await writer.close();
			},
			async handleChainEnd(outputs, runId, parentRunId, tags) {
				// console.log("[handleChainEnd]");
				// await writer.ready;
				// await writer.close();
			},
			async handleLLMEnd() {
				// await writer.ready;
				// await writer.close();
			},
			async handleLLMError(e: Error) {
				if (controller.signal.aborted) {
					console.warn("[handleLLMError]", "abort");
					await writer.close();
					return;
				}
				console.log("[handleLLMError]", e, "writer error");
				var response = new ResponseBody();
				response.isSuccess = false;
				response.message = e.message;
				await writer.ready;
				await writer.write(
					encoder.encode(`data: ${JSON.stringify(response)}\n\n`),
				);
				await writer.close();
			},
			async handleLLMStart(llm, _prompts: string[]) {
				// console.log("handleLLMStart: I'm the second handler!!", { llm });
			},
			async handleChainStart(chain) {
				// console.log("handleChainStart: I'm the second handler!!", { chain });
			},
			async handleAgentAction(action) {
				try {
					console.log("[handleAgentAction]", { action });
					if (!reqBody.returnIntermediateSteps) return;

					const response = new ResponseBody();
					response.type = "tool";
					response.toolName = action.tool;
					response.isToolMessage = true;
					console.log("toolInput", action.toolInput);

					// 根据不同的工具类型，设置不同的响应格式
					switch (action.tool) {
						case "web-browser":
							response.type = "reference";
							response.message = `浏览 ${
								typeof action.toolInput === "string"
									? action.toolInput
									: action.toolInput.input
							} `;
							// URL 会在 toolEnd 时添加完整的引用信息
							break;

						case "web-search":
							response.type = "reference";
							response.message = ` ${
								typeof action.toolInput === "string"
									? action.toolInput
									: action.toolInput.input
							} `;
							// URL 会在 toolEnd 时添加完整的引用信息
							break;

						case "vector-store":
						case "retrieval-qa":
							response.type = "document";
							response.message = `搜索相关文档...`;
							// 文档信息会在 toolEnd 时添加
							break;

						case "code-generator":
							response.type = "code";
							response.message = `生成代码...`;
							break;

						default:
							response.message = JSON.stringify(action.toolInput);
					}

					await writer.ready;
					await writer.write(
						encoder.encode(`data: ${JSON.stringify(response)}\n\n`),
					);
				} catch (ex) {
					console.error("[handleAgentAction]", ex);
					const response = new ResponseBody();
					response.isSuccess = false;
					response.message = (ex as Error).message;
					await writer.write(
						encoder.encode(`data: ${JSON.stringify(response)}\n\n`),
					);
					await writer.close();
				}
			},
			async handleToolStart(tool, input) {
				// console.log("[handleToolStart]", { tool, input });
			},
			async handleToolEnd(output: string, runId: string, parentRunId?: string) {
				try {
					console.log("[handleToolEnd]", output);
					// 尝试解析输出为 JSON
					try {
						const parsedOutput = JSON.parse(output);
						const response = new ResponseBody();
						if (parsedOutput.references) {
							response.type = "reference";
							response.references = parsedOutput.references;
							response.isToolMessage = true;
							// response.message = parsedOutput.content;
						} else if (parsedOutput.documents) {
							response.type = "document";
							response.isToolMessage = true;
							response.documents = parsedOutput.documents;
							response.message = parsedOutput.content;
						}
						// 写入结构化响应
						await writer.ready;
						await writer.write(
							encoder.encode(`data: ${JSON.stringify(response)}\n\n`),
						);
					} catch (e) {
						// 如果不是 JSON，则作为普通文本处理
						const response = new ResponseBody();
						response.type = "text";
						response.message = output;
						await writer.write(
							encoder.encode(`data: ${JSON.stringify(response)}\n\n`),
						);
					}
					return output;
				} catch (error) {
					console.error("[handleToolEnd] Error:", error);
					return output;
				}
			},
			async handleAgentEnd(action, runId, parentRunId, tags) {
				if (controller.signal.aborted) {
					return;
				}
				console.log("[handleAgentEnd]", action);

				await writer.ready;
				await writer.close();
			},
		});
	}

	async getOpenAIApiKey(token: string) {
		const serverConfig = getServerSideConfig();
		const isApiKey = !token.startsWith(ACCESS_CODE_PREFIX);

		let apiKey = serverConfig.apiKey;
		if (isApiKey && token) {
			apiKey = token;
		}
		return apiKey;
	}

	async getOpenAIBaseUrl(reqBaseUrl: string | undefined) {
		const serverConfig = getServerSideConfig();
		let baseUrl = "https://api.openai.com/v1";
		if (serverConfig.baseUrl) baseUrl = serverConfig.baseUrl;
		if (reqBaseUrl?.startsWith("http://") || reqBaseUrl?.startsWith("https://"))
			baseUrl = reqBaseUrl;
		if (!baseUrl.endsWith("/v1"))
			baseUrl = baseUrl.endsWith("/") ? `${baseUrl}v1` : `${baseUrl}/v1`;
		console.log("[baseUrl]", baseUrl);
		return baseUrl;
	}

	async getApiHandler(
		req: NextRequest,
		reqBody: RequestBody,
		customTools: any[],
	) {
		try {
			let useTools = reqBody.useTools ?? [];
			const serverConfig = getServerSideConfig();

			// const reqBody: RequestBody = await req.json();
			// ui set azure model provider
			const isAzure = reqBody.isAzure;
			const authHeaderName = isAzure ? "api-key" : "Authorization";
			const authToken = req.headers.get(authHeaderName) ?? "";
			const token = authToken.trim().replaceAll("Bearer ", "").trim();

			let apiKey = await this.getOpenAIApiKey(token);
			if (isAzure) apiKey = token;
			let baseUrl = "https://api.openai.com/v1";
			if (serverConfig.baseUrl) baseUrl = serverConfig.baseUrl;
			if (
				reqBody.baseUrl?.startsWith("http://") ||
				reqBody.baseUrl?.startsWith("https://")
			) {
				baseUrl = reqBody.baseUrl;
			}
			if (!isAzure && !baseUrl.endsWith("/v1")) {
				baseUrl = baseUrl.endsWith("/") ? `${baseUrl}v1` : `${baseUrl}/v1`;
			}
			if (!reqBody.isAzure && serverConfig.isAzure) {
				baseUrl = serverConfig.azureUrl || baseUrl;
			}
			console.log("[baseUrl]", baseUrl);

			var handler = await this.getHandler(reqBody);

			let searchTool: Tool = new GoogleCustomSearch({
				apiKey: process.env.GOOGLE_SEARCH_API_KEY,
				googleCSEId: process.env.GOOGLE_CSE_ID,
			});

			const tools = [];

			// configure the right tool for web searching
			if (useTools.includes("web-search")) tools.push(searchTool);
			// console.log(customTools);

			// include tools included in this project
			customTools.forEach((customTool) => {
				if (customTool) {
					if (useTools.includes(customTool.name)) {
						tools.push(customTool);
					}
				}
			});

			// include tools from Langchain community
			useTools.forEach((toolName) => {
				if (toolName) {
					var tool = langchainTools[
						toolName as keyof typeof langchainTools
					] as any;
					if (tool) {
						tools.push(new tool());
					}
				}
			});

			const pastMessages = new Array();

			if (reqBody.messages.length > 0) {
				reqBody.messages
					.slice(0, reqBody.messages.length - 1)
					.forEach((message) => {
						if (
							message.role === "system" &&
							typeof message.content === "string"
						)
							pastMessages.push(new SystemMessage(message.content));
						if (message.role === "user")
							typeof message.content === "string"
								? pastMessages.push(new HumanMessage(message.content))
								: pastMessages.push(
										new HumanMessage({ content: message.content }),
									);
						if (
							message.role === "assistant" &&
							typeof message.content === "string"
						)
							pastMessages.push(new AIMessage(message.content));
					});
			}
			let llm = new ChatOpenAI(
				{
					modelName: reqBody.model,
					openAIApiKey: apiKey,
					temperature: reqBody.temperature,
					streaming: reqBody.stream,
					topP: reqBody.top_p,
					presencePenalty: reqBody.presence_penalty,
					frequencyPenalty: reqBody.frequency_penalty,
				},
				{ basePath: baseUrl },
			);

			if (reqBody.isAzure || serverConfig.isAzure) {
				llm = new ChatOpenAI({
					temperature: reqBody.temperature,
					streaming: reqBody.stream,
					topP: reqBody.top_p,
					presencePenalty: reqBody.presence_penalty,
					frequencyPenalty: reqBody.frequency_penalty,
					azureOpenAIApiKey: apiKey,
					azureOpenAIApiVersion: reqBody.isAzure
						? reqBody.azureApiVersion
						: serverConfig.azureApiVersion,
					azureOpenAIApiDeploymentName: reqBody.model,
					azureOpenAIBasePath: baseUrl,
				});
			}
			const memory = new BufferMemory({
				memoryKey: "history",
				inputKey: "question",
				outputKey: "answer",
				returnMessages: true,
				chatHistory: new ChatMessageHistory(pastMessages),
			});
			const MEMORY_KEY = "chat_history";
			const prompt = ChatPromptTemplate.fromMessages([
				new MessagesPlaceholder(MEMORY_KEY),
				new MessagesPlaceholder("input"),
				new MessagesPlaceholder("agent_scratchpad"),
			]);
			const modelWithTools = llm.bind({
				tools: tools.map(convertToOpenAITool),
			});
			const runnableAgent = RunnableSequence.from([
				{
					input: (i) => i.input,
					agent_scratchpad: (i: { input: string; steps: ToolsAgentStep[] }) => {
						return formatToOpenAIToolMessages(i.steps);
					},
					chat_history: async (i: {
						input: string;
						steps: ToolsAgentStep[];
					}) => {
						const { history } = await memory.loadMemoryVariables({});
						return history;
					},
				},
				prompt,
				modelWithTools,
				new OpenAIToolsAgentOutputParser(),
			]).withConfig({ runName: "OpenAIToolsAgent" });

			const executor = AgentExecutor.fromAgentAndTools({
				agent: runnableAgent,
				tools,
			});

			let lastMessageContent: any;
			if (reqBody.messages.length > 0) {
				lastMessageContent = reqBody.messages.slice(-1)[0].content;
			}
			const lastHumanMessage =
				typeof lastMessageContent === "string"
					? new HumanMessage(lastMessageContent)
					: new HumanMessage({ content: lastMessageContent });
			executor
				.invoke(
					{
						input: [lastHumanMessage],
						signal: this.controller.signal,
					},
					{
						callbacks: [handler],
					},
				)
				.catch((error) => {
					if (this.controller.signal.aborted) {
						console.warn("[AgentCall]", "abort");
					} else {
						console.error("[AgentCall]", error);
					}
				});

			return new Response(this.transformStream.readable, {
				headers: { "Content-Type": "text/event-stream" },
			});
		} catch (e) {
			return new Response(JSON.stringify({ error: (e as any).message }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			});
		}
	}
}
