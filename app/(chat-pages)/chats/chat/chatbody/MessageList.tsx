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
import { ChatMessage, ChatSession } from "@/app/types/chat";

import MessageItem from "./MessageItem";

import { copyToClipboard } from "@/app/utils";

import { CHAT_PAGE_SIZE } from "@/app/constant";
import Locale from "@/app/locales";
import { useMessageActions } from "./useMessageActions";
import { useChatActions, useSessions } from "../hooks/useChatContext";

export type RenderMessage = ChatMessage & { preview?: boolean };

const MemoMessageItem = React.memo(MessageItem);

interface ChatMessageListProps {
	messages: ChatMessage[];
	isLoading: boolean;
	hasNextPage: boolean;
}
export const MessageList: React.FC<ChatMessageListProps> = ({
	messages,
	isLoading,
	hasNextPage,
}) => {
	const { setShowPromptModal } = useChatActions();

	const previousMessagesRef = useRef(messages);

	useEffect(() => {
		previousMessagesRef.current = messages;
	}, [messages]);

	return (
		<>
			{messages.map((message, i) => (
				<Fragment key={message.id}>
					<MessageItem i={i} key={message.id} message={message} />
				</Fragment>
			))}
		</>
	);
};
 