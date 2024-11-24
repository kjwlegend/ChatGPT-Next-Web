import React from "react";
import dynamic from "next/dynamic";
import { LoadingIcon } from "@/app/icons";
import styles from "@/app/(chat-pages)/chats/chat/chats.module.scss";

const Markdown = dynamic(
	async () => (await import("@/app/components/markdown")).Markdown,
	{
		loading: () => <LoadingIcon />,
	},
);

interface MessageContentProps {
	content: string;
	isLoading: boolean;
	isUser: boolean;
	fontSize: number;
	onRightClick: (e: React.MouseEvent) => void;
	onDoubleClick: () => void;
}

const MessageContent: React.FC<MessageContentProps> = ({
	content,
	isLoading,
	isUser,
	fontSize,
	onRightClick,
	onDoubleClick,
}) => {
	return (
		<Markdown
			content={content}
			loading={isLoading}
			onContextMenu={onRightClick}
			onDoubleClickCapture={onDoubleClick}
			fontSize={fontSize}
		/>
	);
};

export default MessageContent;
