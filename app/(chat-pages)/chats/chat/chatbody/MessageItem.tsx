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
import dynamic from "next/dynamic";

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
import { useUserStore } from "@/app/store";
import { useChatStore } from "@/app/store/chat/index";
import { ChatMessage, ChatSession } from "@/app/types/chat";

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
import Avatar from "@/app/components/avatar";

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
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
	ExternalLink,
	ChevronDown,
	ChevronUp,
	Code,
	Search,
	Database,
} from "lucide-react";

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
			/>
		);
	}, [userStore.user.avatar, userStore.user.nickname]);

	// 渲染agent 头像
	/**
	 * @description: 渲染agent头像
	 */
	const RenderedAgentAvatar = useMemo(() => {
		return <Avatar avatar={session.mask.image} nickname={session.mask.name} />;
	}, [session.mask.image, session.mask.name]);

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

	// 工具图标映射
	const ToolIcon = ({
		toolName,
		className,
	}: {
		toolName: string;
		className?: string;
	}) => {
		const defaultClassName = "h-4 w-4";
		const finalClassName = className || defaultClassName;

		switch (toolName) {
			case "web-search":
			case "google-search":
			case "搜索引擎":
				return <Search className={finalClassName} />;
			case "code-generator":
				return <Code className={finalClassName} />;
			case "vector-store":
				return <Database className={finalClassName} />;
			default:
				return <ToolOutlined className={finalClassName} />;
		}
	};

	// 工具消息组件
	const ToolMessage = ({ tool }: { tool: any }) => {
		const [isExpanded, setIsExpanded] = useState(false);
		const [showFullTitle, setShowFullTitle] = useState<Record<number, boolean>>(
			{},
		);

		const toggleTitleExpand = (index: number) => {
			setShowFullTitle((prev) => ({
				...prev,
				[index]: !prev[index],
			}));
		};

		return (
			<Card className="my-2 border border-secondary/10 bg-gradient-to-b from-secondary/5 to-secondary/10 p-2 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md">
				{/* 工具标题栏 */}
				<div className="mb-1 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="rounded-lg bg-primary/10 p-1">
							<ToolIcon
								toolName={tool.toolName}
								className="h-3 w-3 text-primary/80"
							/>
						</div>
						<div className="flex flex-row items-center gap-1">
							<span className="text-sm font-medium text-secondary-foreground">
								{tool.toolName}
							</span>
							<span className="text-xs text-muted-foreground">
								{tool.toolInput}
							</span>
						</div>
					</div>
					<button
						onClick={() => setIsExpanded(!isExpanded)}
						className="rounded-full p-1.5 transition-all duration-200 hover:scale-105 hover:bg-secondary/20 active:scale-95"
					>
						{isExpanded ? (
							<ChevronUp className="h-4 w-4 text-muted-foreground" />
						) : (
							<ChevronDown className="h-4 w-4 text-muted-foreground" />
						)}
					</button>
				</div>

				{/* 展开的引用内容 */}
				{isExpanded && tool.references && tool.references.length > 0 && (
					<div className="mt-2 space-y-1">
						{tool.references.map((ref: any, index: number) => (
							<div
								key={index}
								className="group relative rounded-lg border border-secondary/10 bg-background/50 p-2 transition-all duration-200 hover:bg-secondary/5 hover:shadow-sm"
							>
								<div className="flex items-center gap-3">
									<Badge
										variant="outline"
										className="shrink-0 bg-primary/5 text-xs font-normal"
									>
										{index + 1}
									</Badge>
									<div className="min-w-0 flex-1">
										{" "}
										{/* 防止长标题溢出 */}
										{ref.title && (
											<div
												className={`${
													!showFullTitle[index] ? "line-clamp-1" : ""
												} cursor-pointer text-xs font-medium transition-colors hover:text-primary`}
												onClick={() => toggleTitleExpand(index)}
											>
												{ref.title}
											</div>
										)}
										<a
											href={ref.url}
											target="_blank"
											rel="noopener noreferrer"
											className="mt-1 inline-flex w-full items-center gap-1.5 truncate text-xs text-muted-foreground transition-colors hover:text-primary group-hover:underline"
										>
											<ExternalLink className="h-3 w-3" />
											<span className="truncate">{ref.url}</span>
										</a>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</Card>
		);
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
							<div className="mb-2 space-y-3">
								{message.toolMessages.map((tool, index) => (
									<ToolMessage key={index} tool={tool} />
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
							<div className="mt-3 space-y-1.5">
								{message.fileInfos.map((fileInfo, index) => {
									const fileIcon = getFileIcon(fileInfo.fileName);

									return (
										<div
											key={index}
											className="group flex items-center gap-2 rounded-md border border-secondary/5 bg-gradient-to-r from-secondary/5 to-primary/5 p-1.5 text-xs text-muted-foreground"
										>
											<div className="flex h-5 w-5 items-center justify-center rounded bg-secondary/10">
												{fileIcon}
											</div>

											<div className="min-w-0 flex-1">
												<div className="truncate font-medium">
													{fileInfo.originalFilename}
												</div>
											</div>
										</div>
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
									Token: {message.token_counts_total} | {message.date} |
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

export default MessageItem;
