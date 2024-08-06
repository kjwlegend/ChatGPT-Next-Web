// src/app/store/doubleAgent.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StateCreator } from "zustand";
import { DoubleAgentData, createDoubleAgentSession } from "../api/backend/chat";
import { RequestMessage } from "../client/api";
import { nanoid } from "nanoid";
import { estimateTokenLength } from "../utils/token";
import { Conversation } from "microsoft-cognitiveservices-speech-sdk";
import { contextSummarize } from "../chains/summarize";
import { Mask, ChatMessage, ChatToolMessage } from "../types/index";
import { getMessageTextContent } from "../utils";
import { createMultipleAgentSession } from "../services/chats";

export type DoubleAgentChatMessage = ChatMessage & {
	agentNum?: number;
};

export type DoubleAgentChatSession = {
	id: string;
	firstAIConfig: Mask;
	secondAIConfig: Mask;
	topic: string;
	initialInput: string;
	messages: DoubleAgentChatMessage[];
	lastUpdateTime: number;
	updated_at: string;
	created_at: string;
	memory?: any; // 其他可能的会话相关状态
	totalRounds: number; // 迭代次数
	round: number; // 轮次
	paused?: boolean; // 是否暂停
};

export const DOUBLE_AGENT_DEFAULT_TOPIC = "未定义话题";

type StoreState = {
	user: any; // 定义用户类型
	currentConversationId: string; // 当前会话ID
	firstAIConfig: Mask; // firstAI的配置
	secondAIConfig: Mask; // secondAI的配置

	conversations: DoubleAgentChatSession[]; // 会话列表
	startNewConversation: (topic: string, userid: number) => Promise<string>;
	setCurrentConversationId: (id: string) => void;
	fetchNewConversations: (data: any) => void;
	currentSession: () => DoubleAgentChatSession;
	setAIConfig: (
		conversationId: string,
		side: "left" | "right",
		config: Mask,
	) => void;
	clearAIConfig: (conversationId: string, side: "left" | "right") => void;
	sortedConversations: () => DoubleAgentChatSession[];
	clearConversation: (conversationId: string) => void;
	updateMessages: (
		conversationId: string,
		message: DoubleAgentChatMessage,
	) => void;
	updateSingleMessage: (
		conversationId: string,
		messageIndex: number,
		newMessageContent: string,
		toolsMessage?: ChatToolMessage[],
	) => void;
	updateConversation: (
		conversationId: string,
		conversation: DoubleAgentChatSession,
	) => void;
	deleteConversation: (conversationId: string | number) => void;
	// return round
	updateRound: (conversationId: string) => { round: number };
	getHistory: (conversationId: string) => DoubleAgentChatMessage[];
	summarizeSession: (conversationId: string) => Promise<any>;
};

