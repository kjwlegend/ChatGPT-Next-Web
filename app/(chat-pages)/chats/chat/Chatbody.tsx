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

import { getISOLang, getLang } from "@/app/locales";
import Locale from "@/app/locales";
import { useRouter } from "next/navigation";

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

import { useChatStore, BOT_HELLO, createMessage } from "@/app/store/chat";

import { ChatMessage, ChatSession } from "@/app/types/chat";

import { message } from "antd";
import useAuth from "@/app/hooks/useAuth";
import { ChatData } from "@/app/api/backend/chat";
import { MJFloatButton } from "./midjourney";

import { MessageList } from "./chatbody/MessageList";
import { CHAT_PAGE_SIZE } from "@/app/constant";
import styles from "./chats.module.scss";
import { handleChatCallbacks } from "@/app/services/chatService";
import { AppGeneralContext } from "@/app/contexts/AppContext";
import {
	useChatSetting,
	useMessages,
	useSessions,
} from "./hooks/useChatContext";
import { useGlobalLoading } from "@/app/contexts/GlobalLoadingContext";

type RenderMessage = ChatMessage & { preview?: boolean };

const MemoMessageList = React.memo(MessageList);
export function Chatbody(props: { index?: number; isworkflow?: boolean }) {
	const chatStore = useChatStore.getState();

	const { index, isworkflow } = props;

	const session = useSessions();
	const messages = useMessages();

	// if props._session is not provided, use current session
	const sessionId = session.id;

	const inputRef = useRef<HTMLTextAreaElement>(null);
	const scrollRef = useRef<HTMLDivElement>(null);

	const [autoScroll, setAutoScroll] = useState(true);

	const scrollToBottom = () => {
		const scrollElement = scrollRef.current;
		if (scrollElement) {
			const scrollHeight = scrollElement.scrollHeight;
			if (scrollHeight > scrollElement.scrollTop + scrollElement.clientHeight) {
				const scroll = () => {
					try {
						scrollElement.scrollTo({
							top: scrollHeight,
							behavior: "smooth",
						});
					} catch (error) {
						console.error("Failed to scroll to bottom:", error);
					}
				};
				requestAnimationFrame(scroll);
			}
		}
	};

	useEffect(() => {
		if (autoScroll) {
			scrollToBottom();
		}
	}, [autoScroll, messages]);

	const isMobileScreen = useContext(AppGeneralContext).isMobile;

	const [messageApi, contextHolder] = message.useMessage();

	// const [messages, setMessages] = useState<RenderMessage[]>(messages);
	const [messageLoading, setMessageLoading] = useState(false);
	const [hasNextPage, setHasNextPage] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);

	useEffect(() => {
		// 当 ChatBody 组件加载时获取第一页的消息
		getMessages(sessionId, currentPage);
	}, [sessionId]);

	const getMessages = useCallback(async (sessionid: string, page: number) => {
		// setIsLoading(true);
		// if (!isAuthenticated) return;
		// try {
		// 	const param = {
		// 		chat_session: sessionid,
		// 		user: userStore.user.id,
		// 		page: page,
		// 		limit: 50,
		// 	};
		// 	const chatSessionList = await getChat(param);
		// 	if (chatSessionList.data.length == 0) {
		// 		setHasNextPage(false);
		// 	} else {
		// 		setMessages((prevMessages) => {
		// 			// 创建一个包含之前消息 ID 的集合
		// 			const existingIds = new Set(prevMessages.map((msg: any) => msg.id));
		// 			// 过滤掉已经存在的消息
		// 			const newMessages = chatSessionList.data.filter(
		// 				(msg: any) => !existingIds.has(msg.id),
		// 			);
		// 			// 返回新的消息数组，不包含重复的消息
		// 			return [...prevMessages, ...newMessages];
		// 		});
		// 		setHasNextPage(chatSessionList.is_next);
		// 		UpdateChatMessages(sessionId, chatSessionList.data);
		// 	}
		// } catch (error: any) {
		// 	// messageApi.error("Failed to load messages: " + error.toString());
		// } finally {
		// 	setIsLoading(false);
		// }
	}, []);

	const context: RenderMessage[] = useMemo(() => {
		if (session.mask.hideContext) {
			return session.mask.intro
				? [{ ...BOT_HELLO, content: session.mask.intro }]
				: [];
		} else {
			return session.mask.context.slice();
		}
	}, [session.mask.context, session.mask.hideContext, session.mask.intro]);

	const renderMessages = useMemo(() => {
		const sortedMessages = [...messages].sort(
			(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
		);
		const contextMessage = context
			.concat(sortedMessages as RenderMessage[])
			.concat(
				messageLoading
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
			);

		return contextMessage;
	}, [context, messageLoading, messages]);

	const [msgRenderIndex, _setMsgRenderIndex] = useState(() =>
		Math.max(
			0,
			Math.min(
				renderMessages.length - 1,
				renderMessages.length - CHAT_PAGE_SIZE,
			),
		),
	);

	const messagesfinal = useMemo(() => {
		const endRenderIndex = Math.min(
			msgRenderIndex + 3 * CHAT_PAGE_SIZE,
			renderMessages.length,
		);

		return renderMessages.slice(msgRenderIndex, endRenderIndex);
	}, [msgRenderIndex, renderMessages]);

	function setMsgRenderIndex(newIndex: number) {
		const validIndex = Math.min(
			Math.max(0, newIndex),
			Math.max(0, renderMessages.length - CHAT_PAGE_SIZE),
		);
		_setMsgRenderIndex(validIndex);
	}

	const onChatBodyScroll = useCallback((e: HTMLElement) => {
		const { isTouchTopEdge, isTouchBottomEdge, isHitBottom } =
			checkScrollAndFetchMessages(e);

		// console.log("isTouchTopEdge", isTouchTopEdge);

		const prevPageMsgIndex = msgRenderIndex - CHAT_PAGE_SIZE;
		const nextPageMsgIndex = msgRenderIndex + CHAT_PAGE_SIZE;

		if (isTouchTopEdge && !isTouchBottomEdge) {
			// 如果触碰到顶部，可以加载前一页的消息（如果有的话）
			if (currentPage > 1) {
				// currentPage -= 1;
				setCurrentPage(currentPage - 1);
				getMessages(sessionId, currentPage);
			}
			setMsgRenderIndex(prevPageMsgIndex);
		} else if (isTouchBottomEdge && isHitBottom && hasNextPage) {
			// console.log(
			// 	"isTouchBottomEdge",
			// 	isTouchBottomEdge,
			// 	"hasNextPage",
			// 	hasNextPage,
			// );
			// 如果触碰到底部且还有下一页的消息，则加载下一页的消息
			setCurrentPage(currentPage + 1);
			// getMessages(sessionId, currentPage);
			setMsgRenderIndex(nextPageMsgIndex);
		}

		// // 更新是否触碰到底部的状态
		// setHitBottom(isHitBottom);
		// // 更新是否自动滚动到底部的状态
		setAutoScroll(isHitBottom);
	}, []);

	const checkScrollAndFetchMessages = (e: HTMLElement) => {
		const bottomHeight = e.scrollTop + e.clientHeight;
		const edgeThreshold = e.clientHeight;

		const isTouchTopEdge = e.scrollTop <= edgeThreshold;
		const isTouchBottomEdge = bottomHeight >= e.scrollHeight - edgeThreshold;
		const isHitBottom =
			bottomHeight >= e.scrollHeight - (isMobileScreen ? 10 : 20);

		return { isTouchTopEdge, isTouchBottomEdge, isHitBottom };
	};

	//  get all messages from chatstore
	const { isLoading } = useGlobalLoading();
	return (
		<div
			className={styles["chat-body"]}
			ref={scrollRef}
			onScroll={(e) => onChatBodyScroll(e.currentTarget)}
			onMouseDown={() => inputRef.current?.blur()}
			onTouchStart={() => {
				inputRef.current?.blur();
				// setAutoScroll(false);
			}}
		>
			{isLoading ? (
				<div className={styles["loading-indicator"]}>
					<LoadingIcon />
					<span>加载中...</span>
				</div>
			) : (
				<MemoMessageList
					messages={messagesfinal}
					isLoading={messageLoading}
					hasNextPage={hasNextPage}
				/>
			)}
		</div>
	);
}
