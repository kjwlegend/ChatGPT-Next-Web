// MessageList.tsx
import React from "react";
import { ChatMessage, ChatSession, useUserStore } from "@/app/store";
import { AgentMessageItem } from "./messageItem";
import { useContext, useRef, useState, useMemo, Fragment } from "react";
import { useScrollToBottom } from "../../chats/chat/chat-controller";

import { copyToClipboard, useMobileScreen } from "@/app/utils";
import { message } from "antd";
import { createMessage } from "@/app/store";
import { useAppConfig } from "@/app/store";
import { CHAT_PAGE_SIZE } from "@/app/constant";
import { useAccessStore } from "@/app/store";
import { BOT_HELLO } from "@/app/store";
import Locale from "@/app/locales";
import styles from "../chats.module.scss";
import { ChatContext } from "../../chats/chat/main";
import { useMessageActions } from "../../chats/chat/chatbody/useMessageActions";
import { useChatPagination } from "../../chats/chat/chatbody/useChatPagination";
import {
	DoubleAgentChatMessage,
	DoubleAgentChatSession,
} from "@/app/store/doubleAgents";

export type RenderMessage = ChatMessage & { preview?: boolean };

interface ChatMessageListProps {
	session: ChatSession;
	messages: ChatMessage[];
	isLoading: boolean;
	hasNextPage: boolean;
	getMessages: (sessionId: string, page: number) => void;
}

interface DoubleAgentChatMessageListProps {
	messages: DoubleAgentChatMessage[];
	isLoading: boolean;
	hasNextPage: boolean;
}

export const DoubleAgentMessageList: React.FC<
	DoubleAgentChatMessageListProps
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
							agentNum={message.agentNum}
						/>
					</Fragment>
				);
			})}
		</>
	);
};
