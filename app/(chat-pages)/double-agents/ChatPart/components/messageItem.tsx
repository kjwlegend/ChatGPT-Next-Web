import React from "react";
import { MultiAgentChatMessage } from "@/app/store/multiagents";
import styles from "@/app/(chat-pages)/chats/chat/chats.module.scss";
import { Avatar } from "antd";
import { MarkdownContent } from "@/app/components/markdown";

interface AgentMessageItemProps {
	message: MultiAgentChatMessage;
	index: number;
}

export const AgentMessageItem: React.FC<AgentMessageItemProps> = ({
	message,
	index,
}) => {
	const isUser = message.role === "user";
	const avatarUrl = isUser
		? "/user-avatar.png"
		: `/agent-${message.agentId}-avatar.png`;

	return (
		<div
			className={`${styles.messageItem} ${isUser ? styles.userMessage : styles.agentMessage}`}
		>
			<Avatar src={avatarUrl} className={styles.avatar} />
			<div className={styles.messageContent}>
				<div className={styles.messageHeader}>
					<span className={styles.sender}>
						{isUser
							? "You"
							: `Agent_id ${message.agentId} ${message.agentName}`}
					</span>
					<p className={styles.timestamp}>
						{new Date(message.date).toLocaleTimeString()}
					</p>
				</div>
				<MarkdownContent content={message.content as string} />
				<div className={styles.messageInfo}>
					<p>ID: {message.id}</p>

					<p>Chat ID: {message.chat_id}</p>
					<p>Is Finished: {message.isFinished ? "Yes" : "No"}</p>
					<p>Is Transferred: {message.isTransfered ? "Yes" : "No"}</p>
					<p>Token Count: {message.token_counts_total}</p>
				</div>
			</div>
		</div>
	);
};
