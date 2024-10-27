import React, { use, useMemo } from "react";
import { MultiAgentChatMessage } from "@/app/store/multiagents";
import styles from "@/app/(chat-pages)/chats/chat/chats.module.scss";
import { Markdown } from "@/app/components/markdown";
import { MaskAvatar } from "@/app/(chat-pages)/chats/components/mask-modal";
import { useAppConfig, useUserStore } from "@/app/store";
import { getMessageImages } from "@/app/utils";

import { Avatar } from "@/app/components/avatar";
import { useMaskStore } from "@/app/store/mask/index";

interface AgentMessageItemProps {
	message: MultiAgentChatMessage;
	index: number;
}

export const AgentMessageItem: React.FC<AgentMessageItemProps> = ({
	message,
	index,
}) => {
	const isUser = message.role === "user";
	const config = useAppConfig();
	const fontSize = config.fontSize;

	const userStore = useUserStore.getState();
	const maskStore = useMaskStore.getState();

	const userAvatar = useMemo(() => {
		return userStore.user.avatar;
	}, [userStore]);

	const agentAvatar = useMemo(() => {
		const mask = maskStore.masks[message.agentId ?? 1];
		return mask?.avatar || `/agent-${message.agentId}-avatar.png`;
	}, [maskStore.masks, message.agentId]);

	const RenderedAvatar = useMemo(() => {
		return isUser ? (
			<Avatar avatar={userAvatar} nickname={userStore.user.nickname} />
		) : (
			<Avatar avatar={agentAvatar} nickname={message.agentName} />
		);
	}, [isUser, message.agentName]);

	const messageImages = getMessageImages(message);

	return (
		<div
			className={isUser ? styles["chat-message-user"] : styles["chat-message"]}
		>
			<div
				className={`${styles["chat-message-container"]} ${styles["multi-agents"]}`}
			>
				<div className={styles["chat-message-header"]}>
					<div className={styles["chat-message-avatar"]}>{RenderedAvatar}</div>
					<span className={styles["chat-message-name"]}>
						{!isUser
							? `${message.agentId} - ${message.agentName}`
							: userStore.user.nickname}
					</span>
					<span className={styles["chat-message-time"]}>
						- {new Date(message.date).toLocaleString()}
					</span>
				</div>

				<div
					className={`${styles["chat-message-item"]} ${styles["multi-agents"]}`}
				>
					<Markdown content={message.content as string} fontSize={fontSize} />

					{/* 文件信息展示 */}
					{message.fileInfos && message.fileInfos.length > 0 && (
						<nav
							className={styles["chat-message-item-files"]}
							style={
								{
									"--file-count": message.fileInfos.length,
								} as React.CSSProperties
							}
						>
							{message.fileInfos.map((fileInfo, index) => (
								<a
									key={index}
									href={fileInfo.filePath}
									className={styles["chat-message-item-file"]}
									target="_blank"
									rel="noopener noreferrer"
								>
									{fileInfo.originalFilename}
								</a>
							))}
						</nav>
					)}

					{/* 单张图片展示 */}
					{messageImages.length === 1 && (
						<img
							className={styles["chat-message-item-image"]}
							src={messageImages[0]}
							alt=""
						/>
					)}

					{/* 多张图片展示 */}
					{messageImages.length > 1 && (
						<div
							className={styles["chat-message-item-images"]}
							style={
								{
									"--image-count": messageImages.length,
								} as React.CSSProperties
							}
						>
							{messageImages.map((image, index) => (
								<img
									className={styles["chat-message-item-image-multi"]}
									key={index}
									src={image}
									alt=""
								/>
							))}
						</div>
					)}

					<div className={styles["chat-message-actions"]}>
						<div className={styles["chat-message-notes"]}>
							<div>
								Token counts: {message.token_counts_total} | messageid:{" "}
								{message.id}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
