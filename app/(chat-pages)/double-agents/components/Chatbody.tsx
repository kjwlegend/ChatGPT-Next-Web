"use client";
import { useDebouncedCallback } from "use-debounce";
import React, {
	useState,
	useRef,
	useEffect,
	useMemo,
	useCallback,
	Fragment,
	useContext,
	use,
} from "react";
import { Image } from "antd";
import { getISOLang, getLang } from "@/app/locales";
import Locale from "@/app/locales";

import {
	EditIcon,
	StopIcon,
	LoadingIcon,
	ResetIcon,
	DeleteIcon,
	PinIcon,
	CopyIcon,
	NextIcon,
	CheckmarkIcon,
	PlayIcon,
} from "@/app/icons"; // 假设的图标资源
import { ChatSession, Mask, ChatMessage, ChatToolMessage } from "@/app//types/";

import {
	useChatStore,
	BOT_HELLO,
	createMessage,
	useAccessStore,
	useAppConfig,
	DEFAULT_TOPIC,
	ModelType,
	useUserStore,
} from "@/app/store";

import dynamic from "next/dynamic";

import { useScrollToBottom } from "@/app/hooks/useGeneralChatHook";

import { CreateChatData, createChat } from "@/app/api/backend/chat";
import { useMobileScreen } from "@/app/hooks/useMobileScreen";

import { message, Button } from "antd";

import { MultiAgentMessageList } from "./messageList";
import { CHAT_PAGE_SIZE } from "@/app/constant";
import styles from "@/app/(chat-pages)/chats/chat/chats.module.scss";
import usemultiAgentStore from "@/app/store/multiagents";
import { MultiAgentChatSession } from "@/app/store/multiagents";

type RenderMessage = ChatMessage & { preview?: boolean };

export function MultiAgentChatbody(props: {
	_session?: MultiAgentChatSession;
	index?: number;
	isworkflow?: boolean;
}) {
	const chatStore = usemultiAgentStore();

	const config = useAppConfig();
	const { _session, index, isworkflow } = props;

	// if props._session is not provided, use current session
	const session = _session ?? chatStore.currentSession();

	const inputRef = useRef<HTMLTextAreaElement>(null);
	const isMobileScreen = useMobileScreen();

	const [messageApi, contextHolder] = message.useMessage();

	const scrollRef = useRef<HTMLDivElement>(null);
	const { setAutoScroll, scrollDomToBottom } = useScrollToBottom();

	const [messages, setMessages] = useState<RenderMessage[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [hasNextPage, setHasNextPage] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);

	const sessionId = session.id;

	useEffect(() => {
		// 当 ChatBody 组件加载时获取第一页的消息
		// getMessages(sessionId, currentPage);
	}, [sessionId]);

	function setMsgRenderIndex(newIndex: number) {
		newIndex = Math.min(renderMessages.length - CHAT_PAGE_SIZE, newIndex);
		newIndex = Math.max(0, newIndex);
		_setMsgRenderIndex(newIndex);
	}

	const context: RenderMessage[] = useMemo(() => {
		return [];
	}, []);

	const renderMessages = useMemo(() => {
		return context
			.concat(session.messages as RenderMessage[])
			.concat(
				isLoading
					? [
							{
								...createMessage({
									role: "assistant",
									content: "……",
									image_url: [],
								}),
								preview: true,
							},
						]
					: [],
			)
			.concat(
				userInput.length > 0 && config.sendPreviewBubble
					? [
							{
								...createMessage({
									role: "user",
									content: userInput,
									image_url: userImage?.fileUrl,
								}),
								preview: true,
							},
						]
					: [],
			);
	}, [
		config.sendPreviewBubble,
		context,
		isLoading,
		session.messages,
		userImage?.fileUrl,
	]);

	const [msgRenderIndex, _setMsgRenderIndex] = useState(
		Math.max(0, renderMessages.length - CHAT_PAGE_SIZE),
	);

	const messagesfinal = useMemo(() => {
		const endRenderIndex = Math.min(
			msgRenderIndex + 3 * CHAT_PAGE_SIZE,
			renderMessages.length,
		);
		return renderMessages.slice(msgRenderIndex, endRenderIndex);
	}, [msgRenderIndex, renderMessages]);

	const onChatBodyScroll = (e: HTMLElement) => {
		// console.log("onChatBodyScroll");
		const { isTouchTopEdge, isTouchBottomEdge, isHitBottom } =
			checkScrollAndFetchMessages(e);

		// const prevPageMsgIndex = msgRenderIndex - CHAT_PAGE_SIZE;
		// const nextPageMsgIndex = msgRenderIndex + CHAT_PAGE_SIZE;

		// if (isTouchTopEdge && !isTouchBottomEdge) {
		// 	// 如果触碰到顶部，可以加载前一页的消息（如果有的话）
		// 	if (currentPage > 1) {
		// 		// currentPage -= 1;
		// 		setCurrentPage(currentPage - 1);
		// 		getMessages(sessionId, currentPage);
		// 	}
		// 	setMsgRenderIndex(prevPageMsgIndex);
		// } else if (isTouchBottomEdge && isHitBottom && hasNextPage) {
		// 	console.log(
		// 		"isTouchBottomEdge",
		// 		isTouchBottomEdge,
		// 		"hasNextPage",
		// 		hasNextPage,
		// 	);
		// 	// 如果触碰到底部且还有下一页的消息，则加载下一页的消息
		// 	setCurrentPage(currentPage + 1);
		// 	getMessages(sessionId, currentPage);
		// 	setMsgRenderIndex(nextPageMsgIndex);
		// }

		// 更新是否触碰到底部的状态
		setHitBottom(isHitBottom);
		// 更新是否自动滚动到底部的状态
		setAutoScroll(isHitBottom);
	};
	const checkScrollAndFetchMessages = (e: HTMLElement) => {
		const bottomHeight = e.scrollTop + e.clientHeight;
		const edgeThreshold = e.clientHeight;

		const isTouchTopEdge = e.scrollTop <= edgeThreshold;
		const isTouchBottomEdge = bottomHeight >= e.scrollHeight - edgeThreshold;
		const isHitBottom =
			bottomHeight >= e.scrollHeight - (isMobileScreen ? 5 : 10);

		return { isTouchTopEdge, isTouchBottomEdge, isHitBottom };
	};

	//  get all messages from chatstore
	const messageslist = session.messages;
	return (
		<div
			className={styles["chat-body"]}
			ref={scrollRef}
			onScroll={(e) => onChatBodyScroll(e.currentTarget)}
			style={{
				height: "60vh",
				overflowY: "auto",
			}}
		>
			<MultiAgentMessageList
				messages={messagesfinal}
				isLoading={isLoading}
				hasNextPage={hasNextPage}
			/>
		</div>
	);
}
