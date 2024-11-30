"use client";
import { useChatStore } from "@/app/store/chat/index";
import { ChatMessage, ChatSession } from "@/app/types/chat";
import { message } from "antd";
import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
	useMemo,
} from "react";
import { useWorkflowStore } from "@/app/store/workflow";
import { MultiAgentChatSession } from "@/app/store/multiagents";

import { workflowChatSession, sessionConfig } from "@/app/types/";
interface ActionContextType {
	setHitBottom: React.Dispatch<React.SetStateAction<boolean>>;
	setAutoScroll: React.Dispatch<React.SetStateAction<boolean>>;
	setShowPromptModal: React.Dispatch<React.SetStateAction<boolean>>;
	setEnableAutoFlow: React.Dispatch<React.SetStateAction<boolean>>;
	setSession: React.Dispatch<React.SetStateAction<any>>;
	setSubmitType: React.Dispatch<
		React.SetStateAction<"chat" | "workflow" | "multiagent">
	>;
	setMessages?: React.Dispatch<React.SetStateAction<any>>;
}

interface ChatContextValue {
	hitBottom: boolean;
	autoScroll: boolean;
	showPromptModal: boolean;
	enableAutoFlow: boolean;
	submitType: "chat" | "workflow" | "multiagent";
	currentSessionId: string;
}

const ChatActionContext = React.createContext<ActionContextType>({
	setHitBottom: () => {},
	setAutoScroll: () => {},
	setShowPromptModal: () => {},
	setEnableAutoFlow: () => {},
	setSession: () => {},
	setSubmitType: () => {},
	setMessages: () => {},
});

const ChatSessionContext = React.createContext({});
const ChatMessagesContext = React.createContext({});

const defaultChatContextValue: ChatContextValue = {
	hitBottom: true,
	autoScroll: true,
	showPromptModal: false,
	enableAutoFlow: false,
	submitType: "chat",
	currentSessionId: "0",
};

export const ChatSettingContext = React.createContext(defaultChatContextValue);

interface LoadingContextType {
	isLoading: boolean;
	setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}
export const ChatProvider = ({
	_session,
	children,
	storeType,
}: {
	_session: ChatSession | workflowChatSession;
	children: React.ReactNode;
	storeType: string;
}) => {
	const workflowStore = useWorkflowStore();
	const chatStore = useChatStore();

	// 将 store 的选择逻辑提取到 useMemo 中避免重复计算
	const store = useMemo(() => {
		if (storeType === "workflow") {
			return workflowStore;
		} else if (storeType === "chatstore") {
			return chatStore;
		}
		return null;
	}, [storeType, workflowStore, chatStore]);

	// 将 session 状态提升,避免子组件重复渲染
	const [session, setSession] = useState<ChatSession | workflowChatSession>(
		_session,
	);
	const [hitBottom, setHitBottom] = useState(true);
	const [autoScroll, setAutoScroll] = useState(true);
	const [showPromptModal, setShowPromptModal] = useState(false);
	const [enableAutoFlow, setEnableAutoFlow] = useState(false);
	const [submitType, setSubmitType] = useState<
		"chat" | "workflow" | "multiagent"
	>("chat");

	// 优化 messages 的依赖项,只在必要时更新
	const messages = useMemo(() => {
		if (!store || !session?.id) return [];

		if (storeType === "workflow") {
			return workflowStore.getMessages(session.id) || [];
		}

		if (storeType === "chatstore") {
			return chatStore.selectSessionMessages(session.id) || [];
		}

		return [];
	}, [store, storeType, session?.id]);

	// 只在 _session 变化时更新 session
	useEffect(() => {
		if (_session?.id !== session?.id) {
			setSession(_session);
		}
	}, [_session]);

	if (!store) return null;

	const currentSessionId = session?.id || "0";

	return (
		<ChatActionContext.Provider
			value={{
				setHitBottom,
				setAutoScroll,
				setShowPromptModal,
				setEnableAutoFlow,
				setSession,
				setSubmitType,
			}}
		>
			<ChatSettingContext.Provider
				value={{
					hitBottom,
					autoScroll,
					showPromptModal,
					enableAutoFlow,
					submitType,
					currentSessionId,
				}}
			>
				<ChatSessionContext.Provider value={session}>
					<ChatMessagesContext.Provider value={messages}>
						{children}
					</ChatMessagesContext.Provider>
				</ChatSessionContext.Provider>
			</ChatSettingContext.Provider>
		</ChatActionContext.Provider>
	);
};

export const useMessages = () => {
	const messages = useContext(ChatMessagesContext) as ChatMessage[];
	return messages;
};

export const useSessions = () => {
	const session = useContext(ChatSessionContext) as sessionConfig;
	// console.log("useSessions rendered", session);
	return session;
};
export const useChatSetting = () => {
	const {
		hitBottom,
		autoScroll,
		showPromptModal,
		enableAutoFlow,
		submitType,
		currentSessionId,
	} = useContext(ChatSettingContext);

	return {
		hitBottom,
		autoScroll,
		showPromptModal,
		enableAutoFlow,
		submitType,
		currentSessionId,
	};
};

export const useChatActions = () => {
	const {
		setHitBottom,
		setAutoScroll,
		setShowPromptModal,
		setEnableAutoFlow,
		setSession,
		setSubmitType,
	} = useContext(ChatActionContext);

	return {
		setHitBottom,
		setAutoScroll,
		setShowPromptModal,
		setEnableAutoFlow,
		setSession,
		setSubmitType,
	};
};
