// src/app/store/doubleAgent.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StateCreator } from "zustand";
import { DoubleAgentData, createDoubleAgentSession } from "../api/backend/chat";
import { MultimodalContent, RequestMessage } from "../client/api";
import { nanoid } from "nanoid";
import { estimateTokenLength } from "../utils/chat/token";
import { Conversation } from "microsoft-cognitiveservices-speech-sdk";
import { contextSummarize } from "../chains/summarize";
import { Mask, ChatMessage, ChatToolMessage } from "../types/index";
import { getMessageImages, getMessageTextContent } from "../utils";
import {
	createMultipleAgentSession,
	updateMultiAgentSession,
} from "../services/api/chats";
import { FileInfo } from "../client/platforms/utils";
import { useUserStore } from "./user";
import { getMessagesWithMemory } from "../(chat-pages)/chats/chat/inputpanel/utils/chatMessage";
import { createMessage } from "./chat";
import { createChatDataAndFetchId } from "../services/chatService";
import {
	decideNextAgent,
	sendNextAgentMessage,
} from "../(chat-pages)/double-agents/service/MultiAgentService";
import { AttachImages } from "../(chat-pages)/chats/chat/inputpanel/components/AttachImages";

export type MultiAgentChatMessage = ChatMessage & {
	agentId: number | string | null;
	agentName: string;
};

// 定义服务端返回的消息类型
interface ServerMessage {
	id: number;
	chat_id: string;
	content: string;
	chat_role: string;
	chat_model: string;
	chat_images: string[];
	function_calls: any[];
	token_counts_total: number;
	object_id: number;
	sender_name: string;
	sender_id: string | null;
	created_at: string;
	updated_at: string;
	user: number;
}

// 转换函数
const mapServerMessageToChatMessage = (
	serverMessage: ServerMessage,
): MultiAgentChatMessage => {
	return {
		id: serverMessage.id.toString(),
		chat_id: serverMessage.chat_id,
		content: serverMessage.content,
		role: serverMessage.chat_role as "system" | "user" | "assistant",
		date: new Date(serverMessage.created_at).toISOString(),
		model: serverMessage.chat_model,
		image_url: serverMessage.chat_images,
		token_counts_total: serverMessage.token_counts_total,
		agentName: serverMessage.sender_name,
		agentId: serverMessage.sender_id,
		// 根据需要添加其他字段的映射
	};
};

export type MultiAgentChatSession = {
	id: string;
	aiConfigs: Mask[]; // 存储多个 agent 的配置
	topic: string;
	userAdditionInput?: string;
	messages: MultiAgentChatMessage[];
	lastUpdateTime: number;
	updated_at: string;
	created_at: string;
	memory?: any; // 其他可能的会话相关状态
	totalRounds: number; // 迭代次数
	round: number; // 轮次
	paused?: boolean; // 是否暂停
	next_agent_type: "round-robin" | "random" | "intelligent"; // 选择下一个 agent 的策略
	conversation_mode: "chat" | "task"; // 对话模式
};

export const MULTI_AGENT_DEFAULT_TOPIC = "未定义话题";

