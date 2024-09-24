import React, {
	createContext,
	useContext,
	useCallback,
	useState,
	useEffect,
} from "react";
import {
	MultiAgentChatSession,
	useMultipleAgentStore,
} from "@/app/store/multiagents";
import { message } from "antd";
import { Mask } from "@/app/types/mask";
import {
	createMultipleAgentSession,
	updateMultiAgentSession,
} from "@/app/services/api/chats";
import { MULTI_AGENT_DEFAULT_TOPIC } from "@/app/store/multiagents";
import { useUserStore } from "@/app/store";

const ConversationActionsContext = createContext<{
	startNewConversation: (topic?: string) => Promise<void>;
	addAgent: (mask: Mask) => Promise<void>;
	deleteAgent: (agentId: number) => Promise<void>;
}>({
	startNewConversation: async () => {},
	addAgent: async () => {},
	deleteAgent: async () => {},
});

export const ConversationActionsProvider: React.FC<{
	children: React.ReactNode;
}> = ({ children }) => {
	const [messageApi, contextHolder] = message.useMessage();
	const userid = useUserStore.getState().user.id;

	const startNewConversation = useCallback(
		async (topic?: string) => {
			console.log("multipleagents debug:, topic: ", topic);
			const hideLoading = messageApi.open({
				content: "对话创建中",
				type: "loading",
			});

			try {
				const data: any = {
					user: userid,
					session_topic: topic ?? MULTI_AGENT_DEFAULT_TOPIC,
					initialInput: "",
					agent_settings: [],
					totalRounds: 0,
					round: 0,
					pause: false,
				};

				const res = await createMultipleAgentSession(data);

				const conversationId = res.id;
				useMultipleAgentStore
					.getState()
					.startConversation(
						topic ?? MULTI_AGENT_DEFAULT_TOPIC,
						conversationId,
						"",
					);
				useMultipleAgentStore
					.getState()
					.setCurrentConversationId(conversationId);
				hideLoading();
				messageApi.success("对话创建成功");
			} catch (error) {
				hideLoading();
				messageApi.error("对话创建失败，请重试");
				console.error("对话创建失败:", error);
			}
		},
		[messageApi, userid],
	);

	const addAgent = useCallback(
		async (mask: Mask) => {
			console.log("addAgenttoConversationHandler");
			const hideLoading = messageApi.open({
				content: "智能体创建中",
				type: "loading",
			});

			try {
				// 获取最新的 store 状态
				const store = useMultipleAgentStore.getState();
				const currentConversationId = store.currentConversationId;

				console.log(
					"multipleagents debug: addAgentToConversationHandler",
					currentConversationId,
				);

				// 添加代理到当前会话
				store.addAgent(currentConversationId, mask);

				// 获取更新后的 aiConfigs
				const updatedSession = store.currentSession();
				if (!updatedSession) {
					throw new Error("当前会话不存在");
				}
				const aiconfigs = updatedSession.aiConfigs;

				const custom_agents_data = { custom_agents_data: aiconfigs };

				// 更新服务器
				await updateMultiAgentSession(
					custom_agents_data,
					currentConversationId,
				);

				console.log("multipleagents debug: updateSession completed");

				hideLoading();
				messageApi.success("智能体创建成功");
			} catch (error) {
				hideLoading();
				console.error("智能体创建失败:", error);
				messageApi.error("智能体创建失败，请重试");
			}
		},
		[messageApi],
	);

	const deleteAgent = useCallback(
		async (agentId: number) => {
			const hideLoading = messageApi.open({
				content: "正在删除智能体",
				type: "loading",
			});

			try {
				// 获取最新的 store 状态
				const store = useMultipleAgentStore.getState();
				const currentConversationId = store.currentConversationId;

				// 再次确认当前的 conversation
				const currentSession = store.currentSession();
				if (!currentSession || currentSession.id !== currentConversationId) {
					throw new Error("当前会话已更改，请刷新页面后重试");
				}

				// 更新本地状态
				store.clearAIConfig(currentConversationId, agentId);
				const updatedAiConfigs = store.currentSession().aiConfigs;

				// 更新服务器
				const custom_agents_data = { custom_agents_data: updatedAiConfigs };
				await updateMultiAgentSession(
					custom_agents_data,
					currentConversationId,
				);

				hideLoading();
				messageApi.success("智能体删除成功");
			} catch (error) {
				hideLoading();
				if (error instanceof Error) {
					messageApi.error(error.message);
				} else {
					messageApi.error("智能体删除失败，请重试");
				}
				console.error("智能体删除失败:", error);
			}
		},
		[messageApi],
	);

	return (
		<ConversationActionsContext.Provider
			value={{ startNewConversation, addAgent, deleteAgent }}
		>
			{contextHolder}
			{children}
		</ConversationActionsContext.Provider>
	);
};

export const useConversationActions = () =>
	useContext(ConversationActionsContext);

const ConversationsContext = createContext<{
	conversations: MultiAgentChatSession[];
}>({ conversations: [] });

export const ConversationsProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [conversations, setConversations] = useState(
		() => useMultipleAgentStore.getState().conversations,
	);

	useEffect(() => {
		const unsubscribe = useMultipleAgentStore.subscribe((state) =>
			setConversations(state.conversations),
		);
		return () => unsubscribe();
	}, []);

	return (
		<ConversationsContext.Provider value={{ conversations }}>
			{children}
		</ConversationsContext.Provider>
	);
};

export const useConversations = () => useContext(ConversationsContext);

const CurrentConversationContext = createContext<{
	conversation: MultiAgentChatSession | undefined;
	conversationId: string;
}>({ conversation: undefined, conversationId: "" });

export const CurrentConversationProvider: React.FC<{
	children: React.ReactNode;
}> = ({ children }) => {
	const [state, setState] = useState(() => {
		const store = useMultipleAgentStore.getState();
		return {
			conversation: store.conversations.find(
				(conv) => conv.id === store.currentConversationId,
			),
			conversationId: store.currentConversationId,
		};
	});

	useEffect(() => {
		const unsubscribe = useMultipleAgentStore.subscribe((store) => {
			setState({
				conversation: store.conversations.find(
					(conv) => conv.id === store.currentConversationId,
				),
				conversationId: store.currentConversationId,
			});
		});
		return () => unsubscribe();
	}, []);

	return (
		<CurrentConversationContext.Provider value={state}>
			{children}
		</CurrentConversationContext.Provider>
	);
};

export const useCurrentConversation = () =>
	useContext(CurrentConversationContext);

const MessagesContext = createContext<{
	messages: any[]; // 根据您的消息类型进行调整
}>({ messages: [] });

export const MessagesProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [messages, setMessages] = useState<any[]>([]);
	const { conversationId } = useCurrentConversation();

	useEffect(() => {
		if (!conversationId) return;

		const unsubscribe = useMultipleAgentStore.subscribe((state) => {
			const currentConversation = state.conversations.find(
				(conv) => conv.id === conversationId,
			);
			setMessages(currentConversation?.messages || []);
		});

		return () => unsubscribe();
	}, [conversationId]);

	return (
		<MessagesContext.Provider value={{ messages }}>
			{children}
		</MessagesContext.Provider>
	);
};
export const useMessages = () => useContext(MessagesContext);

export const MultiAgentChatProvider: React.FC<{
	children: React.ReactNode;
}> = ({ children }) => {
	return (
		<ConversationsProvider>
			<CurrentConversationProvider>
				<MessagesProvider>
					<ConversationActionsProvider>{children}</ConversationActionsProvider>
				</MessagesProvider>
			</CurrentConversationProvider>
		</ConversationsProvider>
	);
};
