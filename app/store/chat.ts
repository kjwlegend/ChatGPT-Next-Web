import { trimTopic } from "../utils";

import Locale, { getLang } from "../locales";
import { showToast } from "../components/ui-lib";
import { ModelConfig, ModelType, useAppConfig } from "./config";
import { createEmptyMask, Mask } from "./mask";
import { KnowledgeCutOffDate, StoreKey, SUMMARIZE_MODEL } from "../constant";

import {
	DEFAULT_INPUT_TEMPLATE,
	DEFAULT_SYSTEM_TEMPLATE,
	getDefaultSystemTemplate,
} from "@/app/chains/default";

import { api, RequestMessage } from "../client/api";
import { ChatControllerPool } from "../client/controller";
import { prettyObject } from "../utils/format";
import { estimateTokenLength } from "../utils/token";
import { nanoid } from "nanoid";
import { createChatSession } from "../api/chat";
import { UserStore, useUserStore } from "./user";
import { BUILTIN_MASKS } from "../masks";
import type { BuiltinMask } from "../masks";
import { Plugin, usePluginStore } from "../store/plugin";

export interface ChatToolMessage {
	toolName: string;
	toolInput?: string;
}
import { createPersistStore } from "../utils/store";

import { summarizeTitle, summarizeSession } from "../chains/summarize";

import {
	imagine,
	ImagineRes,
	ImagineParams,
	Mjfetch,
	FetchRes,
} from "../api/midjourney/tasksubmit";
import { fail } from "assert";

export type ChatMessage = RequestMessage & {
	date: string;

	id: string;
	model?: ModelType;
	image_url?: string;
	mjSessions?: MJMessage[];
	toolMessages?: ChatToolMessage[];
	streaming?: boolean;
	isError?: boolean;
};

export function createMessage(override: Partial<ChatMessage>): ChatMessage {
	return {
		id: nanoid(),
		date: new Date().toLocaleString(),
		toolMessages: new Array<ChatToolMessage>(),
		role: "user",
		content: "",
		...override,
	};
}

export interface ChatStat {
	tokenCount: number;
	wordCount: number;
	charCount: number;
}

export interface ChatSession {
	id: string;
	topic: string;
	memoryPrompt: string;
	messages: ChatMessage[];

	stat: ChatStat;
	lastUpdate: number;
	lastSummarizeIndex: number;
	clearContextIndex?: number;
	mask: Mask;
	responseStatus?: boolean;
	isworkflow?: boolean;
}

export interface MJMessage {
	action: string;
	description: string;
	failReason: string;
	finishTime: number;
	id: string;
	imageUrl: string;
	progress: string;
	prompt: string;
	promptEn: string;
	properties: Record<string, unknown>;
	startTime: number;
	state: string;
	status: string;
	submitTime: number;
}

export const DEFAULT_TOPIC = Locale.Store.DefaultTopic;
export const BOT_HELLO: ChatMessage = createMessage({
	role: "assistant",
	content: Locale.Store.BotHello,
});

function createEmptySession(): ChatSession {
	return {
		id: nanoid(),
		topic: DEFAULT_TOPIC,
		memoryPrompt: "",
		messages: [],
		stat: {
			tokenCount: 0,
			wordCount: 0,
			charCount: 0,
		},
		lastUpdate: Date.now(),
		lastSummarizeIndex: 0,
		mask: createEmptyMask(),
		isworkflow: false,
	};
}

function getSummarizeModel(currentModel: string) {
	// if it is using gpt-* models, force to use 3.5 to summarize
	return currentModel.startsWith("gpt") ? SUMMARIZE_MODEL : currentModel;
}

interface ChatStore {
	sessions: ChatSession[];
	currentSessionIndex: number;
	clearSessions: () => void;
	moveSession: (from: number, to: number) => void;
	selectSession: (index: number) => void;
	newSession: (mask?: Mask, useUserStore?: UserStore) => ChatSession;
	deleteSession: (index: number, useUserStore?: UserStore) => void;
	currentSession: () => ChatSession;
	nextSession: (delta: number) => void;
	onNewMessage: (message: ChatMessage) => void;
	onUserInput: (content: string, sessionId?: string) => Promise<void>;
	summarizeSession: () => void;
	updateStat: (message: ChatMessage) => void;
	updateCurrentSession: (updater: (session: ChatSession) => void) => void;
	updateSession(
		sessionId: string,
		updater: (session: ChatSession) => void,
	): void;
	updateMessage: (
		sessionIndex: number,
		messageIndex: number,
		updater: (message?: ChatMessage) => void,
	) => void;
	resetSession: () => void;
	getMessagesWithMemory: (session?: ChatSession) => ChatMessage[];
	getMemoryPrompt: () => ChatMessage;

