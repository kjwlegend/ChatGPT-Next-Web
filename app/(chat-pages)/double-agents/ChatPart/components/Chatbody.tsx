"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { MultiAgentMessageList } from "./messageList";
import styles from "@/app/(chat-pages)/chats/chat/chats.module.scss";
import {
	useMultipleAgentStore,
	MultiAgentChatMessage,
} from "@/app/store/multiagents";
import { CHAT_PAGE_SIZE } from "@/app/constant";
import useMessage from "antd/es/message/useMessage";
import { useCurrentConversation, useMessages } from "../../multiAgentContext";

export function MultiAgentChatbody() {
	const { conversation, conversationId } = useCurrentConversation();

	const currentSessionId = conversationId;
	const session = conversation;

	const { messages } = useMessages();

	const [displayMessages, setDisplayMessages] =
		useState<MultiAgentChatMessage[]>(messages);

	const [isLoading, setIsLoading] = useState(false);
	const [hasNextPage, setHasNextPage] = useState(true);

	const chatBodyRef = useRef<HTMLDivElement>(null);
	const [autoScroll, setAutoScroll] = useState(true);

	// 初始化显示消息和检查是否还有更多消息
	useEffect(() => {
		if (session) {
			const totalMessages = session.messages.length;
			const initialMessages = session.messages.slice(-CHAT_PAGE_SIZE);
			setDisplayMessages(initialMessages);
			setHasNextPage(totalMessages > CHAT_PAGE_SIZE);
		}
	}, [session?.id, currentSessionId]); // 只在会话ID变化时重新初始化

	// 监听 messages 的变化并更新 displayMessages
	useEffect(() => {
		setDisplayMessages(messages);
	}, [messages]);

	// 处理滚动事件
	const handleScroll = useCallback(() => {
		if (chatBodyRef.current) {
			const { scrollTop, scrollHeight, clientHeight } = chatBodyRef.current;
			// 当滚动到顶部时加载更多消息
			if (scrollTop === 0 && hasNextPage) {
				loadMoreMessages();
			}
			// 检查是否滚动到底部
			setAutoScroll(scrollHeight - scrollTop === clientHeight);
		}
	}, [hasNextPage]);

	// 加载更多消息
	const loadMoreMessages = useCallback(() => {
		if (session && hasNextPage) {
			setIsLoading(true);
			const currentLength = displayMessages.length;
			const newMessages = session.messages.slice(
				Math.max(0, session.messages.length - currentLength - CHAT_PAGE_SIZE),
				session.messages.length - currentLength,
			);
			setDisplayMessages((prevMessages) => {
				const uniqueMessages = newMessages.filter(
					(msg) => !prevMessages.some((prevMsg) => prevMsg.id === msg.id),
				);
				return [...uniqueMessages, ...prevMessages];
			});
			setHasNextPage(
				session.messages.length > currentLength + newMessages.length,
			);
			setIsLoading(false);
		}
	}, [session, displayMessages, hasNextPage]);

	// 监听新消息
	useEffect(() => {
		if (session) {
			const totalMessages = session.messages.length;
			const displayedCount = displayMessages.length;

			if (totalMessages > displayedCount) {
				const newMessages = session.messages.slice(displayedCount);
				setDisplayMessages((prevMessages) => {
					const uniqueNewMessages = newMessages.filter(
						(msg) => !prevMessages.some((prevMsg) => prevMsg.id === msg.id),
					);
					return [...prevMessages, ...uniqueNewMessages];
				});
			}
		}
	}, [session?.messages]);

	// 自动滚动到底部
	useEffect(() => {
		if (autoScroll && chatBodyRef.current) {
			chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
		}
	}, [displayMessages, autoScroll]);

	if (!session) {
		return null;
	}

	console.log("double agent message", displayMessages);
	return (
		<div
			className={styles["chat-body"]}
			ref={chatBodyRef}
			onScroll={handleScroll}
		>
			<MultiAgentMessageList
				messages={displayMessages}
				isLoading={isLoading}
				hasNextPage={hasNextPage}
			/>
		</div>
	);
}
