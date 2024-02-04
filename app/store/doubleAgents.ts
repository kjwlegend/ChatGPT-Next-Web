// src/app/store/doubleAgent.ts
import { Mask } from "./mask";
import create from "zustand";
import { persist } from "zustand/middleware";
import { StateCreator } from "zustand";
import { DoubleAgentData, createDoubleAgentSession } from "../api/backend/chat";
import { RequestMessage } from "../client/api";
import { nanoid } from "nanoid";

type DoubleAgentChatMessage = RequestMessage & {
	date: string;
	id: string;
	streaming?: boolean;
};

export type DoubleAgentChatSession = {
	id: string;
	firstAIConfig: Mask;
	secondAIConfig: Mask;
	topic: string;
	initialInput: string;
	messages: DoubleAgentChatMessage[];
	lastUpdateTime: string;
	memory?: any; // 其他可能的会话相关状态
};

type StoreState = {
	user: any; // 定义用户类型
	currentConversationId: string; // 当前会话ID
	firstAIConfig: Mask; // firstAI的配置
	secondAIConfig: Mask; // secondAI的配置
	iterations: number; // 迭代次数
	conversations: DoubleAgentChatSession[]; // 会话列表
	addUser: (userInfo: any) => void;
	startNewConversation: (topic: string, userid: number) => Promise<string>;
	setCurrentConversationId: (id: string) => void;
	currentSession: () => { [key: string]: any };
	setAIConfig: (
		conversationId: string,
		side: "left" | "right",
		config: Mask,
	) => void;
	clearAIConfig: (conversationId: string, side: "left" | "right") => void;
};

function createDoubleAgentChatMessage(
	override: Partial<DoubleAgentChatMessage>,
): DoubleAgentChatMessage {
	return {
		id: "",
		date: new Date().toISOString(),
		content: "",
		role: "user",
		streaming: false,
		...override,
	};
}
const storeCreator: StateCreator<StoreState> = (set, get) => ({
	user: null,
	currentConversationId: "",
	firstAIConfig: {} as Mask,
	secondAIConfig: {} as Mask,
	iterations: 0,
	conversations: [],
	addUser: (userInfo) => set((state) => ({ user: userInfo })),
	startNewConversation: async (topic: string, userid: number) => {
		const data: DoubleAgentData = {
			user: userid,
			topic: topic,
			initialInput: "",
			first_agent_setting: get().firstAIConfig,
			second_agent_setting: get().secondAIConfig,
			iterations: get().iterations,
		};

		const res = await createDoubleAgentSession(data);

		const conversationId = res.data.id; // 这里应该是生成唯一ID的函数
		set((state) => {
			const newConversation: DoubleAgentChatSession = {
				id: conversationId,
				firstAIConfig: get().firstAIConfig,
				secondAIConfig: get().secondAIConfig,
				topic: topic,
				initialInput: initialInput,
				messages: [
					// createDoubleAgentChatMessage({
					// 	content: initialInput,
					// 	role: "user",
					// }),
				],
				lastUpdateTime: new Date().toISOString(),
				memory: "",
				// 初始化其他可能的会话相关状态
			};

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
			{}
		);
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
});

const doubleAgent = create<StoreState>()(
	persist(storeCreator, {
		name: "double-agent-storage",
		getStorage: () => localStorage,
	}),
);

export default doubleAgent;
