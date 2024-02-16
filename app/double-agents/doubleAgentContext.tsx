import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	use,
	useEffect,
} from "react";
import { DoubleAgentChatSession } from "../store/doubleAgents";
import doubleAgentStore from "../store/doubleAgents";
// ... 其他必要的 imports
import { useUserStore } from "../store";
import { DOUBLE_AGENT_DEFAULT_TOPIC } from "../store/doubleAgents";
import { message } from "antd";

// 扩展ChatContext接口以包含startNewConversation方法
interface ChatContext {
	conversations: DoubleAgentChatSession[];
	conversation: any;
	conversationId: string;
	userid: number;
	startNewConversation: () => Promise<void>;
}

// 创建一个基础上下文，不包含startNewConversation方法
export const DoubleAgentChatContext = createContext<ChatContext>({
	conversations: [],
	conversation: {},
	conversationId: "",
	userid: 0,
	startNewConversation: async () => {},
});

// ChatProvider组件，用于包装应用程序并共享聊天状态和方法
export const DoubleAgentChatProvider = ({ children }: any) => {
	const {
		conversations,
		currentConversationId,
		startNewConversation,
		setCurrentConversationId,
	} = doubleAgentStore.getState();
	const userid = useUserStore.getState().user.id;
	const [conversation, setConversation] = useState<
		DoubleAgentChatSession | undefined
	>(undefined);
	// 同步conversation状态
	useEffect(() => {
		const currentConversation = conversations.find(
			(conv) => conv.id === currentConversationId,
		);
		setConversation(currentConversation);
	}, [conversations, currentConversationId]);
	// 初始化conversation状态
	useEffect(() => {
		if (currentConversationId) {
			setConversation(
				conversations.find((conv) => conv.id === currentConversationId),
			);
		}
	}, [conversations, currentConversationId]);

	const [messageApi, contextHolder] = message.useMessage();

	// 开始新对话的处理函数
	const startNewConversationHandler = useCallback(async () => {
		console.log("startNewConversationHandler");
		messageApi.open({
			content: "对话创建中",
			type: "loading",
		});
		const conversationId = await startNewConversation(
			DOUBLE_AGENT_DEFAULT_TOPIC,
			userid,
		);
		setCurrentConversationId(conversationId);
		messageApi.success("对话创建成功");
	}, [startNewConversation, setCurrentConversationId, userid]);
	// 提供上下文值
	return (
		<DoubleAgentChatContext.Provider
			value={{
				conversations,
				conversation,
				conversationId: currentConversationId,
				userid,
				startNewConversation: startNewConversationHandler,
			}}
		>
			{contextHolder}
			{children}
		</DoubleAgentChatContext.Provider>
	);
};

// 自定义钩子，用于方便地访问ChatContext
export const useDoubleAgentChatContext = () => {
	const context = useContext(DoubleAgentChatContext);
	if (context === undefined) {
		throw new Error("useChatContext must be used within a ChatProvider");
	}
	return context;
};
