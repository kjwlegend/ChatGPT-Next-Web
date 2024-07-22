// 第三方库的导入
import React, {
	useMemo,
	Fragment,
	useContext,
	useEffect,
	useState,
	useRef,
} from "react";
import { useRouter } from "next/navigation";

import { Avatar as UserAvatar, message as messagepop } from "antd";
import { Loading3QuartersOutlined, ToolOutlined } from "@ant-design/icons";

// 全局状态管理和上下文
import { useAppConfig } from "@/app/store";
import { useChatStore, useUserStore } from "@/app/store";
import { ChatMessage, ChatSession } from "@/app/types/chat";
import { ChatContext } from "../main";
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
import { ClearContextDivider } from "../chat-controller";
import MjActions from "../midjourney";
import { RenderMessage } from "./MessageList";
import { copyToClipboard, selectOrCopy, useMobileScreen } from "@/app/utils";
import { ChatAction } from "../Inputpanel";
import { MaskAvatar } from "@/app/chats/components/mask-modal";
import { Avatar } from "../../components/avatar";

// 常量
import Locale from "@/app/locales";
import { LAST_INPUT_KEY } from "@/app/constant";

// 样式
import styles from "../chats.module.scss";
import { DoubleAgentChatSession } from "@/app/store/doubleAgents";
import { useWorkflowStore } from "@/app/store/workflow";
interface MessageItemProps {
	message: ChatMessage;
	session: ChatSession;
	i: number;
	context: RenderMessage[];
	isMobileScreen: boolean;
	clearContextIndex: number;
	onUserStop?: (messageId: string) => void;
	onResend?: (message: ChatMessage) => void;
	onDelete?: (messageId: string) => void;
	onPinMessage?: (message: ChatMessage) => void;
	onPlayAudio?: (message: ChatMessage) => void;
}

import { getMessageImages, getMessageTextContent } from "@/app/utils";
import IconTooltipButton from "../../components/iconButton";

const Markdown = dynamic(
	async () => (await import("../../components/markdown")).Markdown,
	{
		loading: () => <LoadingIcon />,
	},
);

