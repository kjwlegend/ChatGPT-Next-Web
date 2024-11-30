"use client";
import { useDebouncedCallback } from "use-debounce";
import React, { useState, useRef } from "react";
import { useResizeObserver } from "@/app/hooks/useResizeObserver";

import { LoadingIcon } from "@/app/icons"; // 假设的图标资源

import { MessageList } from "./MessageList";
import { CHAT_PAGE_SIZE } from "@/app/constant";
import styles from "../chats.module.scss";
import { useMessages, useSessions } from "../hooks/useChatContext";
import { useGlobalLoading } from "@/app/contexts/GlobalLoadingContext";
import { useChatDimensions } from "../hooks/useChatDimensions";
import { useMessageLoader } from "../hooks/useMessageLoader";

const MemoMessageList = React.memo(MessageList);
export function Chatbody(props: { index?: number; isworkflow?: boolean }) {
	const session = useSessions();
	const messages = useMessages();
	const { isLoading } = useGlobalLoading();

	const scrollRef = useRef<HTMLDivElement>(null);

	const dimensions = useChatDimensions(scrollRef);
	const { messageLoading, hasNextPage, loadMoreMessages } = useMessageLoader(
		session.id,
	);
	// console.log("session: ", session);

	return (
		<div className={styles["chat-body"]} ref={scrollRef}>
			{isLoading ? (
				<div className={styles["loading-indicator"]}>
					<LoadingIcon />
					<span>加载中...</span>
				</div>
			) : (
				<>
					<MemoMessageList
						messages={messages}
						isLoading={messageLoading}
						hasNextPage={hasNextPage}
						onLoadMore={loadMoreMessages}
						height={dimensions.height}
						width={dimensions.width}
					/>
				</>
			)}
		</div>
	);
}
