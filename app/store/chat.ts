import { trimTopic } from "../utils";

import Locale, { getLang } from "../locales";
import { showToast } from "../components/ui-lib";
import { ModelConfig, ModelType, useAppConfig } from "./config";
import { createEmptyMask } from "./mask";
import {
	DEFAULT_MODELS,
	KnowledgeCutOffDate,
	StoreKey,
	SUMMARIZE_MODEL,
} from "../constant";

import {
	DEFAULT_INPUT_TEMPLATE,
	DEFAULT_SYSTEM_TEMPLATE,
	getDefaultSystemTemplate,
} from "@/app/chains/base";

import { api, RequestMessage } from "../client/api";
import { ChatControllerPool } from "../client/controller";
import { prettyObject } from "../utils/format";
import { estimateTokenLength } from "../utils/token";
import { nanoid } from "nanoid";
import {
	createChat,
	createChatSession,
	getChat,
	updateChatSession,
} from "../api/backend/chat";
import { UserStore, useUserStore } from "./user";
import { BUILTIN_MASKS } from "../masks";
import type { BuiltinMask } from "../types/index";
import { Plugin, usePluginStore } from "../store/plugin";
import { sendChatMessage, handleChatCallbacks } from "../services/chatService";
import { midjourneyOnUserInput } from "../services/midjourneyService";
// import { DEFAULT_TOPIC, BOT_HELLO } from "./constant";

import { createPersistStore } from "../utils/store";

import { summarizeTitle, summarizeSession } from "../chains/summarize";

import { CreateChatData } from "../api/backend/chat";
import { is } from "cheerio/lib/api/traversing";

import { getMessageTextContent, getMessageImages } from "../utils";

import {
	ChatMessage,
	ChatToolMessage,
	ChatSession,
	MJMessage,
} from "../types/index";
import { Mask } from "../types/index";

import { FileInfo } from "../client/platforms/utils";
import { fillTemplateWith } from "@/app/chains/base";
import { MultimodalContent } from "../client/api";

export function createMessage(override: Partial<ChatMessage>): ChatMessage {
	const randomId = nanoid();
	return {
		id: randomId,
		nanoid: randomId,
		date: new Date().toLocaleString(),
		toolMessages: new Array<ChatToolMessage>(),
		role: "user",
		content: "",
		image_url: "",
		...override,
	};
}

export const DEFAULT_TOPIC = Locale.Store.DefaultTopic || "默认话题";

export const BOT_HELLO: ChatMessage = createMessage({
	role: "assistant",
	content: Locale.Store.BotHello,
});