export function createDoubleAgentChatMessage(
	override: Partial<DoubleAgentChatMessage>,
): DoubleAgentChatMessage {
	return {
		id: nanoid(),
		date: new Date().toISOString(),
		content: "",
		role: "user",
		streaming: false,
		toolMessages: [],
		preview: false,

		...override,
	};
}
const storeCreator: StateCreator<StoreState> = (set, get) => ({
	user: null,
	currentConversationId: "",
	firstAIConfig: {} as Mask,
	secondAIConfig: {} as Mask,

	conversations: [],
	startNewConversation: async (topic: string, userid: number) => {
		const data: DoubleAgentData = {
			user: userid,
			session_topic: topic,
			initialInput: "",
			first_agent_setting: get().firstAIConfig,
			second_agent_setting: get().secondAIConfig,
			totalRounds: 0,
			round: 0,
			pause: false,
		};

		const res = await createMultipleAgentSession(data);

		const conversationId = res.id; // 这里应该是生成唯一ID的函数
		set((state) => {
			const newConversation: DoubleAgentChatSession = {
				id: conversationId,
				firstAIConfig: get().firstAIConfig,
				secondAIConfig: get().secondAIConfig,
				topic: topic,
				initialInput: "",
				messages: [
					// createDoubleAgentChatMessage({
					// 	content: initialInput,
					// 	role: "user",
					// }),
				],
				lastUpdateTime: new Date().getTime(),
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
				memory: "",
				// 初始化其他可能的会话相关状态
				totalRounds: 0,
				round: 0,
				paused: true,
			};
			get().sortedConversations();

			return {
				currentConversationId: conversationId,
				conversations: [...state.conversations, newConversation],
			};
		});
		return conversationId;
	},
	setCurrentConversationId: (id) => set({ currentConversationId: id }),
	currentSession: () => {
		const { currentConversationId, conversations } = get();
		return (
			conversations.find((session) => session.id === currentConversationId) ||
			({} as DoubleAgentChatSession)
		);
	},
	fetchNewConversations(data) {
		const existingConversations = get().conversations;

		const newConversations: DoubleAgentChatSession[] = data.map(
			(session: any) => ({
				id: session.id,
				firstAIConfig: session.custom_agents_data[0] || {}, // 使用第一个 agent 配置
				secondAIConfig: session.custom_agents_data[1] || {}, // 使用第二个 agent 配置
				topic: session.session_topic || DOUBLE_AGENT_DEFAULT_TOPIC,
				initialInput: session.session_description || "",
				messages: [], // 这里假设没有初始消息，需要后续加载
				lastUpdateTime: Date.parse(session.updated_at),
				created_at: session.created_at,
				updated_at: session.updated_at,
				totalRounds: 0, // 假设初始为 0，需要后续更新
				round: 0, // 假设初始为 0，需要后续更新
				paused: false, // 默认不暂停
			}),
		);

		const updatedConversations = existingConversations.slice(); // 创建现有会话的副本

		newConversations.forEach((newConv: DoubleAgentChatSession) => {
			const index = updatedConversations.findIndex(
				(conv) => conv.id === newConv.id,
			);
			console.log("index", index);

			if (index !== -1) {
				updatedConversations[index] = newConv;
				console.log("find session, update", index);
			} else {
				updatedConversations.push(newConv);
				console.log("No session add,", index);
			}
		});
		get().sortedConversations();

		set({
			conversations: updatedConversations,
		});
	},
	setAIConfig: (conversationId: string, side: "left" | "right", config: Mask) =>
		set((state) => {
			const updatedConversations = state.conversations.map((conversation) => {
				if (conversation.id === conversationId) {
					return {
						...conversation,
						...(side === "left"
							? { firstAIConfig: config }
							: { secondAIConfig: config }),
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

		console.log("sortedConversations", sortedConversations);
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
			console.log("updatedConversations", updatedConversations);
			return {
				conversations: updatedConversations,
			};
		}),

	clearAIConfig: (conversationId: string, side: "left" | "right") =>
		set((state) => {
			const updatedConversations = state.conversations.map((conversation) => {
				if (conversation.id === conversationId) {
					return {
						...conversation,
						...(side === "left"
							? { firstAIConfig: {} as Mask }
							: { secondAIConfig: {} as Mask }),
					};
				}
				return conversation;
			});
			return {
				conversations: updatedConversations,
			};
		}),
	// new messages
	updateMessages: (conversationId: string, message: DoubleAgentChatMessage) =>
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
	// update single message with index
	updateSingleMessage: (
		conversationId: string,
		messageIndex: number,
		newMessageContent: string,
		toolsMessage?: ChatToolMessage[],
	) =>
		set((state) => {
			const updatedConversations = state.conversations.map((session) => {
				if (session.id === conversationId) {
					// 确保消息索引在范围内
					if (messageIndex >= 0 && messageIndex < session.messages.length) {
						const currentMessage = session.messages[messageIndex];
						// 检查新旧消息内容是否一致
						if (currentMessage.content === newMessageContent) {
							// 消息内容没有变化，无需更新
							return session;
						}

						// 创建一个新的消息数组，其中包含更新后的消息
						const updatedMessages = session.messages.map((message, index) => {
							if (index === messageIndex) {
								// 更新消息内容
								return {
									...message,
									content: newMessageContent,
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
		conversation: DoubleAgentChatSession,
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
			historyMessages.push(message); // 添加消息到历史消息数组
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
		const historyMessages = get().getHistory(conversationId).reverse();
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
		console.log("memory in store", summary);

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
		return summary || "";
	},
});

const doubleAgent = create<StoreState>()(
	persist(storeCreator, {
		name: "double-agent-storage",
		version: 1.0,
	}),
);

export default doubleAgent;