export const MessageItem: React.FC<MessageItemProps> = ({
	message,
	session,
	i,
	context,
	clearContextIndex,
	isMobileScreen,
	onUserStop,
	onResend,
	onDelete,
	onPinMessage,
	onPlayAudio,
}) => {
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

	const chatStore = useChatStore();
	const userStore = useUserStore();
	const workflowStore = useWorkflowStore();
	const config = useAppConfig();
	const fontSize = config.fontSize;
	const router = useRouter();

	const sessionId = session.id;
	const isworkflow = session.isworkflow;
	const messages = session.messages;
	const authHook = useAuth();
	const { updateUserInfo } = authHook;

	const messageText = getMessageTextContent(message);
	const messageImages = getMessageImages(message);
	const isUser = message.role === "user";
	const mjstatus = message.mjstatus;
	const actions = mjstatus?.action;
	const isContext = i < context.length;
	const showActions =
		i > 0 && !(message.preview || messageText.length === 0) && !isContext;
	const showTyping = message.preview || message.streaming;
	const shouldShowClearContextDivider = i === clearContextIndex - 1;

	const [messageApi, contextHolder] = messagepop.useMessage();

	useEffect(() => {
		if (
			enableAutoFlow &&
			message.isFinished &&
			message.isTransfered == false &&
			!isUser &&
			messageText !== ""
		) {
			onNextworkflow(messageText);
			chatStore.updateSession(sessionId, () => {
				session.responseStatus = false;
				message.isTransfered = true;
			});
		}
	}, [message.isFinished]);

	/**
	 * @description: 下一个工作流
	 */
	const onNextworkflow = (message: string) => {
		const workflowGroup = Object.values(workflowStore.workflowGroup).find(
			(group) => group.sessions.includes(sessionId),
		);
		if (!workflowGroup) {
			console.error("当前 session 所在的 workflow group 未找到");
			return;
		}

		const currentSessionIndex = workflowGroup.sessions.indexOf(sessionId);
		const nextSessionIndex = workflowGroup.sessions.findIndex(
			(s, i) => i > currentSessionIndex,
		);

		if (nextSessionIndex !== -1) {
			const nextSessionId = workflowGroup.sessions[nextSessionIndex];
			console.log("下一个 session 的 ID 是：", nextSessionId);
		} else {
			console.log("没有找到下一个 workflow session");
			return;
		}

		const nextSessionId = workflowGroup.sessions[nextSessionIndex];
		const nextSession = chatStore.sessions.find((s) => s.id === nextSessionId);

		chatStore
			.onUserInput(message, undefined, undefined, nextSession)
			.then(() => updateUserInfo(userStore.user.id))
			.catch((error) => {
				messageApi.error(error.message);

				if (error.message.includes("登录")) {
					setTimeout(() => {
						authHook.logoutHook();
						router.push("/auth/");
					}, 2000);
				}
			});

		localStorage.setItem(LAST_INPUT_KEY, userInput);
	};

	/**
	 * @description: 消息右键点击事件
	 */
	const onRightClick = (e: any, message: ChatMessage) => {
		if (selectOrCopy(e.currentTarget, messageText)) {
			if (userInput.length === 0) setUserInput(messageText);
			e.preventDefault();
		}
	};

	/**
	 * @description: 渲染用户头像
	 */
	const RenderedUserAvatar = useMemo(() => {
		return (
			<Avatar
				avatar={userStore.user.avatar}
				nickname={userStore.user.nickname}
			/>
		);
	}, [userStore.user.avatar, userStore.user.nickname]);

	/**
	 * @description: 渲染消息操作按钮
	 */
	const RenderMessageActions = useMemo(() => {
		if (!showActions || message.streaming || message.isError) return null;

		return (
			<div>
				<IconTooltipButton
					text={Locale.Chat.Actions.Retry}
					icon={<ResetIcon />}
					onClick={() => (onResend ? onResend(message) : null)}
					tooltipProps={{}}
					shape="circle"
				/>

				<IconTooltipButton
					text={Locale.Chat.Actions.Delete}
					icon={<DeleteIcon />}
					onClick={() => (onDelete ? onDelete(message.id ?? i) : null)}
					tooltipProps={{}}
					shape="circle"
				/>

				<IconTooltipButton
					text={Locale.Chat.Actions.Pin}
					icon={<PinIcon />}
					onClick={() => (onPinMessage ? onPinMessage(message) : null)}
					tooltipProps={{}}
					shape="circle"
				/>

				<IconTooltipButton
					text={Locale.Chat.Actions.Copy}
					icon={<CopyIcon />}
					onClick={() => copyToClipboard(messageText)}
					tooltipProps={{}}
					shape="circle"
				/>

				{/* next icon */}
				{isworkflow && (
					<ChatAction
						text={Locale.Chat.Actions.Next}
						icon={<NextIcon />}
						onClick={() => onNextworkflow(messageText)}
					/>
				)}
			</div>
		);
	}, [showActions, isUser, message.streaming, message.isError]);

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
							{isUser ? RenderedUserAvatar : <MaskAvatar mask={session.mask} />}
						</div>
					</div>

					{/* 消息内容 */}
					<div className={styles["chat-message-item"]}>
						{/* 播放按钮 */}
						{session.mask.type === "roleplay" && !isUser && (
							<div
								className={`${isUser ? styles["user"] + " " + styles["play"] : styles["bot"] + " " + styles["play"]}`}
							>
								<button
									onClick={() => (onPlayAudio ? onPlayAudio(message) : null)}
								>
									<PlayIcon></PlayIcon>
								</button>
							</div>
						)}
						{/* 显示打字状态 */}
						{showTyping && (
							<div className={styles["chat-message-status"]}>
								{Locale.Chat.Typing}
							</div>
						)}
						{/* 用户消息加载状态 */}
						{isUser && !message && <Loading3QuartersOutlined spin={true} />}

						{message.toolMessages && message.toolMessages.length > 0 && (
							<div className={styles["chat-tool-message-container"]}>
								<span>
									{" "}
									<ToolOutlined style={{ marginRight: 5 }} />
									插件调用
								</span>
								{message.toolMessages.map((tool, index) => (
									<div
										className={styles["chat-message-tools-status"]}
										key={index}
									>
										<div className={styles["chat-message-tools-name"]}>
											<CheckmarkIcon
												className={styles["chat-message-checkmark"]}
											/>
											{tool.toolName}:
											<code className={styles["chat-message-tools-details"]}>
												{tool.toolInput}
											</code>
										</div>
									</div>
								))}
							</div>
						)}
						{/* Markdown 渲染消息内容 */}
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
							defaultShow={i >= messages.length - 6}
						/>

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
								{message.fileInfos.map((fileInfo, index) => {
									return (
										<a
											key={index}
											href={fileInfo.filePath}
											className={styles["chat-message-item-file"]}
											target="_blank"
										>
											{fileInfo.originalFilename}
										</a>
									);
								})}
							</nav>
						)}

						{/* 单张图片展示 */}
						{getMessageImages(message).length == 1 && (
							<img
								className={styles["chat-message-item-image"]}
								src={getMessageImages(message)[0]}
								alt=""
							/>
						)}

						{/* 多张图片展示 */}
						{getMessageImages(message).length > 1 && (
							<div
								className={styles["chat-message-item-images"]}
								style={
									{
										"--image-count": getMessageImages(message).length,
									} as React.CSSProperties
								}
							>
								{getMessageImages(message).map((image, index) => {
									return (
										<img
											className={styles["chat-message-item-image-multi"]}
											key={index}
											src={image}
											alt=""
										/>
									);
								})}
							</div>
						)}

						{/* Midjourney 操作按钮 */}
						{!isUser &&
							mjstatus &&
							actions &&
							actions !== "UPSCALE" &&
							mjstatus.status == "SUCCESS" && (
								<MjActions session={session} taskid={mjstatus.id} />
							)}
						{/* 消息操作按钮和日期显示 */}
						<div className={styles["chat-message-actions"]}>
							<div className={styles["chat-input-actions"]}>
								{message.streaming ? (
									<ChatAction
										text={Locale.Chat.Actions.Stop}
										icon={<StopIcon />}
										onClick={() =>
											onUserStop
												? onUserStop(message.nanoid ?? message.id)
												: null
										}
									/>
								) : (
									RenderMessageActions
								)}
							</div>
							<div className={styles["chat-message-notes"]}>
								<div>
									Token counts: {message.token_counts_total} |{" "}
									{isContext ? Locale.Chat.IsContext : message.date} |
									messageid: {message.id}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* 清除上下文分隔线 */}
			{shouldShowClearContextDivider && (
				<ClearContextDivider sessionId={sessionId} />
			)}
		</Fragment>
	);
};

