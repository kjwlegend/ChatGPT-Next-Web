// 第三方库的导入
import React, { useMemo, Fragment, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";

import { message as messagepop } from "antd";
import { Loading3QuartersOutlined } from "@ant-design/icons";

// 全局状态管理和上下文
import { useAppConfig } from "@/app/store";
import { useChatStore, useUserStore } from "@/app/store";

import { ChatSession, Mask, ChatMessage, ChatToolMessage } from "@/app//types/";

import { ChatContext } from "@/app/(chat-pages)/chats/chat/main";
import useAuth from "@/app/hooks/useAuth";
import dynamic from "next/dynamic";

// UI组件和图标
import { IconButton } from "@/app/components/button";
import {
	List,
	ListItem,
	Modal,
	Selector,
	showConfirm,
	showPrompt,
	showToast,
} from "@/app/components/ui-lib";
import {
	EditIcon,
	StopIcon,
	ResetIcon,
	DeleteIcon,
	PinIcon,
	CopyIcon,
	NextIcon,
	CheckmarkIcon,
	PlayIcon,
	LoadingIcon,
} from "@/app/icons";

// 自定义组件和工具函数

import { RenderMessage } from "./messageList";
import {
	copyToClipboard,
	getMessageTextContent,
	selectOrCopy,
	useMobileScreen,
} from "@/app/utils";
import {
	ContextPrompts,
	MaskAvatar,
	MaskConfig,
} from "@/app/(chat-pages)/chats/components/mask-modal";

import { Avatar } from "antd";

// 常量
import Locale from "@/app/locales";
import { LAST_INPUT_KEY } from "@/app/constant";

// 样式
import styles from "@/app/(chat-pages)/chats/chat/chats.module.scss";
import { DoubleAgentChatSession } from "@/app/store/doubleAgents";
import { useDoubleAgentChatContext } from "../doubleAgentContext";
interface MessageItemProps {
	message: ChatMessage;
	session: ChatSession;
	i: number;
	context: RenderMessage[];
	isMobileScreen: boolean;
	clearContextIndex: number;
	agentNum?: number | undefined;
	onUserStop?: (messageId: string) => void;
	onResend?: (message: ChatMessage) => void;
	onDelete?: (messageId: string) => void;
	onPinMessage?: (message: ChatMessage) => void;
	onPlayAudio?: (message: ChatMessage) => void;
}

const Markdown = dynamic(
	async () =>
		(await import("@/app/(chat-pages)/chats/components/markdown")).Markdown,
	{
		loading: () => <LoadingIcon />,
	},
);

export const AgentMessageItem: React.FC<MessageItemProps> = ({
	message,
	session,
	i,
	context,
	isMobileScreen,
	clearContextIndex,
	agentNum = 0,

	// 其他属性和方法
}) => {
	const config = useAppConfig();
	const fontSize = config.fontSize;
	const user = useUserStore().user;
	const {
		hitBottom,
		setHitBottom,
		showPromptModal,
		setShowPromptModal,
		userInput,
		setUserInput,
		enableAutoFlow,
		setEnableAutoFlow,
		scrollRef,
		userImage,
		setUserImage,
	} = useContext(ChatContext);

	const { conversation } = useDoubleAgentChatContext();

	const authHook = useAuth();
	const { updateUserInfo } = authHook;

	const isUser = message.role === "user";

	const showTyping = message.preview || message.streaming;

	const [messageApi, contextHolder] = messagepop.useMessage();

	const messageText = getMessageTextContent(message);

	const onRightClick = (e: any, message: ChatMessage) => {
		const messageText = getMessageTextContent(message);
		if (selectOrCopy(e.currentTarget, messageText)) {
			if (userInput.length === 0) {
				setUserInput(messageText);
			}

			e.preventDefault();
		}
	};

	return (
		<Fragment key={message.id}>
			{/* 消息容器 */}
			<div
				className={
					isUser ? styles["chat-message-user"] : styles["chat-message"]
				}
			>
				<div className={styles["chat-message-container"]}>
					<div className={styles["chat-message-header"]}>
						<div className={styles["chat-message-avatar"]}>
							{agentNum == 1 ? (
								<MaskAvatar mask={conversation.firstAIConfig} />
							) : agentNum == 2 ? (
								<MaskAvatar mask={conversation.secondAIConfig} />
							) : (
								<Avatar style={{ backgroundColor: "#9341e2" }}>
									{user.nickname}
								</Avatar>
							)}
						</div>
					</div>
					{message.toolMessages &&
						message.toolMessages.map((tool, index) => (
							<div className={styles["chat-message-tools-status"]} key={index}>
								<div className={styles["chat-message-tools-name"]}>
									<CheckmarkIcon className={styles["chat-message-checkmark"]} />
									{tool.toolName}:
									<code className={styles["chat-message-tools-details"]}>
										{tool.toolInput}
									</code>
								</div>
							</div>
						))}

					{showTyping && (
						<div className={styles["chat-message-status"]}>
							{Locale.Chat.Typing}
						</div>
					)}
					<div className={styles["chat-message-item"]}>
						{isUser && !message && <Loading3QuartersOutlined spin={true} />}
						<Markdown
							content={messageText}
							loading={
								(message.preview || message.streaming) &&
								messageText.length === 0 &&
								!isUser
							}
							onContextMenu={(e) => onRightClick(e, message)}
							onDoubleClickCapture={() => {
								if (!isMobileScreen) return;
								setUserInput(messageText);
							}}
							fontSize={fontSize}
							parentRef={scrollRef}
							defaultShow={true}
						/>
					</div>

					<div className={styles["chat-message-action-date"]}>
						{Locale.Chat.IsContext ?? message.date.toLocaleString()}
					</div>
				</div>
			</div>
		</Fragment>
	);
};
