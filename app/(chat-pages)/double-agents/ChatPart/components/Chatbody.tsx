"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { MultiAgentMessageList } from "./messageList";
import styles from "@/app/(chat-pages)/chats/chat/chats.module.scss";
import {
	useMultipleAgentStore,
	MultiAgentChatSession,
	MultiAgentChatMessage,
} from "@/app/store/multiagents";
import { CHAT_PAGE_SIZE } from "@/app/constant";

export function MultiAgentChatbody() {
	const chatStore = useMultipleAgentStore();
	const currentSessionId = chatStore.currentConversationId;
	const session = chatStore.conversations.find(
		(conv) => conv.id === currentSessionId,
	);

	const [displayMessages, setDisplayMessages] = useState<
		MultiAgentChatMessage[]
	>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [hasNextPage, setHasNextPage] = useState(true);

	const chatBodyRef = useRef<HTMLDivElement>(null);
	const [autoScroll, setAutoScroll] = useState(true);

	// 初始化显示消息和检查是否还有更多消息
	useEffect(() => {
		if (session) {
			const initialMessages = session.messages.slice(-CHAT_PAGE_SIZE);
			setDisplayMessages(initialMessages);
			setHasNextPage(session.messages.length > CHAT_PAGE_SIZE);
		}
	}, [session]);

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
			setDisplayMessages((prevMessages) => [...newMessages, ...prevMessages]);
			setHasNextPage(
				session.messages.length > currentLength + newMessages.length,
			);
			setIsLoading(false);
		}
	}, [session, displayMessages, hasNextPage]);

	// 自动滚动到底部
	useEffect(() => {
		if (autoScroll && chatBodyRef.current) {
			chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
		}
	}, [displayMessages, autoScroll]);

	// 监听新消息
	useEffect(() => {
		if (session && session.messages.length > displayMessages.length) {
			const newMessages = session.messages.slice(displayMessages.length);
			setDisplayMessages((prevMessages) => [...prevMessages, ...newMessages]);
		}
	}, [session?.messages]);

	if (!session) {
		return null;
	}

	return (
		<div
			className={styles["chat-body"]}
			ref={chatBodyRef}
			onScroll={handleScroll}
			style={{
				height: "60vh",
				overflowY: "auto",
			}}
		>
			<MultiAgentMessageList
				messages={displayMessages}
				isLoading={isLoading}
				hasNextPage={hasNextPage}
			/>
		</div>
	);
}
