import React from "react";
import styles from "@/app/(chat-pages)/chats/chat/chats.module.scss";

interface MessageImageContentProps {
	images: string[];
}

const MessageImageContent: React.FC<MessageImageContentProps> = ({
	images,
}) => {
	if (images.length === 0) return null;

	if (images.length === 1) {
		return (
			<img
				className={styles["chat-message-item-image"]}
				src={images[0]}
				alt=""
			/>
		);
	}

	return (
		<div
			className={styles["chat-message-item-images"]}
			style={
				{
					"--image-count": images.length,
				} as React.CSSProperties
			}
		>
			{images.map((image, index) => (
				<img
					className={styles["chat-message-item-image-multi"]}
					key={index}
					src={image}
					alt=""
				/>
			))}
		</div>
	);
};

export default MessageImageContent;
