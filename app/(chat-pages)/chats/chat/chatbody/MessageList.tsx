// MessageList.tsx
import React, {
	memo,
	Fragment,
	useContext,
	useRef,
	useState,
	useMemo,
	useCallback,
	useEffect,
} from "react";
import { useMobileScreen } from "@/app/hooks/useMobileScreen";
import { useUserStore } from "@/app/store";
import { ChatMessage, ChatSession } from "@/app/types/chat";

import MessageItem from "./MessageItem";

import { useScrollToBottom } from "../hooks/useChathooks";
import { copyToClipboard } from "@/app/utils";

import { CHAT_PAGE_SIZE } from "@/app/constant";
import Locale from "@/app/locales";
import { useMessageActions } from "./useMessageActions";
import { useChatActions } from "../hooks/useChatContext";

export type RenderMessage = ChatMessage & { preview?: boolean };

interface ChatMessageListProps {
	session: ChatSession;
	messages: ChatMessage[];
	isLoading: boolean;
	hasNextPage: boolean;
}

export const MessageList: React.FC<ChatMessageListProps> = memo(
	({ session, messages, isLoading, hasNextPage }) => {
		const { setShowPromptModal } = useChatActions();

		const {
			handleUserStop,
			handleDelete,
			handlePinMessage,
			handleResend,
			handlePlayAudio,
		} = useMessageActions(session, setShowPromptModal);

		const context = useMemo(() => {
			return session.mask.hideContext ? [] : session.mask.context.slice();
		}, [session.mask.context, session.mask.hideContext]);

		const clearContextIndex = useMemo(() => {
			const clearIndex = session.clearContextIndex ?? -1;
			if (clearIndex < 0) return -1;

			const adjustedIndex =
				clearIndex +
				context.length -
				Math.max(0, messages.length - CHAT_PAGE_SIZE);
			return adjustedIndex >= 0 ? adjustedIndex : -1;
		}, [session.clearContextIndex, context.length, messages.length]);
		const previousMessagesRef = useRef(messages);

		useEffect(() => {
			previousMessagesRef.current = messages;
		}, [messages]);

		const previousMessages = previousMessagesRef.current;

		return (
			<>
				{previousMessages.map((message, i) => (
					<Fragment key={message.id}>
						<MessageItem
							i={i}
							session={session}
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
				))}
				{messages.length > previousMessages.length && (
					<Fragment key={messages[messages.length - 1].id}>
						<MessageItem
							i={messages.length - 1}
							session={session}
							context={context}
							clearContextIndex={clearContextIndex}
							message={messages[messages.length - 1]}
							onUserStop={handleUserStop}
							onResend={handleResend}
							onDelete={handleDelete}
							onPinMessage={handlePinMessage}
							onPlayAudio={handlePlayAudio}
						/>
					</Fragment>
				)}
			</>
		);
	},
);
