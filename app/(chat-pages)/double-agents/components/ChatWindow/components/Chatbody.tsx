"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { MultiAgentMessageList } from "./messageList";
import styles from "@/app/(chat-pages)/chats/chat/chats.module.scss";
import { useMultipleAgentStore } from "@/app/store/multiagents/index";
import { MultiAgentChatMessage } from "@/app/store/multiagents/types";
import { CHAT_PAGE_SIZE } from "@/app/constant";

export function MultiAgentChatbody() {
	const multiAgentStore = useMultipleAgentStore.getState();

	const currentSessionId = multiAgentStore.currentConversationId;
	const session = multiAgentStore.currentSession();

	const messages = multiAgentStore.getCurrentMessages();

	const [displayMessages, setDisplayMessages] = useState<
		MultiAgentChatMessage[]
	>(messages ?? []);

	const [isLoading, setIsLoading] = useState(false);
	const [hasNextPage, setHasNextPage] = useState(true);

	const chatBodyRef = useRef<HTMLDivElement>(null);
	const [autoScroll, setAutoScroll] = useState(true);
	const mounted = useRef(true);

	// 组件卸载时清理
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);

	// 处理 session 变化和初始化
	useEffect(() => {
		if (!mounted.current) return;

		if (!session) {
			setDisplayMessages([]);
			setHasNextPage(false);
			return;
		}

		if (session.messages?.length) {
			const totalMessages = session.messages.length;
			const initialMessages = session.messages.slice(-CHAT_PAGE_SIZE);
			setDisplayMessages(initialMessages);
			setHasNextPage(totalMessages > CHAT_PAGE_SIZE);
		} else {
			setDisplayMessages([]);
			setHasNextPage(false);
		}
	}, [session]);

	// 处理新消息更新
	useEffect(() => {
		if (session?.messages && messages) {
			const totalMessages = messages.length;
			const displayedCount = displayMessages.length;

			if (totalMessages > displayedCount) {
				const newMessages = messages.slice(displayedCount);
				setDisplayMessages((prevMessages) => {
					const uniqueNewMessages = newMessages.filter(
						(msg) => !prevMessages.some((prevMsg) => prevMsg.id === msg.id),
					);
					return [...prevMessages, ...uniqueNewMessages];
				});
			}
		}
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
		if (session?.messages) {
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
