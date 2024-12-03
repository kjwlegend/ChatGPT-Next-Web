import React from "react";
import { MultiAgentChatMessage } from "@/app/store/multiagents/types";
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
				目前暂无任何对话, 请修改对话轮数, 在下方输入框输入探索主题.
			</div>
		);
	}

	return (
		<div className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent h-full overflow-y-auto">
			{isLoading && hasNextPage && (
				<div className={styles.loadingMore}>
					<Spin /> Loading more messages...
				</div>
			)}
			{messages.map((message, index) => (
				<AgentMessageItem key={message.id} message={message} index={index} />
			))}
		</div>
	);
};