type StoreState = {
	currentConversationId: string; // 当前会话ID
	conversations: MultiAgentChatSession[]; // 会话列表
	startConversation: (
		topic: string,
		conversationId: string,
		initialInput: string,
	) => void;
	setCurrentConversationId: (id: string) => void;
	fetchNewConversations: (data: any) => void;
	fetchNewMessages: (conversationId: string, messages: any) => void;
	currentSession: () => MultiAgentChatSession;
	addAgent: (conversationId: string, config: Mask) => void;
	setAIConfig: (conversationId: string, agentId: number, config: Mask) => void;
	clearAIConfig: (conversationId: string, agentId: number) => void;
	sortedConversations: () => MultiAgentChatSession[];
	clearConversation: (conversationId: string) => void;
	updateMessages: (
		conversationId: string,
		message: MultiAgentChatMessage,
	) => void;
	updateSingleMessage: (
		conversationId: string,
		messageId: string,
		newMessageContent: ChatMessage,
		toolsMessage?: ChatToolMessage[],
		newMessageId?: string,
	) => void;
	updateMultiAgentsChatsession: (
		conversationId: string,
		updates: Partial<MultiAgentChatSession>,
	) => void;
	putMultiAgentSessionData: (conversationId: string) => void;
	updateConversation: (
		conversationId: string,
		conversation: MultiAgentChatSession,
	) => void;
	deleteConversation: (conversationId: string | number) => void;
	// return round
	onUserInput: (
		content: string,
		attachImages: string[],
		attachFiles: FileInfo[] | undefined,
		session: MultiAgentChatSession,
	) => Promise<void>;
	handleUserInput: (
		content: string,
		attachImages: string[],
		attachFiles: FileInfo[] | undefined,
		session: MultiAgentChatSession,
	) => Promise<{
		userMessage: ChatMessage;
		recentMessages: ChatMessage[];
	}>;

	updateRound: (conversationId: string) => { round: number };
	getHistory: (conversationId: string) => MultiAgentChatMessage[];
	summarizeSession: (conversationId: string) => Promise<any>;

	prepareBotMessage: (conversationId: string) => {
		botMessage: MultiAgentChatMessage;
		selectedAgent: Mask;
		nextAgentIndex: number;
	};
	updateBotMessage: (
		sessionId: string,
		message: MultiAgentChatMessage,
		newMessageId?: string,
	) => void;
	finalizeBotMessage: (
		sessionId: string,
		message: MultiAgentChatMessage,
	) => Promise<MultiAgentChatMessage>;
};
export function createMultiAgentChatMessage(
	override: Partial<MultiAgentChatMessage>,
): MultiAgentChatMessage {
	return {
		id: nanoid(),
		date: new Date().toISOString(),
		content: "",
		role: "user",
		streaming: false,
		toolMessages: [],
		preview: false,
		agentId: null, // Add this line
		agentName: "", // Add this line

		...override,
	};
}

