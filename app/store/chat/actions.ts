import { nanoid } from "nanoid";
import { ChatSession, ChatMessage } from "../../types/chat";
import { ChatActions, ChatState, ChatSelectors } from "./types";
import { createEmptySession, createMessage } from "./utils";
import { Mask } from "../../types/mask";
import { UserStore, useUserStore } from "../user";
import {
	createChatSession,
	updateChatSession,
	createChat,
} from "@/app/services/api/chats";
import {
	sendChatMessage,
	handleChatCallbacks,
	createChatDataAndFetchId,
} from "@/app/services/chatService";
import { estimateTokenLength } from "@/app/utils/chat/token";
import { getMessagesWithMemory } from "@/app/(chat-pages)/chats/chat/inputpanel/utils/chatMessage";
import { createEmptyMask } from "../mask/utils";
import { summarizeSession } from "@/app/chains/summarize";
import { FileInfo } from "@/app/client/platforms/utils";
import { getMessageTextContent } from "@/app/utils";
import { Reference } from "@/app/api/langchain/tool/agent/agentapi";
import {
	CodeBlock,
	DocumentMeta,
} from "@/app/api/langchain/tool/agent/agentapi";
import { manageActiveSessions } from "./utils";

export const createChatActions = (
	set: (
		partial: Partial<ChatState> | ((state: ChatState) => Partial<ChatState>),
	) => void,
	get: () => ChatState & ChatActions & ChatSelectors,
): ChatActions => ({
	create: async (mask?: Mask, userStore?: UserStore) => {
		const userId = userStore?.user?.id;
		const selectedMask = mask ?? createEmptyMask();

		try {
			const sessionData = {
				user: userId,
				active: true,
				agent: selectedMask.id,
				session_topic: "未命名话题",
				session_summary: "",
				session_description: "",
				custom_agent_data: selectedMask,
			};

			const res = await createChatSession(sessionData);
			if (!res.id) throw new Error("Failed to create chat session");

			const newSession = createEmptySession({
				id: res.id,
				mask: selectedMask,
			});

			const sessions = get().sessions;
			sessions[newSession.id] = newSession;

			set({
				sessions,
				currentSessionId: newSession.id,
			});

			return newSession;
		} catch (error) {
			console.error("Error creating chat session:", error);
			throw error;
		}
	},
	setCurrentSessionId: (id: string) => {
		const { sessions, activeSessionIds } = get();
		const { activeSessionIds: newActiveSessionIds, sessions: updatedSessions } =
			manageActiveSessions(activeSessionIds, sessions, id);

		set({
			currentSessionId: id,
			activeSessionIds: newActiveSessionIds,
			sessions: updatedSessions,
		});
	},

	updateState: (state: Partial<ChatState>) => set(state),

	add: (session: ChatSession) => {
		const { sessions } = get();
		sessions[session.id] = session;
		set({ sessions });

		return sessions;
	},

	updateSession: (
		id: string,
		updater: (session: ChatSession) => void,
		sync = true,
	) => {
		const sessions = get().sessions;
		const session = sessions[id];
		if (!session) return;

		updater(session);

		set({ sessions: { ...sessions } });

		if (sync) {
			updateChatSession(session, id).catch(console.error);
		}
	},

	updateMessage: (
		sessionId: string,
		messageId: string,
		updater: (message: ChatMessage) => void,
	) => {
		const sessions = get().sessions;
		const session = sessions[sessionId];
		if (!session) return;

		const message = session.messages.find(
			(m: ChatMessage) => m.id === messageId,
		);
		if (!message) return;

		updater(message);
		set({ sessions: { ...sessions } });
	},

	resetSession: (sessionId: string) => {
		const sessions = get().sessions;
		const session = sessions[sessionId];
		if (!session) return;

		session.messages = [];
		session.memoryPrompt = "";
		set({ sessions: { ...sessions } });
	},

	async onNewMessage(message: ChatMessage) {
		const sessions = get().sessions;
		const currentSessionId = get().currentSessionId;
		if (!currentSessionId) return;

		const session = sessions[currentSessionId];
		if (!session) return;

		const { summary } = await summarizeSession(session);
		session.memoryPrompt = summary;
		session.lastUpdateTime = Date.now();
		set({ sessions: { ...sessions } });
	},
	addMessageToSession: (sessionId: string, message: ChatMessage) => {
		const sessions = get().sessions;
		const session = sessions[sessionId];
		if (!session) return;
		session.messages.push(message);
		set({ sessions: { ...sessions } });
	},
	prependMessages: (sessionId: string, messages: ChatMessage[]) => {
		const sessions = get().sessions;
		const session = sessions[sessionId];
		if (!session) return;

		session.messages = [...messages, ...session.messages];
		set({ sessions: { ...sessions } });
	},

	getMessagesWithMemory: (session?: ChatSession) => {
		const currentSession = session ?? get().sessions[get().currentSessionId!];
		if (!currentSession) return [];

		return getMessagesWithMemory(currentSession).recentMessages;
	},

	deleteSession: async (id: string) => {
		const sessions = get().sessions;
		await updateChatSession({ active: false }, id);
		delete sessions[id];
		set({ sessions: { ...sessions } });
	},

	async onUserInput(
		content: string,
		attachImages?: string[],
		attachFiles?: FileInfo[],
		_session?: ChatSession,
	) {
		const store = get();
		const session = _session ?? store.sessions[store.currentSessionId!];
		if (!session) return;

		const userStore = useUserStore.getState();

		const sessionId = session.id;
		const modelConfig = session.mask.modelConfig;

		const tools = session.mask.plugins;
		const files = session.attachFiles;

		// 获取最近的消息
		const { recentMessages, recentMessagesTokenCount } = getMessagesWithMemory(
			session,
			tools,
			files,
		);

		const contentTokenCount = estimateTokenLength(content);
		const total_token_count = recentMessagesTokenCount + contentTokenCount;

		let sendMessages: ChatMessage[];

		const commonChatData = {
			user: userStore.user.id,
			sessionId: sessionId, // 替换为实际的聊天会话 ID
			model: session.mask.modelConfig.model,
			contentType: "chatsession",
		};

		try {
			const createChatData = {
				...commonChatData,
				content: content,
				attachImages: attachImages,
				recentMessages: recentMessages as ChatMessage[],
				chat_role: "user",
				sender_name: userStore.user.nickname,
				totalTokenCount: total_token_count,
			};

			const { chat_id, id } = await createChatDataAndFetchId(createChatData);

			const userMessage = createMessage({
				id,
				chat_id,
				role: "user",
				content,
				image_url: attachImages,
				fileInfos: attachFiles,
				token_counts_total: total_token_count,
			});

			const userMessagetoSend = !attachImages
				? userMessage
				: ({
						role: "user",
						content: [
							{ type: "text", text: content },
							...attachImages!.map((item: string) => ({
								type: "image_url",
								image_url: { url: item },
							})),
						],
					} as ChatMessage);

			const botMessage = createMessage({
				role: "assistant",
				streaming: true,
				model: modelConfig.model,
				toolMessages: [],
				isFinished: false,
			});

			sendMessages = [...recentMessages, userMessagetoSend as ChatMessage];
			// 更新会话
			store.updateSession(
				sessionId,
				(session: ChatSession) => {
					session.attachFiles = (session.attachFiles || []).concat(
						attachFiles || [],
					);
					session.messages = session.messages.concat([userMessage, botMessage]);
					session.lastUpdateTime = Date.now();
				},
				false,
			);
			store.sortSessions();
			set(
				(state) =>
					({
						currentSessionIndex: 0,
					}) as Partial<ChatState>,
			);

			// 发送函数回调
			const onUpdateCallback = (message: string) => {
				botMessage.content = message;
				botMessage.lastUpdateTime = Date.now();
				store.updateSession(
					sessionId,
					(session: ChatSession) => {
						session.messages = session.messages.concat();
						// session.messages = [...session.messages];
					},
					false,
				);
			};

			const onToolUpdateCallback = (
				toolName: string,
				toolInput: string,
				type?: string,
				references?: Reference[],
				documents?: DocumentMeta[],
				codeBlocks?: CodeBlock[],
			) => {
				// 这里可以进行 tool 更新的逻辑
				console.log(`Tool updated: ${toolName}, Input: ${toolInput}`);
				store.updateSession(
					sessionId,
					(session: ChatSession) => {
						session.messages = session.messages.concat();
						session.lastUpdateTime = Date.now();
					},
					false,
				);
			};

			const onFinishCallback = async (message: string) => {
				// updateSession(message);

				// 其他需要在 onFinish 时执行的逻辑
				const tokenCount = estimateTokenLength(message);
				botMessage.content = message;
				store.updateSession(
					sessionId,
					(session: ChatSession) => {
						session.messages = session.messages.concat();
						// console.log("onUpdateCallback", session.messages);
					},
					true,
				);
				const createBotChatData = {
					...commonChatData,
					content: message,
					attachImages: attachImages,
					recentMessages: recentMessages,
					chat_role: "assistant",
					sender_name: session.mask.name,
					sender_id: session.mask.id,
					totalTokenCount: tokenCount,
				};
				// console.log("[createBotChatData] ", createBotChatData);

				const { chat_id, id } =
					await createChatDataAndFetchId(createBotChatData);

				if (id) {
					botMessage.id = id;
					botMessage.chat_id = chat_id.toString();
					botMessage.isFinished = true;
					botMessage.isTransfered = false;
					botMessage.token_counts_total = tokenCount;
					// 使用 setTimeout 使 onNewMessage 不会阻塞 onFinishCallback
					get().onNewMessage(botMessage);
				}
			};
			// 发送消息
			await sendChatMessage(
				session.id,
				session.mask,
				sendMessages,
				handleChatCallbacks(
					botMessage,
					userMessage,
					session,
					onUpdateCallback,
					onToolUpdateCallback,
					onFinishCallback,
				),
			);
		} catch (error) {
			console.error("[Error] createChat API call failed:", error);
			const botError = (error as Error).message;

			const userMessage = createMessage({
				id: nanoid(),
				role: "user",
				content,
				image_url: attachImages,
				fileInfos: attachFiles,
				token_counts_total: total_token_count,
			});

			const botMessage = createMessage({
				role: "assistant",
				streaming: false,
				model: modelConfig.model,
				toolMessages: [],
				isFinished: false,
				content: botError,
			});

			store.updateSession(
				sessionId,
				(session: ChatSession) => {
					session.messages = session.messages.concat([userMessage, botMessage]);
					session.lastUpdateTime = Date.now();
				},
				false,
			);
		}
	},

	clearSessions: () => {
		set({ sessions: {}, currentSessionId: null });
	},

	sortSessions: () => {
		const sessions = get().sessions;
		const sortedSessions = Object.values(sessions)
			.sort(
				(a: ChatSession, b: ChatSession) => b.lastUpdateTime - a.lastUpdateTime,
			)
			.reduce(
				(acc: Record<string, ChatSession>, session: ChatSession) => {
					acc[session.id] = session;
					return acc;
				},
				{} as Record<string, ChatSession>,
			);

		set({ sessions: sortedSessions });
	},

	markUpdate: () => {
		set((state) => ({ total: state.total + 1 }));
	},
});
