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
import { useResizeObserver } from "@/app/hooks/useResizeObserver";

import { LoadingIcon } from "@/app/icons"; // 假设的图标资源

import { useChatStore, BOT_HELLO, createMessage } from "@/app/store/chat";

import { ChatMessage, ChatSession } from "@/app/types/chat";

import { message } from "antd";

import { MessageList } from "./MessageList";
import { CHAT_PAGE_SIZE } from "@/app/constant";
import styles from "../chats.module.scss";
import { AppGeneralContext } from "@/app/contexts/AppContext";
import { useMessages, useSessions } from "../hooks/useChatContext";
import { useGlobalLoading } from "@/app/contexts/GlobalLoadingContext";
import { useChatScroll } from "../hooks/useChatScroll";
import { useChatDimensions } from "../hooks/useChatDimensions";
import { useMessageLoader } from "../hooks/useMessageLoader";

type RenderMessage = ChatMessage & { preview?: boolean };

const MemoMessageList = React.memo(MessageList);
export function Chatbody(props: { index?: number; isworkflow?: boolean }) {
	const session = useSessions();
	const messages = useMessages();
	const { isLoading } = useGlobalLoading();

	const scrollRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);

	const dimensions = useChatDimensions(scrollRef);
	const { autoScroll, scrollToBottom } = useChatScroll();
	const { messageLoading, hasNextPage, loadMoreMessages } = useMessageLoader(
		session.id,
	);

	useEffect(() => {
		if (autoScroll) {
			scrollToBottom(scrollRef.current!);
		}
	}, [autoScroll, messages, scrollToBottom]);

	return (
		<div className={styles["chat-body"]} ref={scrollRef}>
			{isLoading ? (
				<div className={styles["loading-indicator"]}>
					<LoadingIcon />
					<span>加载中...</span>
				</div>
			) : (
				<MemoMessageList
					messages={messages}
					isLoading={messageLoading}
					hasNextPage={hasNextPage}
					onLoadMore={loadMoreMessages}
					height={dimensions.height}
					width={dimensions.width}
				/>
			)}
		</div>
	);
}
