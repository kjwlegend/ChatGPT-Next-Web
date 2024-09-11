import React from "react";
import { MultiAgentChatMessage } from "@/app/store/multiagents";
import { AgentMessageItem } from "./messageItem";
import styles from "@/app/(chat-pages)/chats/chat/chats.module.scss";
import { Spin } from "antd";

interface MultiAgentChatSessionListProps {
	messages: MultiAgentChatMessage[];
	isLoading: boolean;
	hasNextPage: boolean;
}

export const MultiAgentMessageList: React.FC<
	MultiAgentChatSessionListProps
> = ({ messages, isLoading, hasNextPage }) => {
	if (messages.length === 0 && !isLoading) {
		return (
			<div className={styles.emptyState}>
				No messages yet. Start a conversation!
			</div>
		);
	}

	return (
		<>
			{isLoading && hasNextPage && (
				<div className={styles.loadingMore}>
					<Spin /> Loading more messages...
				</div>
			)}
			{messages.map((message, index) => (
				<AgentMessageItem key={message.id} message={message} index={index} />
			))}
		</>
	);
};
