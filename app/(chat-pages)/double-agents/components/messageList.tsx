// MessageList.tsx
import React from "react";
import { useUserStore } from "@/app/store";
import { AgentMessageItem } from "./messageItem";
import { useContext, useRef, useState, useMemo, Fragment } from "react";
import { useScrollToBottom } from "@/app/(chat-pages)/chats/chat/chat-controller";
import { ChatSession, Mask, ChatMessage, ChatToolMessage } from "@/app//types/";

import { copyToClipboard, useMobileScreen } from "@/app/utils";
import { message } from "antd";
import { createMessage } from "@/app/store";
import { useAppConfig } from "@/app/store";
import { CHAT_PAGE_SIZE } from "@/app/constant";
import { useAccessStore } from "@/app/store";
import { BOT_HELLO } from "@/app/store";
import Locale from "@/app/locales";
import styles from "../chats.module.scss";
import { ChatContext } from "@/app/(chat-pages)/chats/chat/main";
import { useMessageActions } from "@/app/(chat-pages)/chats/chat/chatbody/useMessageActions";
import { useChatPagination } from "@/app/(chat-pages)/chats/chat/chatbody/useChatPagination";
import { MultiAgentChatSession } from "@/app/store/multiagents";

export type RenderMessage = ChatMessage & { preview?: boolean };

interface ChatMessageListProps {
	session: ChatSession;
	messages: ChatMessage[];
	isLoading: boolean;
	hasNextPage: boolean;
	getMessages: (sessionId: string, page: number) => void;
}

interface MultiAgentChatSessionListProps {
	messages: MultiAgentChatSession[];
	isLoading: boolean;
	hasNextPage: boolean;
}

export const MultiAgentMessageList: React.FC<
	MultiAgentChatSessionListProps
> = ({ messages, isLoading, hasNextPage }) => {
	let session: any = null;
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const isMobileScreen = useMobileScreen();

	if (messages[0] === undefined) {
		return null;
	}

	return (
		<>
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
							agentId={message.agentId}
						/>
					</Fragment>
				);
			})}
		</>
	);
};
