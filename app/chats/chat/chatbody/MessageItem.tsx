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
import { Loading3QuartersOutlined } from "@ant-design/icons";

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
import {
	ContextPrompts,
	MaskAvatar,
	MaskConfig,
} from "@/app/chats/mask-components";

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

const Markdown = dynamic(
	async () => (await import("../../markdown")).Markdown,
	{
		loading: () => <LoadingIcon />,
	},
);

export const MessageItem: React.FC<MessageItemProps> = ({
	message,
	session,
	i,
	context,
	isMobileScreen,
	clearContextIndex,
	onUserStop,
	onResend,
	onDelete,
	onPinMessage,
	onPlayAudio,
	// 其他属性和方法
}) => {
	// 你的其他逻辑和方法
	const chatStore = useChatStore();
	const userStore = useUserStore();
	const workflowStore = useWorkflowStore();
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

	const sessionId = session.id;
	const isworkflow = session.isworkflow;
	const messages = session.messages;
	const authHook = useAuth();
	const { updateUserInfo } = authHook;
	const router = useRouter();

	const isUser = message.role === "user";
	const mjstatus = message.mjstatus;
	const actions = mjstatus?.action;

	const isContext = i < context.length;
	const showActions =
		i > 0 && !(message.preview || message.content.length === 0) && !isContext;
	const showTyping = message.preview || message.streaming;

	const shouldShowClearContextDivider = i === clearContextIndex - 1;
	const [messageApi, contextHolder] = messagepop.useMessage();

	const [responseState, setResponseState] = useState(session.responseStatus);

	// 采用store 的方式来获取 responseState
	// 在responseState 为 true 时 执行 onNextworkflow
	useEffect(() => {
		console.log("responseState", sessionId, " ", responseState);

		const lastMessage = session.messages.at(-1)?.content ?? "";
		if (responseState && enableAutoFlow) {
			onNextworkflow(lastMessage);
			// 将session 的 responseState 转为false
			chatStore.updateSession(sessionId, () => {
				session.responseStatus = false;
			});
			setResponseState(false);
		}
	}, [responseState]);

	const onNextworkflow = (message: string) => {
		// 点击后将该条 message 传递到下一个 session
		// 找到当前 session 的 ID

		// 找到当前 session 所在的 workflow group
		const workflowGroup = Object.values(workflowStore.workflowGroup).find(
			(group) => group.sessions.includes(sessionId),
		);
		if (!workflowGroup) {
			console.error("当前 session 所在的 workflow group 未找到");
			return;
		}

		// 在当前 workflow group 中找到当前 session 的索引
		const currentSessionIndex = workflowGroup.sessions.indexOf(sessionId);

		// 找到下一个 session 的索引
		const nextSessionIndex = workflowGroup.sessions.findIndex(
			(s, i) => i > currentSessionIndex,
		);

		// 如果找到了下一个 session，则进行相应的操作
		if (nextSessionIndex !== -1) {
			const nextSessionId = workflowGroup.sessions[nextSessionIndex];
			// 这里可以添加代码来处理下一个 session
			console.log("下一个 session 的 ID 是：", nextSessionId);
		} else {
			console.log("没有找到下一个 workflow session");
			return;
		}

		const nextSessionId = workflowGroup.sessions[nextSessionIndex];
		const nextSession = chatStore.sessions.find((s) => s.id === nextSessionId);

		chatStore
			.onUserInput(message, undefined, nextSession)
			.then(() => {
				updateUserInfo(userStore.user.id);
			})
			.catch((error) => {
				messageApi.error(error.message);

				// chatStore.clearAllData();
				if (error.message.includes("登录")) {
					setTimeout(() => {
						authHook.logoutHook();
						router.push("/auth/");
					}, 2000);
				}
			});

		localStorage.setItem(LAST_INPUT_KEY, userInput);
	};

	const onRightClick = (e: any, message: ChatMessage) => {
		if (selectOrCopy(e.currentTarget, message.content)) {
			if (userInput.length === 0) {
				setUserInput(message.content);
			}

			e.preventDefault();
		}
	};

	const renderedUserAvatar = useMemo(() => {
		if (userStore.user.avatar) {
			return <UserAvatar size="large" src={userStore.user.avatar} />;
		} else {
			return (
				<UserAvatar
					style={{ backgroundColor: "rgb(91, 105, 230)" }}
					size="large"
				>
					{userStore.user.nickname}
				</UserAvatar>
			);
		}
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
							<div className={styles["chat-message-edit"]}>
								<IconButton
									icon={<EditIcon />}
									onClick={async () => {
										const newMessage = await showPrompt(
											Locale.Chat.Actions.Edit,
											message.content,
											10,
										);
										chatStore.updateSession(sessionId, () => {
											const m = session.mask.context
												.concat(session.messages)
												.find((m) => m.id === message.id);
											if (m) {
												m.content = newMessage;
											}
										});
									}}
								></IconButton>
							</div>
							{isUser ? renderedUserAvatar : <MaskAvatar mask={session.mask} />}
						</div>

						{showActions && (
							<div className={styles["chat-message-actions"]}>
								<div className={styles["chat-input-actions"]}>
									{message.streaming ? (
										<ChatAction
											text={Locale.Chat.Actions.Stop}
											icon={<StopIcon />}
											onClick={() =>
												onUserStop ? onUserStop(message.id ?? i) : null
											}
										/>
									) : (
										<>
											<ChatAction
												text={Locale.Chat.Actions.Retry}
												icon={<ResetIcon />}
												onClick={() => (onResend ? onResend(message) : null)}
											/>
											<ChatAction
												text={Locale.Chat.Actions.Delete}
												icon={<DeleteIcon />}
												onClick={() =>
													onDelete ? onDelete(message.id ?? i) : null
												}
											/>
											<ChatAction
												text={Locale.Chat.Actions.Pin}
												icon={<PinIcon />}
												onClick={() =>
													onPinMessage ? onPinMessage(message) : null
												}
											/>
											<ChatAction
												text={Locale.Chat.Actions.Copy}
												icon={<CopyIcon />}
												onClick={() => copyToClipboard(message.content)}
											/>
											{/* next icon */}
											{isworkflow && (
												<ChatAction
													text={Locale.Chat.Actions.Next}
													icon={<NextIcon />}
													onClick={() => onNextworkflow(message.content)}
												/>
											)}
										</>
									)}
								</div>
							</div>
						)}
					</div>
					{!isUser &&
						message.toolMessages &&
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
						{/* 只有等于roleplay 时才展示playicon */}
						{session.mask.type === "roleplay" && !isUser && (
							<div
								className={`${
									isUser
										? styles["user"] + " " + styles["play"]
										: styles["bot"] + " " + styles["play"]
								}`}
							>
								<button
									onClick={() => (onPlayAudio ? onPlayAudio(message) : null)}
								>
									<PlayIcon></PlayIcon>
								</button>
							</div>
						)}
						{isUser && !message && <Loading3QuartersOutlined spin={true} />}
						<Markdown
							imageBase64={message.image_url}
							content={message.content}
							loading={
								(message.preview || message.streaming) &&
								message.content.length === 0 &&
								!isUser
							}
							onContextMenu={(e) => onRightClick(e, message)}
							onDoubleClickCapture={() => {
								if (!isMobileScreen) return;
								setUserInput(message.content);
							}}
							fontSize={fontSize}
							parentRef={scrollRef}
							defaultShow={i >= messages.length - 6}
						/>
						{/* 显示4个按钮, 分别是放大: 左上,右上,左下,右下 */}
						{!isUser &&
							mjstatus &&
							actions &&
							actions !== "UPSCALE" &&
							mjstatus.status == "SUCCESS" && (
								<MjActions session={session} taskid={mjstatus.id} />
							)}
					</div>

					<div className={styles["chat-message-action-date"]}>
						{isContext ? Locale.Chat.IsContext : message.date.toLocaleString()}
					</div>
				</div>
			</div>
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

	const isUser = message.role === "user";
	const showTyping = message.preview || message.streaming;

	const [messageApi, contextHolder] = messagepop.useMessage();

	const onRightClick = (e: any, message: ChatMessage) => {
		if (selectOrCopy(e.currentTarget, message.content)) {
			if (userInput.length === 0) {
				setUserInput(message.content);
			}

			e.preventDefault();
		}
	};

	const renderedUserAvatar = useMemo(() => {
		if (userStore.user.avatar) {
			return <UserAvatar size="large" src={userStore.user.avatar} />;
		} else {
			return (
				<UserAvatar
					style={{ backgroundColor: "rgb(91, 105, 230)" }}
					size="large"
				>
					{userStore.user.nickname}
				</UserAvatar>
			);
		}
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
							{/* {isUser ? renderedUserAvatar : <MaskAvatar mask={session.mask} />} */}
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
							imageBase64={message.image_url}
							content={message.content}
							loading={
								(message.preview || message.streaming) &&
								message.content.length === 0 &&
								!isUser
							}
							onContextMenu={(e) => onRightClick(e, message)}
							onDoubleClickCapture={() => {
								if (!isMobileScreen) return;
								setUserInput(message.content);
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
