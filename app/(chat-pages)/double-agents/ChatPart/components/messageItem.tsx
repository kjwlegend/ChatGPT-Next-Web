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
						{isUser ? "You" : `Agent ${message.agentId}`}
					</span>
					<span className={styles.timestamp}>
						{new Date(message.date).toLocaleTimeString()}
					</span>
				</div>
				<MarkdownContent content={message.content as string} />
			</div>
		</div>
	);
};