	clearAllData: () => void;
}

function countMessages(msgs: ChatMessage[]) {
	return msgs.reduce((pre, cur) => pre + estimateTokenLength(cur.content), 0);
}

function fillTemplateWith(input: string, modelConfig: ModelConfig) {
	let cutoff =
		KnowledgeCutOffDate[modelConfig.model] ?? KnowledgeCutOffDate.default;

	const vars = {
		cutoff,
		model: modelConfig.model,
		time: new Date().toLocaleString(),
		lang: getLang(),
		input: input,
	};

	let output = modelConfig.template ?? DEFAULT_INPUT_TEMPLATE;

	// must contains {{input}}
	const inputVar = "{{input}}";
	if (!output.includes(inputVar)) {
		output += "\n" + inputVar;
	}

	Object.entries(vars).forEach(([name, value]) => {
		output = output.replaceAll(`{{${name}}}`, value);
	});

	return output;
}

const DEFAULT_CHAT_STATE = {
	sessions: [createEmptySession()],
	currentSessionIndex: 0,
};

export const useChatStore = createPersistStore(
	DEFAULT_CHAT_STATE,
	(set, _get) => {
		function get() {
			return {
				..._get(),
				...methods,
			};
		}

		const methods = {
			clearSessions() {
				set(() => ({
					sessions: [createEmptySession()],
					currentSessionIndex: 0,
				}));
			},

			selectSession(index: number) {
				set({
					currentSessionIndex: index,
				});
			},

			moveSession(from: number, to: number, _sessions?: any) {
				set((state) => {
					const { sessions, currentSessionIndex: oldIndex } = state;

					if (_sessions) {
						// console.log("sessions: ", sessions);
						const newSessions = [..._sessions];
						const oldSessions = sessions.filter(
							(session) => !newSessions.includes(session),
						);
						const session = newSessions[from];
						newSessions.splice(from, 1);
						newSessions.splice(to, 0, session);
						// 传入sessions 时, 将新的sessions 和原本的state.sessions 进行合并
						const mergedSessions = [...oldSessions, ...newSessions];

						return {
							sessions: mergedSessions,
						};
					} else {
						// move the session
						const newSessions = [...sessions];
						const session = newSessions[from];
						newSessions.splice(from, 1);
						newSessions.splice(to, 0, session);

						// modify current session id
						let newIndex = oldIndex === from ? to : oldIndex;
						if (oldIndex > from && oldIndex <= to) {
							newIndex -= 1;
						} else if (oldIndex < from && oldIndex >= to) {
							newIndex += 1;
						}

						return {
							currentSessionIndex: newIndex,
							sessions: newSessions,
						};
					}
				});
			},

			newSession(mask?: Mask, userStore?: UserStore, isworkflow?: boolean) {
				const config = useAppConfig.getState();
				const session = createEmptySession();

				let model = config.modelConfig.model;

				if (mask) {
					const globalModelConfig = config.modelConfig;
					model = mask.modelConfig.model;

					session.mask = {
						...mask,
						modelConfig: {
							...globalModelConfig,
							...mask.modelConfig,
						},
					};
					session.topic = mask.name;
				} else {
					// 如果没有传入mask，则使用默认的mask
					const defaultMask = BUILTIN_MASKS.find(
						(m: BuiltinMask) => m.name === "小光(通用)",
					);
					if (defaultMask) {
						session.mask = {
							id: "100000",
							...defaultMask,
							modelConfig: {
								...config.modelConfig,
								...defaultMask.modelConfig,
							},
						};
						session.topic = defaultMask.name;
					}
				}
				if (isworkflow) {
					session.isworkflow = true;
				}

				if (userStore) {
					const user = userStore.user; // 从 userStore 中获取 user 对象
					const userId = user.id; // 从 user 对象中获取 id 字段

					// 判断mask.id 是否为数字, 如果不是数字, 则说明是自定义的 mask, prompt_id 设置为 100000
					// 如果是数字, 则说明是内置的 mask, prompt_id 设置为 mask.id

					if (!session.mask.id || isNaN(Number(session.mask.id))) {
						console.log("original mask id ", session.mask.id);
						session.mask.id = "100000";
						console.log("new mask id ", session.mask.id);
					}

					const promptId = isNaN(Number(session.mask.id))
						? "100000"
						: session.mask.id;

					const data = {
						user: userId,
						prompt_id: promptId,
						model: model,
					};
					console.log("createChatSession data ", data);
					createChatSession(data)
						.then((res) => {
							console.log(res);
							session.id = res.data.session_id;
						})
						.catch((err) => {
							console.log(err);
						});
				}

				set((state) => ({
					currentSessionIndex: 0,
					sessions: [session].concat(state.sessions),
				}));
				return session;
			},

			nextSession(delta: number) {
				const n = get().sessions.length;
				const limit = (x: number) => (x + n) % n;
				const i = get().currentSessionIndex;
				get().selectSession(limit(i + delta));
			},

			deleteSession(index: number, userStore?: UserStore) {
				const deletingLastSession = get().sessions.length === 1;
				const deletedSession = get().sessions.at(index);

				if (!deletedSession) return;

				const sessions = get().sessions.slice();
				sessions.splice(index, 1);

				const currentIndex = get().currentSessionIndex;
				let nextIndex = Math.min(
					currentIndex - Number(index < currentIndex),
					sessions.length - 1,
				);

				if (deletingLastSession) {
					nextIndex = 0;
					sessions.push(createEmptySession());

					// session id  设置为空
					if (userStore) {
						const user = userStore.user; // 从 userStore 中获取 user 对象
						const userId = user.id; // 从 user 对象中获取 id 字段
						const session = sessions.at(0);
						if (!session) return;

						const data = {
							user: userId,
						};
						createChatSession(data)
							.then((res) => {
								console.log(res);
								session.id = res.data.session_id || nanoid();
							})
							.catch((err) => {
								console.log(err);
							});
					}
				}

				// for undo delete action
				const restoreState = {
					currentSessionIndex: get().currentSessionIndex,
					sessions: get().sessions.slice(),
				};

				set(() => ({
					currentSessionIndex: nextIndex,
					sessions,
				}));

				showToast(
					Locale.Home.DeleteToast,
					{
						text: Locale.Home.Revert,
						onClick() {
							set(() => restoreState);
						},
					},
					5000,
				);
			},

			currentSession() {
				let index = get().currentSessionIndex;
				const sessions = get().sessions;

				if (index < 0 || index >= sessions.length) {
					index = Math.min(sessions.length - 1, Math.max(0, index));
					set(() => ({ currentSessionIndex: index }));
				}

				const session = sessions[index];

				return session;
			},
			getSession(_session?: ChatSession) {
				let session: ChatSession;
				// 定义一个session
				if (_session) {
					session = _session;
				} else {
					session = get().currentSession();
				}
				return session;
			},

			onNewMessage(message: ChatMessage) {
				get().updateCurrentSession((session) => {
					session.messages = session.messages.concat();
					session.lastUpdate = Date.now();
				});
				get().updateStat(message);
				summarizeSession();
			},

			async onUserInput(
				content: string,
				image_url?: string,
				_session?: ChatSession,
			) {
				// if sessionID is not provided, use current session, else use the session with the provided ID

				const session = get().getSession(_session);

				const sessionModel = session.mask.modelConfig.model;

				if (sessionModel === "midjourney") {
					const userMessage: ChatMessage = createMessage({
						role: "user",
						content: content,
						image_url: image_url,
					});

					// 创建一个botMessage, 提示请求已提交
					const imagineParams: ImagineParams = {
						base64Array: [],
						notifyHook: "",
						prompt: content,
					};

					try {
						// 调用 imagine 函数并等待结果
						const response = await imagine(imagineParams);
						if (response.status !== 200) {
							throw new Error("imagine failed");
						}
						const res = response.data as ImagineRes;

						// 获取绘画请求的描述和结果ID
						const description = res.description;
						const resultId = res.result; // 绘画任务的ID
						const message =
							"你的绘画请求: " +
							description +
							"\n请耐心等待，请求id: " +
							resultId;

						// 创建botMessage，提示请求已提交
						const botMessage: ChatMessage = createMessage({
							role: "assistant",
							content: message,
							image_url: image_url,
						});

						const botMessageId = botMessage.id;

						get().updateSession(session.id, () => {
							session.messages = session.messages.concat([
								userMessage,
								botMessage,
							]);
						});
						console.log("botMessageId: ", botMessageId);

						// 定义一个函数用于轮询绘画进度
						const pollForProgress = async (
							id: string,
							startTime: number,
							failureCount: number = 0,
						) => {
							try {
								const res = await Mjfetch(id);
								// 5次查询后，如果仍然没有结果，则停止轮询
								const fetchRes = res.data as FetchRes;

								let updatedBotMessage: ChatMessage = createMessage({
									role: "assistant",
									content: "",
									image_url: fetchRes.imageUrl,
								});

								console.log("fetchRes: ", fetchRes);

								const currentTime = Date.now();

								// 计算已经过去的时间
								const elapsedTime = currentTime - startTime;

								// 如果是 IN_PROGRESS，则继续轮询
								if (fetchRes.status === "IN_PROGRESS") {
									// 实时更新进度
									const progressMessage = `${message} \n 你的绘画正在绘制中，已耗时：${(
										elapsedTime / 1000
									).toFixed(2)}秒。 进度：${fetchRes.progress}`;

									// 更新 符合 botMessageId 的消息 为 updatedBotMessage, 且继续轮询
									get().updateSession(session.id, () => {
										// 找到需要更新的消息
										const messageIndex = session.messages.findIndex(
											(m) => m.id === botMessageId,
										);
										if (messageIndex !== -1) {
											// 如果找到了消息，并且内容有变化，则进行更新
											if (
												session.messages[messageIndex].content !==
												progressMessage
											) {
												updatedBotMessage = {
													...session.messages[messageIndex],
													content: progressMessage,
												};
												// 更新消息数组
												session.messages[messageIndex] = updatedBotMessage;
											}
										}
									});

									// 继续轮询
									setTimeout(
										() => pollForProgress(id, startTime, failureCount),
										5000,
									);
									return;
								}

								if (fetchRes.status === "SUCCESS") {
									// 绘画完成，获取 imageUrl 并更新消息
									const finishedMessage = `你的绘画已完成！总耗时：${(
										elapsedTime / 1000
									).toFixed(2)}秒。\n查看结果: ![image](${fetchRes.imageUrl})`;

									// 更新 符合 botMessageId 的消息
									get().updateSession(session.id, () => {
										// 找到需要更新的消息
										const messageIndex = session.messages.findIndex(
											(m) => m.id === botMessageId,
										);
										if (messageIndex !== -1) {
											// 如果找到了消息，并且内容有变化，则进行更新
											if (
												session.messages[messageIndex].content !==
												finishedMessage
											) {
												updatedBotMessage = {
													...session.messages[messageIndex],
													content: finishedMessage,
													image_url: fetchRes.imageUrl,
												};
												// 更新消息数组
												session.messages[messageIndex] = updatedBotMessage;
											}
										}
									});

									// 停止轮询
									return;
								}
								if (fetchRes.status === "FAILURE" || elapsedTime > 240000) {
									// 如果状态为 FAILURE 或超时，则停止轮询
									const failMessage = `${message} \n 绘画任务失败或超时。总耗时：${(
										elapsedTime / 1000
									).toFixed(2)}秒。失败理由：${fetchRes.failReason}`;

									// 更新会话消息
									get().updateSession(session.id, () => {
										// 找到需要更新的消息
										const messageIndex = session.messages.findIndex(
											(m) => m.id === botMessageId,
										);
										if (messageIndex !== -1) {
											// 如果找到了消息，并且内容有变化，则进行更新
											if (
												session.messages[messageIndex].content !== failMessage
											) {
												updatedBotMessage = {
													...session.messages[messageIndex],
													content: failMessage,
												};
												// 更新消息数组
												session.messages[messageIndex] = updatedBotMessage;
											}
										}
									});

									return;
								} else {
									// 如果状态不是 SUCCESS 或 FAILURE，并且未超时，则继续轮询
									setTimeout(() => pollForProgress(id, startTime), 5000);
								}
							} catch (error) {
								console.error("Error fetching progress:", error);
								const newFailureCount = failureCount + 1;
								if (newFailureCount >= 5) {
									// 如果失败次数达到5次，则停止轮询
									const failMessage = `${message} \n 接口调用失败超过5次。任务中止。`;
									let updatedBotMessage: ChatMessage = createMessage({
										role: "assistant",
										content: "",
									});

									get().updateSession(session.id, (session) => {
										const messageIndex = session.messages.findIndex(
											(m) => m.id === botMessageId,
										);
										if (messageIndex !== -1) {
											// 如果找到了消息，并且内容有变化，则进行更新
											if (
												session.messages[messageIndex].content !== failMessage
											) {
												updatedBotMessage = {
													...session.messages[messageIndex],
													content: failMessage,
												};
												// 更新消息数组
												session.messages[messageIndex] = updatedBotMessage;
											}
										}
									});
								} else {
									// 如果失败次数未达5次，则重试
									setTimeout(
										() => pollForProgress(id, startTime, newFailureCount),
										5000,
									);
								}
							}
						};
						// 获取当前时间作为开始时间
						const startTime = Date.now();

						// 开始轮询绘画进度
						pollForProgress(resultId, startTime);
					} catch (err) {
						// 处理错误情况
						console.log(err);
					}

					return;
				}

				let responseStatus = session.responseStatus;

				console.log("click send: ", session.topic, responseStatus);

				const modelConfig = session.mask.modelConfig;

				const userContent = fillTemplateWith(content, modelConfig);
				console.log("[User Input] after template: ", userContent);

				const userMessage: ChatMessage = createMessage({
					role: "user",
					content: userContent,
					image_url: image_url,
				});

				const botMessage: ChatMessage = createMessage({
					role: "assistant",
					streaming: true,
					model: modelConfig.model,
					toolMessages: [],
				});
				console.log("[botMessage] ", botMessage);

				// get recent messages
				const recentMessages = get().getMessagesWithMemory(session);
				const sendMessages = recentMessages.concat(userMessage);
				const messageIndex = get().currentSession().messages.length + 1;

				const sessionId = session.id;

				get().updateSession(sessionId, (session: ChatSession) => {
					const savedUserMessage = {
						...userMessage,
						content,
					};
					session.messages = session.messages.concat([
						savedUserMessage,
						botMessage,
					]);
				});

				get().sendChatMessage(
					// 调用发送消息函数
					session,
					sendMessages,
					get().handleChatCallbacks(
						botMessage,
						userMessage,
						messageIndex,
						session,
					),
				);
			},

			// 先定义一个处理回调的函数，以便重用
			handleChatCallbacks(
				botMessage: ChatMessage,
				userMessage: ChatMessage,
				messageIndex: number,
				session: ChatSession,
			) {
				const config = useAppConfig.getState();
				const pluginConfig = config.pluginConfig;
				const allPlugins = usePluginStore.getState().getAll();

				return {
					onUpdate: (message: string) => {
						botMessage.streaming = true;
						if (message) {
							botMessage.content = message;
						}
						get().updateCurrentSession((session) => {
							session.messages = session.messages.concat();
						});
					},
					onToolUpdate(toolName: string, toolInput: string) {
						botMessage.streaming = true;
						//  根据toolName获取对应的 toolName, 并输出对应的 name
						const tool = allPlugins.find((m) => m.toolName === toolName);
						const name = tool?.name;
						console.log("toolName: ", toolName, "tool: ", tool?.name);
						if (name && toolInput) {
							botMessage.toolMessages!.push({
								toolName: name,
								toolInput,
							});
						}
						get().updateCurrentSession((session) => {
							session.messages = session.messages.concat();
						});
					},
					onFinish: (message: string) => {
						botMessage.streaming = false;
						if (message) {
							botMessage.content = message;
							get().onNewMessage(botMessage);
							session.responseStatus = true;
						}
						ChatControllerPool.remove(session.id, botMessage.id);
					},
					onError: (error: Error) => {
						const isAborted = error.message.includes("aborted");
						botMessage.content +=
							"\n\n" +
							prettyObject({
								error: true,
								message: error.message,
							});
						botMessage.streaming = false;
						userMessage.isError = !isAborted;
						botMessage.isError = !isAborted;
						get().updateCurrentSession((session) => {
							session.messages = session.messages.concat();
						});
						ChatControllerPool.remove(
							session.id,
							botMessage.id ?? messageIndex,
						);
						console.error("[Chat] failed ", error);
					},
					onController: (controller: AbortController) => {
						ChatControllerPool.addController(
							session.id,
							botMessage.id ?? messageIndex,
							controller,
						);
					},
				};
			},

			// 然后创建一个统一的发送消息函数
			sendChatMessage(
				session: ChatSession,
				sendMessages: ChatMessage[] | RequestMessage[],
				callbacks: {
					onUpdate?: (message: string) => void;
					onFinish: (message: string) => void;
					onError?: (error: Error) => void;
					onController?: (controller: AbortController) => void;
					onToolUpdate?: (toolName: string, toolInput: string) => void;
				},
				modelConfig?: ModelConfig,
				stream?: boolean,
			) {
				const config = useAppConfig.getState();
				const pluginConfig = config.pluginConfig;
				const allPlugins = usePluginStore.getState().getAll();

				if (!modelConfig) {
					modelConfig = session.mask.modelConfig;
				}

				const chatOptions = {
					messages: sendMessages,
					config: { ...modelConfig, stream: stream ?? true },
					...callbacks,
				};

				console.log("chatoptions", chatOptions);

				// 根据是否启用插件使用不同的API
				const useToolAgent =
					pluginConfig.enable &&
					session.mask.usePlugins &&
					allPlugins.length > 0 &&
					session.mask.modelConfig.model !== "gpt-4-vision-preview";

				// 检查当前插件开启状态
				// console.log(
				// 	"config enable",
				// 	config.pluginConfig.enable,
				// 	"\n session",
				// 	session.mask.usePlugins,
				// 	"\n AllPlugin",
				// 	allPlugins.length,
				// 	allPlugins,
				// );

				if (useToolAgent) {
					console.log("[ToolAgent] start");
					const pluginToolNames = session.mask.plugins;
					api.llm.toolAgentChat({
						...chatOptions,
						agentConfig: {
							...pluginConfig,
							useTools: pluginToolNames,
						},
					});
				} else {
					api.llm.chat(chatOptions);
				}
			},

			getMemoryPrompt() {
				const session = get().currentSession();

				return {
					role: "system",
					content:
						session.memoryPrompt.length > 0
							? Locale.Store.Prompt.History(session.memoryPrompt)
							: "",
					date: "",
				} as ChatMessage;
			},

			getMessagesWithMemory(_session?: ChatSession) {
				// 定义一个session
				const session = get().getSession(_session);

				const modelConfig = session.mask.modelConfig;
				const clearContextIndex = session.clearContextIndex ?? 0;
				const messages = session.messages.slice();
				const totalMessageCount = session.messages.length;

				// in-context prompts
				const contextPrompts = session.mask.context.slice();

				// system prompts, to get close to OpenAI Web ChatGPT
				const shouldInjectSystemPrompts = modelConfig.enableInjectSystemPrompts;
				const systemPrompts = shouldInjectSystemPrompts
					? [
							createMessage({
								role: "system",
								content: fillTemplateWith("", {
									...modelConfig,
									template: getDefaultSystemTemplate(),
								}),
							}),
					  ]
					: [];
				if (shouldInjectSystemPrompts) {
					// console.log(
					//   "[Global System Prompt] ",
					//   systemPrompts.at(0)?.content ?? "empty",
					// );
					console.log("[Global System Prompt] : true");
				}

				// long term memory
				const shouldSendLongTermMemory =
					modelConfig.sendMemory &&
					session.memoryPrompt &&
					session.memoryPrompt.length > 0 &&
					session.lastSummarizeIndex > clearContextIndex;
				const longTermMemoryPrompts = shouldSendLongTermMemory
					? [get().getMemoryPrompt()]
					: [];
				const longTermMemoryStartIndex = session.lastSummarizeIndex;

				// short term memory
				const shortTermMemoryStartIndex = Math.max(
					0,
					totalMessageCount - modelConfig.historyMessageCount,
				);

				// lets concat send messages, including 4 parts:
				// 0. system prompt: to get close to OpenAI Web ChatGPT
				// 1. long term memory: summarized memory messages
				// 2. pre-defined in-context prompts
				// 3. short term memory: latest n messages
				// 4. newest input message
				const memoryStartIndex = shouldSendLongTermMemory
					? Math.min(longTermMemoryStartIndex, shortTermMemoryStartIndex)
					: shortTermMemoryStartIndex;
				// and if user has cleared history messages, we should exclude the memory too.
				const contextStartIndex = Math.max(clearContextIndex, memoryStartIndex);
				const maxTokenThreshold = modelConfig.max_tokens;

				// get recent messages as much as possible
				const reversedRecentMessages = [];
				for (
					let i = totalMessageCount - 1, tokenCount = 0;
					i >= contextStartIndex && tokenCount < maxTokenThreshold;
					i -= 1
				) {
					const msg = messages[i];
					if (!msg || msg.isError) continue;
					tokenCount += estimateTokenLength(msg.content);
					reversedRecentMessages.push(msg);
				}

				// concat all messages
				const recentMessages = [
					...systemPrompts,
					...longTermMemoryPrompts,
					...contextPrompts,
					...reversedRecentMessages.reverse(),
				];

				return recentMessages;
			},

			updateMessage(
				sessionIndex: number,
				messageIndex: number,
				updater: (message?: ChatMessage) => void,
			) {
				const sessions = get().sessions;
				const session = sessions.at(sessionIndex);
				const messages = session?.messages;
				updater(messages?.at(messageIndex));
				set(() => ({ sessions }));
			},

			resetSession() {
				get().updateCurrentSession((session) => {
					session.messages = [];
					session.memoryPrompt = "";
				});
			},

			updateStat(message: ChatMessage) {
				get().updateCurrentSession((session) => {
					session.stat.charCount += message.content.length;
					// TODO: should update chat count and word count
				});
			},

			updateCurrentSession(updater: (session: ChatSession) => void) {
				const sessions = get().sessions;
				const index = get().currentSessionIndex;
				updater(sessions[index]);
				set(() => ({ sessions }));
			},
			updateSession(
				sessionId: string | undefined,
				updater: (session: ChatSession) => void,
			) {
				if (sessionId) {
					set((state) => ({
						sessions: state.sessions.map((session) => {
							if (session.id === sessionId) {
								updater(session);
							}
							return session;
						}),
					}));
				} else {
					this.updateCurrentSession(updater);
				}
			},

			setworkflow(_session: ChatSession, isworkflow: boolean) {
				const sessionId = _session.id;
				set((state) => ({
					sessions: state.sessions.map((session) => {
						if (session.id === sessionId) {
							session.isworkflow = isworkflow;
						}
						return session;
					}),
				}));
			},

			clearAllData() {
				localStorage.clear();
				location.reload();
			},
		};

		return methods;
	},
	{
		name: StoreKey.Chat,
		version: 3.2,
		migrate(persistedState, version) {
			const state = persistedState as any;
			const newState = JSON.parse(
				JSON.stringify(state),
			) as typeof DEFAULT_CHAT_STATE;

			if (version < 2) {
				newState.sessions = [];

				const oldSessions = state.sessions;
				for (const oldSession of oldSessions) {
					const newSession = createEmptySession();
					newSession.topic = oldSession.topic;
					newSession.messages = [...oldSession.messages];
					newSession.mask.modelConfig.sendMemory = true;
					newSession.mask.modelConfig.historyMessageCount = 4;
					newSession.mask.modelConfig.compressMessageLengthThreshold = 1000;
					newState.sessions.push(newSession);
				}
			}

			if (version < 3) {
				// migrate id to nanoid
				newState.sessions.forEach((s) => {
					s.id = nanoid();
					s.messages.forEach((m) => (m.id = nanoid()));
				});
			}

			// Enable `enableInjectSystemPrompts` attribute for old sessions.
			// Resolve issue of old sessions not automatically enabling.
			if (version < 3.1) {
				newState.sessions.forEach((s) => {
					if (
						// Exclude those already set by user
						!s.mask.modelConfig.hasOwnProperty("enableInjectSystemPrompts")
					) {
						// Because users may have changed this configuration,
						// the user's current configuration is used instead of the default
						const config = useAppConfig.getState();
						s.mask.modelConfig.enableInjectSystemPrompts =
							config.modelConfig.enableInjectSystemPrompts;
					}
				});
			}

			//  add isworkflow attribute to old sessions
			if (version < 3.2) {
				newState.sessions.forEach((s) => {
					s.isworkflow = false;
				});
			}

			return newState as any;
		},
	},
);
