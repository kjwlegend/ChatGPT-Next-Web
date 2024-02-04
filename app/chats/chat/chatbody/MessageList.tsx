// MessageList.tsx
import React from "react";
import { ChatMessage, ChatSession, useUserStore } from "@/app/store";
import { AgentMessageItem, MessageItem } from "./MessageItem";
import { MJFloatButton } from "../midjourney";
import { useContext, useRef, useState, useMemo, Fragment } from "react";
import { useScrollToBottom } from "../chat-controller";
import { UpdateChatMessages } from "@/app/services/chatService";
import { getChat } from "@/app/api/backend/chat";
import { copyToClipboard, useMobileScreen } from "@/app/utils";
import { message } from "antd";
import { createMessage } from "@/app/store";
import { useAppConfig } from "@/app/store";
import { CHAT_PAGE_SIZE } from "@/app/constant";
import { useAccessStore } from "@/app/store";
import { BOT_HELLO } from "@/app/store";
import Locale from "@/app/locales";
import styles from "../chats.module.scss";
import { ChatContext } from "../main";
import { useMessageActions } from "./useMessageActions";
import { useChatPagination } from "./useChatPagination";
import { DoubleAgentChatSession } from "@/app/store/doubleAgents";

export type RenderMessage = ChatMessage & { preview?: boolean };

interface ChatMessageListProps {
	session: ChatSession;
	messages: ChatMessage[];
	isLoading: boolean;
	hasNextPage: boolean;
	getMessages: (sessionId: string, page: number) => void;
}

interface DoubleAgentChatMessageListProps {
	messages: ChatMessage[];
	isLoading: boolean;
	hasNextPage: boolean;
	getMessages: (sessionId: string, page: number) => void;
}

export const MessageList: React.FC<ChatMessageListProps> = ({
	session,
	messages,
	isLoading,
	hasNextPage,
	getMessages,
}) => {
	const {
		hitBottom,
		setHitBottom,
		showPromptModal,
		setShowPromptModal,
		userInput,
		setUserInput,
		enableAutoFlow,
		setEnableAutoFlow,
		scrollRef,
		userImage,
		setUserImage,
	} = useContext(ChatContext);

	const inputRef = useRef<HTMLTextAreaElement>(null);
	const isMobileScreen = useMobileScreen();

	const [messageApi, contextHolder] = message.useMessage();
	// const [isLoading, setIsLoading] = useState(false);
	// const [hasNextPage, setHasNextPage] = useState(true);

	const { setAutoScroll, scrollDomToBottom } = useScrollToBottom(scrollRef);
	const {
		handleUserStop,
		handleDelete,
		handlePinMessage,
		handleResend,
		handlePlayAudio,
	} = useMessageActions(session, setShowPromptModal);

	const context: RenderMessage[] = useMemo(() => {
		return session.mask.hideContext ? [] : session.mask.context.slice();
	}, [session.mask.context, session.mask.hideContext]);
	const [msgRenderIndex, _setMsgRenderIndex] = useState(
		Math.max(0, messages.length - CHAT_PAGE_SIZE),
	);

	const clearContextIndex =
		(session.clearContextIndex ?? -1) >= 0
			? session.clearContextIndex! + context.length - msgRenderIndex
			: -1;

	return (
		<>
			{contextHolder}
			{session.mask.modelConfig.model == "midjourney" && <MJFloatButton />}
			{messages.map((message, i) => {
				const isUser = message.role === "user";
				const mjstatus = message.mjstatus;
				const actions = mjstatus?.action;

				const isContext = i < context.length;
				const showActions =
					i > 0 &&
					!(message.preview || message.content.length === 0) &&
					!isContext;
				const showTyping = message.preview || message.streaming;

				const shouldShowClearContextDivider = i === clearContextIndex - 1;

				return (
					<Fragment key={message.id}>
						<MessageItem
							key={message.id}
							i={i}
							session={session}
							isMobileScreen={isMobileScreen}
							context={context}
							clearContextIndex={clearContextIndex}
							message={message}
							onUserStop={handleUserStop}
							onResend={handleResend}
							onDelete={handleDelete}
							onPinMessage={handlePinMessage}
							onPlayAudio={handlePlayAudio}
						/>
					</Fragment>
				);
			})}
		</>
	);
};

export const DoubleAgentMessageList: React.FC<
	DoubleAgentChatMessageListProps
> = ({ messages, isLoading, hasNextPage, getMessages }) => {
	const {
		hitBottom,
		setHitBottom,
		showPromptModal,
		setShowPromptModal,
		userInput,
		setUserInput,
		enableAutoFlow,
		setEnableAutoFlow,
		scrollRef,
		userImage,
		setUserImage,
	} = useContext(ChatContext);

	let session: any = null;

	const inputRef = useRef<HTMLTextAreaElement>(null);
	const isMobileScreen = useMobileScreen();

	const [messageApi, contextHolder] = message.useMessage();
	// const [isLoading, setIsLoading] = useState(false);
	// const [hasNextPage, setHasNextPage] = useState(true);

	const { setAutoScroll, scrollDomToBottom } = useScrollToBottom(scrollRef);

	console.log("messages", messages.length, messages);
	// if messages undefined, return null
	if (messages[0] === undefined) {
		return null;
	}

	return (
		<>
			{contextHolder}
			{messages.map((message, i) => {
				let context: RenderMessage[] = [];
				let clearContextIndex = -1;

				return (
					<Fragment key={message.id}>
						<AgentMessageItem
							key={message.id}
							i={i}
							session={session}
							isMobileScreen={isMobileScreen}
							context={context}
							clearContextIndex={clearContextIndex}
							message={message}
						/>
					</Fragment>
				);
			})}
		</>
	);
};