const storeCreator: StateCreator<StoreState> = (set, get) => ({
	currentConversationId: "",
	aiConfigs: [], // 存储多个 agent 的配置

	conversations: [],
	startConversation: (topic: string, conversationId: string) => {
		set((state) => {
			const newConversation: MultiAgentChatSession = {
				id: conversationId,
				aiConfigs: [] as Mask[],
				topic: topic,
				messages: [],
				lastUpdateTime: new Date().getTime(),
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
				memory: "",
				totalRounds: 0,
				round: 0,
				paused: false,
				next_agent_type: "round-robin",
				conversation_mode: "chat",
			};

			const newState = {
				currentConversationId: conversationId,
				conversations: [...state.conversations, newConversation],
			};

			return newState;
		});
		get().sortedConversations();
	},
	setCurrentConversationId: (id) => set({ currentConversationId: id }),
	currentSession: () => {
		const { currentConversationId, conversations } = get();
		return (
			conversations.find((session) => session.id === currentConversationId) ||
			({} as MultiAgentChatSession)
		);
	},
	fetchNewConversations(data: any[]) {
		const existingConversations = get().conversations;

		const newConversations: MultiAgentChatSession[] = data.map(
			(session: any) => ({
				id: session.id,
				aiConfigs: session.custom_agents_data || [], // 使用多个 agent 配置
				topic: session.session_topic || MULTI_AGENT_DEFAULT_TOPIC,
				userAdditionInput: "",
				messages: [], // 这里假设没有初始消息，需要后续加载
				lastUpdateTime: Date.parse(session.updated_at),
				created_at: session.created_at,
				updated_at: session.updated_at,
				totalRounds: 0, // 假设初始为 0，需要后续更新
				round: 0, // 假设初始为 0，需要后续更新
				paused: false, // 默认不暂停
				next_agent_type: "round-robin", // 默认使用轮询策略
				memory: "",
				conversation_mode: "chat",
			}),
		);

		const updatedConversations = existingConversations.slice(); // 创建现有会话的副本

		newConversations.forEach((newConv: MultiAgentChatSession) => {
			const index = updatedConversations.findIndex(
				(conv) => conv.id === newConv.id,
			);

			if (index !== -1) {
				// 比较 lastUpdateTime
				if (
					newConv.lastUpdateTime > updatedConversations[index].lastUpdateTime
				) {
					// 如果现有的 aiConfigs 配置 存在则保留, 不存在则替换
					if (updatedConversations[index].aiConfigs) {
						newConv.aiConfigs = updatedConversations[index].aiConfigs;
					} else {
						newConv.aiConfigs = newConv.aiConfigs;
					}
					updatedConversations[index] = newConv;
				}
			} else {
				updatedConversations.push(newConv);
			}
		});

		set({
			conversations: updatedConversations,
		});
		get().sortedConversations();
	},
	fetchNewMessages: (
		conversationId: string,
		messages: MultiAgentChatMessage,
	) => {
		set((state) => {
			const updatedConversations = state.conversations.map((session) => {
				if (session.id === conversationId) {
					const newMessages = messages.map(mapServerMessageToChatMessage);

					// 创建一个 Map 来存储现有消息，以便快速查找
					const existingMessagesMap = new Map(
						session.messages.map((msg) => [msg.id, msg]),
					);

					// 处理新消息：更新现有消息或添加新消息
					newMessages.forEach((newMsg: MultiAgentChatMessage) => {
						if (existingMessagesMap.has(newMsg.id)) {
							// 如果消息已存在，更新它
							existingMessagesMap.set(newMsg.id, {
								...existingMessagesMap.get(newMsg.id),
								...newMsg,
							});
						} else {
							// 如果是新消息，添加到 Map 中
							existingMessagesMap.set(newMsg.id, newMsg);
						}
					});

					// 将 Map 转换回数组
					const updatedMessages = Array.from(existingMessagesMap.values());

					return {
						...session,
						messages: updatedMessages,
					};
				}
				return session;
			});

			return {
				conversations: updatedConversations,
			};
		});
	},
	addAgent(conversationId, config) {
		//  Add a new agent to the conversation

		set((state) => {
			const updatedConversations = state.conversations.map((session) => {
				if (session.id === conversationId) {
					const updatedAIConfigs = [...session.aiConfigs];

					updatedAIConfigs.push(config);
					return {
						...session,
						aiConfigs: updatedAIConfigs,
					};
				}

				return session;
			});
			return {
				conversations: updatedConversations,
			};
		});
	},
	setAIConfig: (conversationId: string, agentId: number, config: Mask) =>
		set((state) => {
			const updatedConversations = state.conversations.map((conversation) => {
				if (conversation.id === conversationId) {
					const updatedAIConfigs = conversation.aiConfigs.map(
						(aiConfig, index) => {
							if (index === agentId) {
								return { ...aiConfig, ...config };
							}
							return aiConfig;
						},
					);
					return {
						...conversation,
						aiConfigs: updatedAIConfigs,
					};
				}
				return conversation;
			});
			return {
				conversations: updatedConversations,
			};
		}),
	sortedConversations: () => {
		const { conversations } = get();
		// 排序会话列表
		// 按照最后更新时间从新到旧排序
		// 创建新列表

		const sortedConversations = conversations.sort(
			(a, b) => b.lastUpdateTime - a.lastUpdateTime,
		);

		set({ conversations: sortedConversations });

		// console.log("sortedConversations", sortedConversations);
		return sortedConversations;
	},
	clearConversation: (conversationId: string) =>
		set((state) => {
			const updatedConversations = state.conversations.map((conversation) => {
				console.log("conversation.id", conversation.id, conversationId);
				if (conversation.id === conversationId) {
					return {
						...conversation,
						round: 0,
						messages: [],
					};
				}
				return conversation;
			});
			// console.log("updatedConversations", updatedConversations);
			return {
				conversations: updatedConversations,
			};
		}),

	clearAIConfig: (conversationId: string, agentId: number) =>
		set((state) => {
			let updatedAIConfigs: Mask[] = [];
			const updatedConversations = state.conversations.map((conversation) => {
				if (conversation.id === conversationId) {
					updatedAIConfigs = conversation.aiConfigs.filter(
						(_, index) => index !== agentId,
					);
					return {
						...conversation,
						aiConfigs: updatedAIConfigs,
					};
				}
				return conversation;
			});
			return {
				conversations: updatedConversations,
			};
		}),
	// 更新消息
	updateMessages: (conversationId: string, message: MultiAgentChatMessage) =>
		set((state) => {
			const updatedConversations = state.conversations.map((session) => {
				if (session.id === conversationId) {
					return {
						...session,
						messages: [...session.messages, message],
					};
				}

				return session;
			});

			return {
				conversations: updatedConversations,
			};
		}),
	// 更新单条消息
	updateSingleMessage: (
		conversationId: string,
		messageId: string,
		newMessageContent: ChatMessage,
		toolsMessage?: ChatToolMessage[],
		newMessageId?: string,
	) =>
		set((state) => {
			// console.log(
			// 	"updateSingleMessage",
			// 	conversationId,
			// 	messageId,
			// 	newMessageContent.content,
			// 	toolsMessage,
			// 	newMessageId,
			// );
			const updatedConversations = state.conversations.map((session) => {
				if (session.id === conversationId) {
					const messageIndex = session.messages.findIndex(
						(msg) => msg.id === messageId,
					);

					// 确保找到了消息
					if (messageIndex !== -1) {
						const currentMessage = session.messages[messageIndex];
						// 检查新旧消息内容是否一致
						// if (currentMessage.content === newMessageContent.content) {
						// 	// 消息内容没有变化，无需更新
						// 	return session;
						// }

						// 创建一个新的消息数组，其中包含更新后的消息
						const updatedMessages = session.messages.map((message) => {
							if (message.id === messageId) {
								// 更新消息内容
								return {
									...message,
									id: newMessageId || message.id,
									content: newMessageContent.content,
									// 如果需要，还可以更新timestamp或其他属性
									//如果存在 toolsMessage, 则更新
									toolMessages:
										toolsMessage !== undefined
											? toolsMessage
											: message.toolMessages,
									timestamp: Date.now(),
								};
							}
							return message;
						});

						// 返回更新后的会话
						return {
							...session,
							messages: updatedMessages,
						};
					}
				}
				return session;
			});

			// 返回更新后的状态
			return {
				conversations: updatedConversations,
			};
		}),
	// update conversation
	updateConversation: (
		conversationId: string,
		conversation: MultiAgentChatSession,
	) =>
		set((state) => {
			const updatedConversations = state.conversations.map((session) => {
				if (session.id === conversationId) {
					return conversation;
				}
				// 如果会话ID不匹配，则返回原始会话
				return session;
			});
			get().sortedConversations();
			return {
				// 返回更新后的会话
				conversations: updatedConversations,
			};
		}),

	updateMultiAgentsChatsession: (
		conversationId: string,
		updates: Partial<MultiAgentChatSession>,
	) =>
		set((state) => {
			const updatedConversations = state.conversations.map((conversation) => {
				if (conversation.id === conversationId) {
					return {
						...conversation,
						...updates,
						updated_at: new Date().toISOString(),
					};
				}
				return conversation;
			});

			return {
				conversations: updatedConversations,
			};
		}),
	putMultiAgentSessionData: async (conversationId: string) => {
		const state = get();
		const currentSession = state.conversations.find(
			(session) => session.id === conversationId,
		);

		if (!currentSession) {
			throw new Error("Session not found");
		}

		const sessionData = {
			session_topic: currentSession.topic,
			last_update_time: currentSession.lastUpdateTime,
			session_summary: currentSession.memory,
		};

		try {
			await updateMultiAgentSession(sessionData, conversationId);

			return true;
		} catch (error) {
			console.error("Failed to update multi-agent session data:", error);
			throw error;
		}
	},
	deleteConversation: (conversationId: string | number) =>
		set((state) => {
			const updatedConversations = state.conversations.filter(
				(session) => session.id !== conversationId,
			);
			return {
				conversations: updatedConversations,
			};
		}),

	updateRound: (conversationId: string) => {
		set((state) => {
			let newRound: number = 0;
			const updatedConversations = state.conversations.map((session) => {
				if (session.id === conversationId) {
					const newRound = session.round + 1;
					// Check if the newRound is greater than or equal to totalRounds to pause
					if (newRound >= session.totalRounds) {
						console.log("pause", newRound, session.totalRounds);
						return { ...session, round: newRound, paused: true };
					}
					return { ...session, round: newRound };
				}
				return session;
			});

			return { conversations: updatedConversations };
		});
		// 获取更新后的会话round值并返回
		const updatedSession = get().conversations.find(
			(session) => session.id === conversationId,
		);
		return { round: updatedSession ? updatedSession.round : -1 };
	},

	prepareBotMessage: (sessionId: string) => {
		const session = get().conversations.find((m) => m.id === sessionId);
		if (!session) throw new Error("Session not found");

		const nextAgentIndex = decideNextAgent(sessionId);
		const selectedAgent = session.aiConfigs[nextAgentIndex];

		// console.log("double agent", nextAgentIndex, selectedAgent);

		if (!selectedAgent) throw new Error("No agent available for response");

		const botMessage = createMultiAgentChatMessage({
			role: "assistant",
			content: "思考..",
			agentId: selectedAgent.id,
			agentName: selectedAgent.name,
		});

		get().updateMessages(sessionId, botMessage);

		return { botMessage, selectedAgent, nextAgentIndex };
	},

	updateBotMessage: (
		sessionId: string,
		message: MultiAgentChatMessage,
		newMessageId?: string,
	) => {
		// retrive data from message props
		const { id: messageId } = message;
		const { toolsMessage } = message;

		get().updateSingleMessage(
			sessionId,
			messageId,
			message,
			toolsMessage,
			newMessageId,
		);
	},

	finalizeBotMessage: async (
		sessionId: string,
		message: MultiAgentChatMessage,
	) => {
		const { id: userid } = useUserStore.getState().user;
		const session = get().conversations.find((m) => m.id === sessionId);
		if (!session) throw new Error("Session not found");

		//  get message model
		const selectedConfig = session.aiConfigs.find(
			(config) => config.id === message.agentId!,
		);
		const messageModel = selectedConfig?.model || "gpt-4o-mini";

		const createBotChatData = {
			user: userid,
			sessionId: sessionId,
			model: messageModel,
			contentType: "multiagentchatsession",
			content: getMessageTextContent(message),
			attachImages: getMessageImages(message),
			recentMessages: get().getHistory(sessionId),
			chat_role: "assistant",
			sender_name: message.agentName,
			sender_id: message.agentId ?? 999,
			totalTokenCount: estimateTokenLength(getMessageTextContent(message)),
		};

		const { chat_id, id } = await createChatDataAndFetchId(createBotChatData);

		const updatedMessage = {
			...message,
			id: id || message.id,
			chat_id: chat_id?.toString() || message.chat_id,
			isFinished: true,
			isTransfered: false,
			token_counts_total: createBotChatData.totalTokenCount,
		};

		get().updateBotMessage(sessionId, message, updatedMessage.id);
		get().updateRound(sessionId);

		get().putMultiAgentSessionData(sessionId);

		return updatedMessage;
	},
	onUserInput: async (
		content: string,
		attachImages: string[],
		attachFiles: FileInfo[] | undefined,
		session: MultiAgentChatSession,
	) => {
		try {
			const { userMessage, recentMessages } = await get().handleUserInput(
				content,
				attachImages,
				attachFiles,
				session,
			);

			// 检查当前的 topic 是否是默认 topic
			if (session.topic === MULTI_AGENT_DEFAULT_TOPIC) {
				// 如果是默认 topic，则将 content 设置为新的 topic
				get().updateMultiAgentsChatsession(session.id, {
					topic: content,
				});
			} else {
				// 如果不是默认 topic，则将 content 添加到 userAdditionInput
				const currentAdditionalInput = session.userAdditionInput || "";
				const updatedAdditionalInput = currentAdditionalInput
					? `${currentAdditionalInput}\n${content}`
					: content;

				get().updateMultiAgentsChatsession(session.id, {
					userAdditionInput: updatedAdditionalInput,
				});
			}

			// make session unpaused
			get().updateMultiAgentsChatsession(session.id, { paused: false });
			get().putMultiAgentSessionData(session.id);
		} catch (error) {
			console.error("Error in onUserInput:", error);
			throw error;
		}
	},
	handleUserInput: async (
		content: string,
		attachImages: string[],
		attachFiles: FileInfo[] | undefined,
		session: MultiAgentChatSession,
	) => {
		const sessionId = session.id;
		const { id: userid, nickname } = useUserStore.getState().user;
		// const { recentMessages, recentMessagesTokenCount } =
		// 	getMessagesWithMemory(session);

		const messages = [] as ChatMessage[];
		const recentMessages = [] as ChatMessage[];

		const contentTokenCount = estimateTokenLength(content);
		const total_token_count = 0; // recentMessagesTokenCount + contentTokenCount;

		const userModel = "userMessage";
		const createChatData = {
			user: userid,
			sessionId: sessionId,
			model: userModel,
			contentType: "multiagentchatsession",
			content: content,
			attachImages: attachImages,
			recentMessages: messages, //recentMessages,
			chat_role: "user",
			sender_name: nickname,
			totalTokenCount: total_token_count,
		};

		const { chat_id, id } = await createChatDataAndFetchId(createChatData);

		let mContent: string | MultimodalContent[] = content;

		if (attachImages && attachImages.length > 0) {
			mContent = [
				{
					type: "text",
					text: content,
				},
			];
			mContent = mContent.concat(
				attachImages.map((url) => ({
					type: "image_url",
					image_url: { url },
				})),
			);
		}

		const userMessage = createMultiAgentChatMessage({
			id,
			chat_id,
			role: "user",
			content: mContent,
			image_url: attachImages,
			token_counts_total: total_token_count,
		});

		const newMessages = userMessage;
		// console.log("newMessages", newMessages);

		get().updateMessages(sessionId, newMessages);

		return { userMessage, recentMessages };
	},

	getHistory: (conversationId: string) => {
		// return messages
		const MAX_TOKEN_COUNT = 3000; // 最大的token数量

		const conversation = get().conversations.find(
			(m) => m.id === conversationId,
		);
		if (!conversation) {
			return []; // 如果没有找到会话，返回空数组
		}

		// 1. 获取历史消息
		let messages = conversation.messages.slice(); // 获取会话的消息副本

		// 2. 决定获取最大历史消息的数量
		// 这里的实现取决于你如何定义最大历史消息数量，这里假设是消息数组的长度
		let maxMessageCount = messages.length;

		// 3. 取决于tokenCount 不超过3000
		// 4. 如果超过3000，则减少获取的消息数量
		let tokenCount = 0;
		let historyMessages = [];
		for (let i = maxMessageCount - 1; i >= 0; i--) {
			const message = messages[i];
			const messageTokenCount = estimateTokenLength(
				getMessageTextContent(message),
			); // 估算消息的token数量

			if (tokenCount + messageTokenCount > MAX_TOKEN_COUNT) {
				break; // 如果超过最大token数量，则停止添加消息
			}

			tokenCount += messageTokenCount;
			historyMessages.unshift(message); // 添加消息到历史消息数组
		}

		return historyMessages; // 返回历史消息
	},
	summarizeSession: async (conversationId: string) => {
		// 获取会话
		const session = get().conversations.find(
			(session) => session.id === conversationId,
		);
		if (!session) {
			return; // 如果会话不存在，则返回
		}

		// 获取历史消息
		const historyMessages = get().getHistory(conversationId);
		//  获取会话并转换成字符串
		const historyMessageString = historyMessages
			.map((m) => m.content)
			.join("\n");
		// 计算会话 token, 小于1000时则不进行summarize
		if (estimateTokenLength(historyMessageString) < 1000) {
			console.log(
				"historyMessageString",
				historyMessageString,
				"token length",
				estimateTokenLength(historyMessageString),
				"记忆长度小于1000，不进行summarize",
			);
			return "";
		}

		// 获取会话的摘要
		const summary = await contextSummarize(historyMessages, session.memory);
		// console.log("memory in store", summary);

		// 更新会话的摘要
		set((state) => {
			const updatedConversations = state.conversations.map((session) => {
				if (session.id === conversationId) {
					return {
						...session,
						memory: summary,
					};
				}
				return session;
			});

			return {
				conversations: updatedConversations,
			};
		});
		return summary;
	},
});

export const useMultipleAgentStore = create<StoreState>()(
	persist(storeCreator, {
		name: "double-agent-storage",
		version: 1.0,
		migrate: (persistedState, version) => {
			if (version < 1.0) {
				console.log("Clearing storage due to version mismatch");
				return {}; // 清空存储
			}
			return persistedState;
		},
	}),
);

// 增加错误处理机制
useMultipleAgentStore.subscribe((state) => {
	try {
		localStorage.setItem("double-agent-storage", JSON.stringify(state));
	} catch (error) {
		console.error("Failed to persist state:", error);
	}
});
