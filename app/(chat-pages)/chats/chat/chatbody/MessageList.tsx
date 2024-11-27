// MessageList.tsx
import React, { memo, useCallback, useRef } from "react";
import { useVirtual, VirtualItem } from "react-virtual";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMessage } from "@/app/types/chat";
import MessageItem from "./MessageItem";
import styles from "../chats.module.scss";

interface ChatMessageListProps {
	messages: ChatMessage[];
	isLoading: boolean;
	hasNextPage: boolean;
	onLoadMore: () => void;
	height: number;
	width: number;
}

interface VirtualRowProps {
	virtualRow: VirtualItem;
	message: ChatMessage;
	measureRef: (el: HTMLElement | null) => void;
}

const VirtualRow = memo(
	({ virtualRow, message, measureRef }: VirtualRowProps) => {
		return (
			<div
				ref={measureRef}
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					width: "100%",
					transform: `translateY(${virtualRow.start}px)`,
				}}
			>
				<motion.div
					className={styles["chat-message-wrapper"]}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{
						duration: 0.3,
						delay: virtualRow.index * 0.1,
						ease: [0.4, 0, 0.2, 1],
					}}
				>
					<MessageItem message={message} i={virtualRow.index} />
				</motion.div>
			</div>
		);
	},
);

VirtualRow.displayName = "VirtualRow";

export const MessageList: React.FC<ChatMessageListProps> = ({
	messages,
	isLoading,
	hasNextPage,
	onLoadMore,
	height,
	width,
}) => {
	const parentRef = useRef<HTMLDivElement>(null);
	const scrollingRef = useRef<boolean>(false);

	const rowVirtualizer = useVirtual({
		size: messages.length,
		parentRef,
		estimateSize: useCallback(() => 100, []),
		overscan: 5,
		observeElementRect: true,
		observeElementOffset: true,
		scrollingDelay: 150,
		onScrollingChange: (isScrolling: boolean) => {
			scrollingRef.current = isScrolling;
		},
	});

	const handleScroll = useCallback(
		(e: React.UIEvent<HTMLDivElement>) => {
			const target = e.target as HTMLDivElement;
			if (target.scrollTop < 100 && !isLoading && hasNextPage) {
				onLoadMore();
			}
		},
		[isLoading, hasNextPage, onLoadMore],
	);

	return (
		<div
			ref={parentRef}
			className={styles["message-list-container"]}
			style={{
				height,
				width,
				overflow: "auto",
				position: "relative",
			}}
			onScroll={handleScroll}
		>
			<div
				style={{
					height: `${rowVirtualizer.totalSize}px`,
					width: "100%",
					position: "relative",
				}}
			>
				<AnimatePresence>
					{rowVirtualizer.virtualItems.map((virtualRow) => (
						<VirtualRow
							key={virtualRow.index}
							virtualRow={virtualRow}
							message={messages[virtualRow.index]}
							measureRef={virtualRow.measureRef}
						/>
					))}
				</AnimatePresence>
			</div>

			{isLoading && (
				<motion.div
					className={styles["loading-indicator"]}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
				>
					<span>加载更多消息...</span>
				</motion.div>
			)}
		</div>
	);
};