export const AgentMessageItem: React.FC<MessageItemProps> = ({
	message,
	session,
	i,
	context,
	isMobileScreen,
	clearContextIndex,

	// 其他属性和方法
}) => {
	// 你的其他逻辑和方法
	const chatStore = useChatStore();
	const userStore = useUserStore();
	const config = useAppConfig();
	const fontSize = config.fontSize;
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

	const authHook = useAuth();
	const { updateUserInfo } = authHook;

	const messageText = getMessageTextContent(message);
	const isUser = message.role === "user";
	const showTyping = message.preview || message.streaming;

	const onRightClick = (e: any, message: ChatMessage) => {
		if (selectOrCopy(e.currentTarget, messageText)) {
			if (userInput.length === 0) {
				setUserInput(messageText);
			}

			e.preventDefault();
		}
	};

	const RenderedUserAvatar = useMemo(() => {
		return (
			<Avatar
				avatar={userStore.user.avatar}
				nickname={userStore.user.nickname}
			/>
		);
	}, [userStore.user.avatar, userStore.user.nickname]);

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
							{/* {isUser ? RenderedUserAvatar : <MaskAvatar mask={session.mask} />} */}
						</div>
					</div>

					<div className={styles["chat-message-item"]}>
						{isUser && !message && <Loading3QuartersOutlined spin={true} />}
						{showTyping && (
							<div className={styles["chat-message-status"]}>
								{Locale.Chat.Typing}
							</div>
						)}
						<div className={styles["chat-tool-message-container"]}>
							{message.toolMessages &&
								message.toolMessages.map((tool, index) => (
									<div
										className={styles["chat-message-tools-status"]}
										key={index}
									>
										<div className={styles["chat-message-tools-name"]}>
											<CheckmarkIcon
												className={styles["chat-message-checkmark"]}
											/>
											{tool.toolName}:
											<code className={styles["chat-message-tools-details"]}>
												{tool.toolInput}
											</code>
										</div>
									</div>
								))}
						</div>
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
						{message.fileInfos && message.fileInfos.length > 0 && (
							<nav
								className={styles["chat-message-item-files"]}
								style={
									{
										"--file-count": message.fileInfos.length,
									} as React.CSSProperties
								}
							>
								{message.fileInfos.map((fileInfo, index) => {
									return (
										<a
											key={index}
											href={fileInfo.filePath}
											className={styles["chat-message-item-file"]}
											target="_blank"
										>
											{fileInfo.originalFilename}
										</a>
									);
								})}
							</nav>
						)}
						{getMessageImages(message).length == 1 && (
							<img
								className={styles["chat-message-item-image"]}
								src={getMessageImages(message)[0]}
								alt=""
							/>
						)}
						{getMessageImages(message).length > 1 && (
							<div
								className={styles["chat-message-item-images"]}
								style={
									{
										"--image-count": getMessageImages(message).length,
									} as React.CSSProperties
								}
							>
								{getMessageImages(message).map((image, index) => {
									return (
										<img
											className={styles["chat-message-item-image-multi"]}
											key={index}
											src={image}
											alt=""
										/>
									);
								})}
							</div>
						)}
					</div>

					<div className={styles["chat-message-notes"]}>
						{Locale.Chat.IsContext ?? message.date.toLocaleString()}
					</div>
				</div>
			</div>
		</Fragment>
	);
};
