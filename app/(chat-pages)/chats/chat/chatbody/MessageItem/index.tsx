import React, { useMemo, useState } from "react";
import styles from "@/app/(chat-pages)/chats/chat/chats.module.scss";
import MessageAvatar from "./MessageAvatar";
import MessageActions from "./MessageActions";
import MessageContent from "./MessageContent";
import MessageToolContent from "./MessageToolContent";
import MessageFileContent from "./MessageFileContent";
import MessageImageContent from "./MessageImageContent";
import { useMessageActions } from "../../hooks/useMessageActions";
import {
	getMessageImages,
	getMessageTextContent,
	copyToClipboard,
	selectOrCopy,
} from "@/app/utils";
import { ChatMessage } from "@/app/types/chat";
import MjActions from "../../midjourney";
import { Loading3QuartersOutlined } from "@ant-design/icons";
import Locale from "@/app/locales";
import { PlayIcon } from "@/app/icons";
import { useSessions } from "../../hooks/useChatContext";
import { useAppConfig } from "@/app/store";
import { useWorkflowStore } from "@/app/store/workflow";
import { LAST_INPUT_KEY } from "@/app/constant";

interface MessageItemProps {
	message: ChatMessage;
	i: number;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, i }) => {
	const [userInput, setUserInput] = useState("");
	const [showToastModal, setShowToastModal] = useState(false);
	const session = useSessions();
	const sessionId = session.id;

	const config = useAppConfig();
	const {
		handleUserStop,
		handleDelete,
		handlePinMessage,
		handleResend,
		handlePlayAudio,
	} = useMessageActions(session, setShowToastModal);

	const workflowStore = useWorkflowStore.getState();

	/**
	 * @description: 下一个工作流
	 */
	const onNextworkflow = (message: ChatMessage) => {
		workflowStore.sendMessagetoNextSession(sessionId, message);
		localStorage.setItem(LAST_INPUT_KEY, userInput);
	};

	const messageText = getMessageTextContent(message);
	const isUser = message.role === "user";
	const showTyping = message.preview || message.streaming;
	const mjstatus = message.mjstatus;
	const actions = mjstatus?.action;

	const onRightClick = (e: any, message: ChatMessage) => {
		if (selectOrCopy(e.currentTarget, messageText)) {
			if (userInput.length === 0) setUserInput(messageText);
			e.preventDefault();
		}
	};

	return (
		<div
			className={isUser ? styles["chat-message-user"] : styles["chat-message"]}
		>
			<div className={styles["chat-message-container"]}>
				<div className="hidden md:block">
					<MessageAvatar
						isUser={isUser}
						userAvatar={session.user?.avatar}
						userNickname={session.user?.nickname}
						agentAvatar={session.mask.image}
						agentName={session.mask.name}
					/>
				</div>

				<div className={styles["chat-message-item"]}>
					{session.mask.type === "roleplay" && !isUser && (
						<div
							className={`${isUser ? styles["user"] + " " + styles["play"] : styles["bot"] + " " + styles["play"]}`}
						>
							<button onClick={() => handlePlayAudio(message)}>
								<PlayIcon />
							</button>
						</div>
					)}

					{showTyping && (
						<div className={styles["chat-message-status"]}>
							{Locale.Chat.Typing}
						</div>
					)}

					{isUser && !message && <Loading3QuartersOutlined spin={true} />}

					{message.toolMessages && (
						<MessageToolContent toolMessages={message.toolMessages} />
					)}

					<MessageContent
						content={messageText}
						isLoading={!!(showTyping && messageText.length === 0 && !isUser)}
						isUser={isUser}
						fontSize={config.fontSize}
						onRightClick={(e) => onRightClick(e, message)}
						onDoubleClick={() => setUserInput(messageText)}
					/>

					{message.fileInfos && (
						<MessageFileContent fileInfos={message.fileInfos} />
					)}

					{getMessageImages(message).length > 0 && (
						<MessageImageContent images={getMessageImages(message)} />
					)}

					{!isUser &&
						mjstatus &&
						actions &&
						actions !== "UPSCALE" &&
						mjstatus.status == "SUCCESS" && (
							<MjActions session={session} taskid={mjstatus.id} />
						)}

					<div className="mt-2 flex items-center gap-2 text-muted-foreground">
						<MessageActions
							showActions={true}
							isStreaming={message.streaming || false}
							isError={message.isError || false}
							isWorkflow={session.isworkflow ?? false}
							onResend={() => handleResend(message)}
							onDelete={() => handleDelete(message.id)}
							onPin={() => handlePinMessage(message)}
							onCopy={() => copyToClipboard(messageText)}
							onNext={() => onNextworkflow(message)}
							onStop={() => handleUserStop(message.id)}
							onPlay={() => handlePlayAudio(message)}
							isRoleplay={session.mask.type === "roleplay"}
							isUser={isUser}
						/>
						<span className="ml-2 hidden text-xs text-muted-foreground md:inline">
							Token: {message.token_counts_total} | {message.date}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MessageItem;
