import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	use,
	useEffect,
} from "react";
import { MultiAgentChatSession } from "@/app/store/multiagents";
import { useMultipleAgentStore } from "@/app/store/multiagents";
// @/app. 其他必要的 imports
import { useUserStore } from "@/app/store";
import { MULTI_AGENT_DEFAULT_TOPIC } from "@/app/store/multiagents";
import { message } from "antd";
import { Mask } from "@/app/types/mask";
import { createMultipleAgentSession } from "@/app/services/api/chats";

// 扩展ChatContext接口以包含startNewConversation方法
interface ChatContext {
	conversations: MultiAgentChatSession[];
	conversation: any;
	conversationId: string;
	userid: number;
	startNewConversation: (topic?: string) => Promise<void>;
	addAgent: (mask: Mask, ...args: any) => Promise<void>;
}

// 创建一个基础上下文，不包含startNewConversation方法
export const MultiAgentChatContext = createContext<ChatContext>({
	conversations: [],
	conversation: {},
	conversationId: "",
	userid: 0,
	startNewConversation: async (topic) => {},
	addAgent: async () => {},
});

// ChatProvider组件，用于包装应用程序并共享聊天状态和方法
export const MultiAgentChatProvider = ({ children }: any) => {
	const [state, setState] = useState(() => useMultipleAgentStore.getState());

	useEffect(() => {
		const unsubscribe = useMultipleAgentStore.subscribe(() => {
			setState(useMultipleAgentStore.getState());
		});
		return () => unsubscribe();
	}, []);

	const {
		conversations,
		currentConversationId,
		startConversation,
		setCurrentConversationId,
		setAIConfig,
		addAgent,
	} = state;

	const userid = useUserStore.getState().user.id;
	const [conversation, setConversation] = useState<
		MultiAgentChatSession | undefined
	>(undefined);

	// 同步conversation状态
	useEffect(() => {
		const currentConversation = conversations.find(
			(conv) => conv.id === currentConversationId,
		);
		if (currentConversation) {
			setConversation(currentConversation);
		} else {
			console.error("未找到当前对话");
		}
	}, [conversations, currentConversationId]);

	const [messageApi, contextHolder] = message.useMessage();

	// 获取最新的 currentConversationId
	const getCurrentConversationId = () => {
		return useMultipleAgentStore.getState().currentConversationId;
	};

	// 开始新对话的处理函数
	const startNewConversationHandler = useCallback(
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
				startConversation(
					topic ?? MULTI_AGENT_DEFAULT_TOPIC,
					conversationId,
					"",
				);
				setCurrentConversationId(conversationId);
				hideLoading();
				messageApi.success("对话创建成功");
			} catch (error) {
				hideLoading();
				messageApi.error("对话创建失败，请重试");
				console.error("对话创建失败:", error);
			}
		},
		[startConversation, setCurrentConversationId],
	);

	const addAgentToConversationHandler = useCallback(
		async (mask: Mask) => {
			console.log("addAgenttoConversationHandler");
			messageApi.open({
				content: "智能体创建中",
				type: "loading",
			});
			console.log(
				"multipleagents debug: addAgentToConversationHandler",
				currentConversationId,
			);
			addAgent(getCurrentConversationId(), mask);

			messageApi.success("智能体创建成功");
		},
		[startConversation, setCurrentConversationId],
	);

	// 提供上下文值

	return (
		<MultiAgentChatContext.Provider
			value={{
				conversations,
				conversation,
				conversationId: currentConversationId,
				userid,
				startNewConversation: startNewConversationHandler,
				addAgent: addAgentToConversationHandler,
			}}
		>
			{contextHolder}
			{children}
		</MultiAgentChatContext.Provider>
	);
};

// 自定义钩子，用于方便地访问ChatContext
export const useMultiAgentChatContext = () => {
	const context = useContext(MultiAgentChatContext);
	if (context === undefined) {
		throw new Error("useChatContext must be used within a ChatProvider");
	}
	return context;
};