function createEmptySession(): ChatSession {
	return {
		id: nanoid(),
		session_id: "",
		topic: DEFAULT_TOPIC,
		memoryPrompt: "",
		messages: [],
		stat: {
			tokenCount: 0,
		},
		lastUpdate: Date.now(),
		lastSummarizeIndex: 0,
		mask: createEmptyMask(),
		isworkflow: false,
		mjConfig: { size: "", quality: "", stylize: "", model: "" },
		isDoubleAgent: false,
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
	return msgs.reduce(
		(pre, cur) => pre + estimateTokenLength(getMessageTextContent(cur)),
		0,
	);
}

const DEFAULT_CHAT_STATE = {
	sessions: [createEmptySession()],
	currentSessionIndex: 0,
	currentSessionId: "",
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
					currentSessionId: get().sessions[index].id,
				});
			},
			selectSessionById(id: string) {
				const index = get().sessions.findIndex((s) => s.id === id);
				if (index !== -1) {
					get().selectSession(index);
				}

				set(() => ({ currentSessionId: id }));
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

			async newSession(
				mask?: Mask,
				userStore?: UserStore,
				isworkflow?: boolean,
			) {
				const config = useAppConfig.getState();
				const session = createEmptySession();
				const userId = useUserStore.getState().user.id;
				const globalModelConfig = config.modelConfig;

				// 使用类型守卫来检查 'id' 属性是否存在
				const defaultMaskId = "1000";
				const selectedMask: any = mask;
				const isCustomMask =
					!("id" in selectedMask) || isNaN(Number(selectedMask.id));

				// 如果 selectedMask 没有 'id' 属性，我们提供一个默认值
				session.mask = {
					...selectedMask,
					id: isCustomMask ? defaultMaskId : selectedMask.id,
					modelConfig: {
						...globalModelConfig,
						...selectedMask.modelConfig,
					},
				};

				session.topic = selectedMask.name;
				if (isworkflow) {
					session.isworkflow = true;
				}

				// 处理 userStore 相关逻辑
				if (userStore) {
					const promptId = isCustomMask ? "2000" : session.mask.prompt_id;
					const data = {
						user: userId,
						id: session.mask.id,
						prompt_id: promptId,
						isworkflow: session.isworkflow,
						mask: session.mask,
						mjConfig: session.mjConfig,
						topic: session.mask.topic ?? session.mask.name,
						model: session.mask.modelConfig.model,
						hide: false,
					};

					// 使用 async/await 优化异步请求处理
					const res = await createChatSession(data);
					console.log("createChatSession: ", res);

					session.id = res.data.session_id || nanoid();
				}

				set((state) => ({
					currentSessionIndex: 0,
					currentSessionId: session.id,
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

				const sessionid = deletedSession.id;

				// update session
				updateChatSession(sessionid, { hide: true });

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
							topic: session.mask.topic ?? session.mask.name,
							isworkflow: session.isworkflow,
							mask: session.mask,
							mjConfig: session.mjConfig,
							model: session.mask.modelConfig.model,
							prompt_id: "100000",
							hide: false,
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
							updateChatSession(sessionid, { hide: false });
						},
					},
					5000,
				);
			},

			currentSession() {
				let index = get().currentSessionIndex;
				const sessions = get().sessions;

				if (index === undefined || index === null) {
					throw new Error("Index is not defined");
				}

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
				summarizeSession();
			},

			addMessageToSession: (sessionId: string, newMessage: ChatMessage) => {
				set((state) => ({
					sessions: state.sessions.map((session) => {
						if (session.session_id === sessionId) {
							session.messages = [...session.messages, newMessage];
						}
						return session;
					}),
				}));
			},
			sortSession() {
				set((state) => {
					// Create a new sorted array instead of modifying the existing state directly
					const sortedSessions = [...state.sessions].sort(
						(a, b) => b.lastUpdate - a.lastUpdate,
					);

					// Check if the sorted array is different from the current state to avoid unnecessary updates
					if (
						JSON.stringify(state.sessions) !== JSON.stringify(sortedSessions)
					) {
						return { sessions: sortedSessions };
					}

					// If the sorted array is the same as the current state, do not update the state
					return state;
				});
				// console.log("sortSession", get().sessions);
			},

			addSession(newSession: ChatSession) {
				set((state) => ({ sessions: [...state.sessions, newSession] }));
				get().sortSession();
			},

			forceUpdate: () => {
				set({});
			},

			async onUserInput(
				content: string,
				attachImages?: string[],
				attachFiles?: FileInfo[],
				_session?: ChatSession,
			) {
				// if sessionID is not provided, use current session, else use the session with the provided ID

				const session = get().getSession(_session);
				const sessionId = session.id;
				const sessionModel = session.mask.modelConfig.model;
				const modelConfig = session.mask.modelConfig;

				// get recent messages
				const recentMessages = get().getMessagesWithMemory(session);
				const messageIndex = get().currentSession().messages.length + 1;

				const userStore = useUserStore.getState();

				const createChatData: CreateChatData = {
					user: userStore.user.id, // 替换为实际的用户 ID
					chat_session: sessionId, // 替换为实际的聊天会话 ID
					message: content, // 使用用户输入作为 message 参数
					memory: recentMessages,
					role: "user",
					model: session.mask.modelConfig.model,
				};
				const chatResponse = await createChat(createChatData); // 替换为实际的API调用

				// if chatResponse code return 4000 or 401 , throw error

				const data = chatResponse.data;
				const user_chat_id = data.chat_id;
				const newSessionId = data.chat_session;
				// console.log("user_chat_id: ", user_chat_id);
				// console.log("newSessionId: ", newSessionId);

				if (sessionId !== newSessionId) {
					get().updateSession(sessionId, (session: ChatSession) => {
						session.id = newSessionId;
					});
				}

				if (sessionModel === "midjourney") {
					const mjparams = {
						content: content,
						image_url: "",
						_session: session,
						action: undefined,
						taskId: undefined,
						index: undefined,
						chat_id: user_chat_id,
					};
					await midjourneyOnUserInput(mjparams);
					return;
				}

				const userContent = content;
				console.log("[User Input] after template: ", userContent);

				let mContent: string | MultimodalContent[] = userContent;

				if (attachImages && attachImages.length > 0) {
					mContent = [
						{
							type: "text",
							text: userContent,
						},
					];
					mContent = mContent.concat(
						attachImages.map((url) => {
							return {
								type: "image_url",
								image_url: {
									url: url,
								},
							};
						}),
					);
				}

				const userMessage: ChatMessage = createMessage({
					id: user_chat_id,
					role: "user",
					content: mContent,
					fileInfos: attachFiles,
				});

				console.log("[userMessage] ", userMessage);

				const botMessage: ChatMessage = createMessage({
					role: "assistant",
					streaming: true,
					model: modelConfig.model,
					toolMessages: [],
					isFinished: false,
				});
				// console.log("[botMessage] ", botMessage);
				const sendMessages = recentMessages.concat(userMessage);

				get().updateSession(sessionId, (session: ChatSession) => {
					const savedUserMessage = {
						...userMessage,
						content: mContent,
					};
					session.messages = session.messages.concat([
						savedUserMessage,
						botMessage,
					]);
					session.responseStatus = false;
					session.lastUpdate = Date.now();
					set((state) => ({ currentSessionIndex: 0 }));
				});
				console.log("click send: ", session.topic, session.responseStatus);

				sendChatMessage(
					// 调用发送消息函数
					session,
					sendMessages,
					handleChatCallbacks(botMessage, userMessage, messageIndex, session),
				);
			},
			updateSessionMessage(
				session: ChatSession,
				botMessageId: string,
				content: string,
				imageUrl = [],
				mjresult?: MJMessage,
			) {
				const chatStoreState = useChatStore.getState();

				const sync = false;
				chatStoreState.updateSession(
					session.id,
					() => {
						const messageIndex = session.messages.findIndex(
							(m) => m.id === botMessageId,
						);
						if (messageIndex !== -1) {
							const currentMessage = session.messages[messageIndex];
							if (
								currentMessage.content !== content ||
								currentMessage.image_url !== imageUrl
							) {
								const updatedBotMessage: ChatMessage = {
									...currentMessage,
									content: content,
									image_url: imageUrl,
									mjstatus: mjresult,
								};
								session.messages[messageIndex] = updatedBotMessage;
							}
						}
						session.lastUpdate = Date.now();
					},
					sync,
				);
			},

			getMemoryPrompt() {
				const session = get().currentSession();

				return {
					role: "system",
					content:
						session.memoryPrompt?.length > 0
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
				const injectSetting = {
					injectUserInfo: modelConfig.enableUserInfos,
					injectRelatedQuestions: modelConfig.enableRelatedQuestions,
				};
				const systemPrompts = shouldInjectSystemPrompts
					? [
							createMessage({
								role: "system",
								content: fillTemplateWith("", injectSetting),
							}),
						]
					: [];
				if (shouldInjectSystemPrompts) {
					// console.log(
					// 	"[Global System Prompt] ",
					// 	systemPrompts.at(0)?.content ?? "empty",
					// );
					// console.log("[Global System Prompt] : true");
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
					tokenCount += estimateTokenLength(getMessageTextContent(msg));
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

			updateCurrentSession(updater: (session: ChatSession) => void) {
				const sessions = get().sessions;
				const index = get().currentSessionIndex;
				updater(sessions[index]);
				set(() => ({ sessions }));
			},
			updateSession(
				sessionId: string | undefined,
				updater: (session: ChatSession) => void,
				// add another parameter to control whether to sync with backend, default is true
				sync = true,
			) {
				if (sessionId) {
					set((state) => ({
						sessions: state.sessions.map((session) => {
							if (session.id === sessionId) {
								const updatedFields = updater(session);
								Object.assign(session, updatedFields);
								if (sync) {
									updateChatSession(sessionId, session);
								}
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
							const data = {
								isworkflow: isworkflow,
							};
							updateChatSession(sessionId, session);
						}
						return session;
					}),
				}));
			},
			clearChatData() {
				localStorage.removeItem(StoreKey.Chat);
				location.reload();
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
		version: 3.4,
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
					s.mjConfig = {
						size: "",
						quality: "",
						stylize: "",
						model: "",
						speed: "",
						seed: "",
					};
				});
			}
			if (version < 3.4) {
				newState.sessions.forEach((s) => {
					s.mask.modelConfig.enableRelatedQuestions = false;
					s.mask.modelConfig.enableUserInfos = true;
				});
			}

			return newState as any;
		},
	},
);
