// 第三方库的导入
import React, {
	useMemo,
	Fragment,
	useContext,
	useEffect,
	useState,
	useRef,
	memo,
} from "react";
import { useRouter } from "next/navigation";

import { message as messagepop } from "antd";
import {
	FileExcelFilled,
	FileFilled,
	FilePdfFilled,
	Loading3QuartersOutlined,
	ToolOutlined,
} from "@ant-design/icons";

// 全局状态管理和上下文
import { useAppConfig } from "@/app/store";
import { useChatStore, useUserStore } from "@/app/store";
import { ChatMessage, ChatSession } from "@/app/types/chat";
import dynamic from "next/dynamic";

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
import { ClearContextDivider } from "../../../../hooks/useGeneralChatHook";
import MjActions from "../midjourney";
import { RenderMessage } from "./MessageList";
import { copyToClipboard, selectOrCopy } from "@/app/utils";
import { ChatAction } from "../inputpanel/components/chatactions";
import { Avatar } from "@/app/components/avatar";

// 常量
import Locale from "@/app/locales";
import { LAST_INPUT_KEY } from "@/app/constant";

// 样式
import styles from "@/app/(chat-pages)/chats/chat/chats.module.scss";
import { MultiAgentChatSession } from "@/app/store/multiagents";
import { useWorkflowStore } from "@/app/store/workflow";
interface MessageItemProps {
	message: ChatMessage;
	i: number;
}

import { getMessageImages, getMessageTextContent } from "@/app/utils";
import IconTooltipButton from "@/app/components/iconButton";
import { useMessages, useSessions } from "../hooks/useChatContext";
import { useMessageActions } from "./useMessageActions";

const Markdown = dynamic(
	async () => (await import("@/app/components/markdown")).Markdown,
	{
		loading: () => <LoadingIcon />,
	},
);

const getFileIcon = (filePath: string) => {
	const extension = filePath.split(".").pop()?.toLowerCase();
	switch (extension) {
		case "pdf":
			return <FilePdfFilled />; // 假设有一个 PdfIcon 组件
		case "doc":
		case "docx":
		case "md":
		case "txt":
			return <FileFilled />; // 假设有一个 DocIcon 组件
		case "xls":
		case "xlsx":
			return <FileExcelFilled />; // 假设有一个 ExcelIcon 组件
		default:
			return <FileFilled />; // 默认文件图标
	}
};

const MessageItem: React.FC<MessageItemProps> = ({ message, i }) => {
	const [userInput, setUserInput] = useState("");
	const [enableAutoFlow, setEnableAutoFlow] = useState(false);
	const [showToastModal, setshowToastModal] = useState(false);

	const chatStore = useChatStore.getState();
	const userStore = useUserStore.getState();
	const workflowStore = useWorkflowStore.getState();
	const session = useSessions();
	const sessionId = session.id;
	const config = useAppConfig();
	const fontSize = config.fontSize;
	const router = useRouter();

	const isworkflow = session.isworkflow;
	// const messages = useMessages();

	const messageText = getMessageTextContent(message);
	const messageImages = getMessageImages(message);
	const isUser = message.role === "user";
	const mjstatus = message.mjstatus;
	const actions = mjstatus?.action;
	// const isContext = i < context.length;
	const showActions = true;
	const showTyping = message.preview || message.streaming;
	// const shouldShowClearContextDivider = i === messages.length - 1;

	const [messageApi, contextHolder] = messagepop.useMessage();

	const {
		handleUserStop,
		handleDelete,
		handlePinMessage,
		handleResend,
		handlePlayAudio,
	} = useMessageActions(session, setshowToastModal);

	/**
	 * @description: 下一个工作流
	 */
	const onNextworkflow = (message: ChatMessage) => {
		workflowStore.sendMessagetoNextSession(sessionId, message);
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
				size={38}
			/>
		);
	}, [userStore.user.avatar, userStore.user.nickname]);

	// 渲染agent 头像
	/**
	 * @description: 渲染agent头像
	 */
	const RenderedAgentAvatar = useMemo(() => {
		return (
			<Avatar
				avatar={session.mask.avatar}
				nickname={session.mask.name}
				size={38}
			/>
		);
	}, [session.mask.avatar, session.mask.name]);

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
					onClick={() => handleResend(message)}
					tooltipProps={{}}
					shape="circle"
				/>

				<IconTooltipButton
					text={Locale.Chat.Actions.Delete}
					icon={<DeleteIcon />}
					onClick={() => handleDelete(message.id)}
					tooltipProps={{}}
					shape="circle"
				/>

				<IconTooltipButton
					text={Locale.Chat.Actions.Pin}
					icon={<PinIcon />}
					onClick={() => handlePinMessage(message)}
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
				{isworkflow && (
					<IconTooltipButton
						text={Locale.Chat.Actions.Next}
						icon={<NextIcon />}
						onClick={() => onNextworkflow(message)}
						tooltipProps={{}}
						shape="circle"
						className={styles["action-buttons"]}
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
							{isUser ? RenderedUserAvatar : RenderedAgentAvatar}
						</div>
					</div>

					{/* 消息内容 */}
					<div className={styles["chat-message-item"]}>
						{/* 播放按钮 */}
						{session.mask.type === "roleplay" && !isUser && (
							<div
								className={`${isUser ? styles["user"] + " " + styles["play"] : styles["bot"] + " " + styles["play"]}`}
							>
								<button onClick={() => handlePlayAudio(message)}>
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
								setUserInput(messageText);
							}}
							fontSize={fontSize}
						/>

						{/* 文件信息展示 */}
						{message.fileInfos && message.fileInfos.length > 0 && (
							<div
								className={styles["chat-message-item-files"]}
								style={
									{
										"--file-count": message.fileInfos.length,
									} as React.CSSProperties
								}
							>
								{message.fileInfos.map((fileInfo, index) => {
									// 根据文件类型选择图标

									const fileIcon = getFileIcon(fileInfo.fileName); // 假设有一个函数来获取图标

									return (
										<p key={index} className={styles["chat-message-item-file"]}>
											{fileIcon} {/* 显示文件图标 */}
											{fileInfo.originalFilename}
										</p>
									);
								})}
							</div>
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
										onClick={() => handleUserStop(message.id)}
									/>
								) : (
									RenderMessageActions
								)}
							</div>
							<div className={styles["chat-message-notes"]}>
								<div>
									Token counts: {message.token_counts_total} | {message.date} |
									messageid: {message.id}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* 清除上下文分隔线
			{shouldShowClearContextDivider && (
				<ClearContextDivider sessionId={sessionId} />
			)} */}
		</Fragment>
	);
};

const compareRerender = (
	prevProps: MessageItemProps,
	nextProps: MessageItemProps,
) => {
	const previousMessagesConntent = prevProps.message.content;
	const nextMessagesConntent = nextProps.message.content;
	const compareMessage =
		prevProps.message.content === nextProps.message.content &&
		prevProps.message.date === nextProps.message.date &&
		prevProps.message.id === nextProps.message.id &&
		prevProps.message.role === nextProps.message.role &&
		prevProps.message.lastUpdateTime === nextProps.message.lastUpdateTime;

	return compareMessage;
};
// export default memo(MessageItem, compareRerender);

export default MessageItem;
