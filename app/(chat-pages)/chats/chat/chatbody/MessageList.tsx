// MessageList.tsx
import React from "react";
import { useUserStore } from "@/app/store";
import { ChatMessage, ChatSession } from "@/app/types/chat";

import { AgentMessageItem, MessageItem } from "./MessageItem";

import { useContext, useRef, useState, useMemo, Fragment } from "react";
import { useScrollToBottom } from "../chat-controller";
import { copyToClipboard, useMobileScreen } from "@/app/utils";

import { CHAT_PAGE_SIZE } from "@/app/constant";
import Locale from "@/app/locales";
import { ChatContext } from "../main";
import { useMessageActions } from "./useMessageActions";


export type RenderMessage = ChatMessage & { preview?: boolean };

interface ChatMessageListProps {
	session: ChatSession;
	messages: ChatMessage[];
	isLoading: boolean;
	hasNextPage: boolean;
}

export const MessageList: React.FC<ChatMessageListProps> = ({
	session,
	messages,
	isLoading,
	hasNextPage,
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

	// const [isLoading, setIsLoading] = useState(false);
	// const [hasNextPage, setHasNextPage] = useState(true);

	const { setAutoScroll, scrollDomToBottom } = useScrollToBottom();
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
			{/* {session.mask.modelConfig.model == "midjourney" && <MJFloatButton />} */}
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
