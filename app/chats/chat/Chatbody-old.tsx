"use client";
import { useDebouncedCallback } from "use-debounce";
import React, {
	useState,
	useRef,
	useEffect,
	useMemo,
	useCallback,
	Fragment,
	useContext,
} from "react";

import { getISOLang, getLang } from "@/app/locales";

import CopyIcon from "@/app/icons/copy.svg";
import LoadingIcon from "@/app/icons/three-dots.svg";
import ResetIcon from "@/app/icons/reload.svg";
import DeleteIcon from "@/app/icons/clear.svg";
import PinIcon from "@/app/icons/pin.svg";
import EditIcon from "@/app/icons/rename.svg";
import StopIcon from "@/app/icons/pause.svg";
import PlayIcon from "@/app/icons/play.svg";
import CheckmarkIcon from "@/app/icons/checkmark.svg";
import NextIcon from "@/app/icons/next.svg";

import {
	ChatMessage,
	useChatStore,
	BOT_HELLO,
	createMessage,
	useAccessStore,
	useAppConfig,
	DEFAULT_TOPIC,
	ModelType,
	useUserStore,
} from "@/app/store";

import { copyToClipboard, selectOrCopy, useMobileScreen } from "@/app/utils";

import dynamic from "next/dynamic";

import { ChatControllerPool } from "@/app/client/controller";
import { Prompt, usePromptStore } from "@/app/store/prompt";
import Locale from "@/app/locales";

import { IconButton } from "@/app/components/button";
import { Button } from "antd";
import { MjActions, MJPanel } from "./midjourney";
import styles from "./chats.module.scss";

import { Loading3QuartersOutlined } from "@ant-design/icons";

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
	CHAT_PAGE_SIZE,
	LAST_INPUT_KEY,
	MAX_RENDER_MSG_COUNT,
	Path,
	REQUEST_TIMEOUT_MS,
} from "@/app/constant";
import { Avatar } from "@/app/components/emoji";
import { Avatar as UserAvatar } from "antd";
import {
	ContextPrompts,
	MaskAvatar,
	MaskConfig,
} from "@/app/chats/mask-components";

import { useAuthStore } from "@/app/store/auth";

import { ChatContext } from "./main";

import { ChatActions, ChatAction } from "./Inputpanel";
import {
	useSubmitHandler,
	useScrollToBottom,
	ClearContextDivider,
} from "./chat-controller";

import { CreateChatData, createChat } from "@/app/api/backend/chat";

import { ChatSession } from "@/app/store";
import { message } from "antd";
import useAuth from "@/app/hooks/useAuth";
import { ChatData } from "@/app/api/backend/chat";
import { getChat } from "@/app/api/backend/chat";
import { UpdateChatMessages } from "@/app/services/chatService";
import { useRouter } from "next/navigation";
import { FloatButton } from "antd";
import { UnorderedListOutlined } from "@ant-design/icons";
import { MJFloatButton } from "./midjourney";

const Markdown = dynamic(async () => (await import("../markdown")).Markdown, {
	loading: () => <LoadingIcon />,
});

type RenderMessage = ChatMessage & { preview?: boolean };

export function Chatbody(props: {
	_session?: ChatSession;
	index?: number;
	isworkflow?: boolean;
}) {
	const chatStore = useChatStore();
	const userStore = useUserStore();
	const authHook = useAuth();
	const router = useRouter();
	const { updateUserInfo } = authHook;

	const { _session, index, isworkflow } = props;

	// if props._session is not provided, use current session
	const session = _session ?? chatStore.currentSession();

	const sessionId = session.id;

	const config = useAppConfig();
	const fontSize = config.fontSize;

	const inputRef = useRef<HTMLTextAreaElement>(null);

	const [isLoading, setIsLoading] = useState(false);
	const isMobileScreen = useMobileScreen();

	const [messageApi, contextHolder] = message.useMessage();

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

	const { setAutoScroll, scrollDomToBottom } = useScrollToBottom(scrollRef);

	const context: RenderMessage[] = useMemo(() => {
		return session.mask.hideContext ? [] : session.mask.context.slice();
	}, [session.mask.context, session.mask.hideContext]);

	const accessStore = useAccessStore();
	const IsAuthenticated = useAuthStore((state) => state.isAuthenticated);

	if (
		context.length === 0 &&
		session.messages.at(0)?.content !== BOT_HELLO.content
	) {
		const copiedHello = Object.assign({}, BOT_HELLO);
		if (!accessStore.isAuthorized()) {
			copiedHello.content = Locale.Error.Unauthorized;
		}

		if (session.mask.intro) {
			copiedHello.content = session.mask.intro;
		}

		context.push(copiedHello);
	}

	const renderMessages = useMemo(() => {
		return context
			.concat(session.messages as RenderMessage[])
			.concat(
				isLoading
					? [
							{
								...createMessage({
									role: "assistant",
									content: "……",
								}),
								preview: true,
							},
					  ]
					: [],
			)
			.concat(
				userInput.length > 0 && config.sendPreviewBubble
					? [
							{
								...createMessage({
									role: "user",
									content: userInput,
									image_url: userImage?.fileUrl,
								}),
								preview: true,
							},
					  ]
					: [],
			);
	}, [
		config.sendPreviewBubble,
		context,
		isLoading,
		session.messages,
		session.lastUpdate,
		userInput,
		userImage?.fileUrl,
	]);

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

	const [msgRenderIndex, _setMsgRenderIndex] = useState(
		Math.max(0, renderMessages.length - CHAT_PAGE_SIZE),
	);
	function setMsgRenderIndex(newIndex: number) {
		newIndex = Math.min(renderMessages.length - CHAT_PAGE_SIZE, newIndex);
		newIndex = Math.max(0, newIndex);
		_setMsgRenderIndex(newIndex);
	}

	const messages = useMemo(() => {
		const endRenderIndex = Math.min(
			msgRenderIndex + 3 * CHAT_PAGE_SIZE,
			renderMessages.length,
		);
		return renderMessages.slice(msgRenderIndex, endRenderIndex);
	}, [msgRenderIndex, renderMessages]);

	function scrollToBottom() {
		setMsgRenderIndex(renderMessages.length - CHAT_PAGE_SIZE);
		scrollDomToBottom();
	}

	const clearContextIndex =
		(session.clearContextIndex ?? -1) >= 0
			? session.clearContextIndex! + context.length - msgRenderIndex
			: -1;

	// 假设我们有一个状态变量 currentPage 来跟踪当前加载的页数
	let currentPage = 1; // 通常初始页码从1开始

	// let hasNextPage = true; // 这个值应该根据最新的消息加载情况进行更新
	const [hasNextPage, setHasNextPage] = useState(true);

	// 更新 getMessages 函数以接受 page 参数
	const getMessages = async (sessionid: string, page: number) => {
		const param = {
			chat_session: sessionid,
			user: userStore.user.id,
			page: page, // 添加 page 参数
			limit: 50,
		};
		try {
			const chatSessionList = await getChat(param);
			// console.log("chatSessionList", chatSessionList.data);

			// 使用 chatStore 方法直接更新 sessions
			UpdateChatMessages(param.chat_session, chatSessionList.data);

			// 根据返回的数据更新 hasNextPage 状态
			setHasNextPage(chatSessionList.is_next);
		} catch (error) {
			console.error("get chatSession list error", error);
		}
	};
	// Pseudocode Plan:
	// 1. Create a function to check if the scroll is at the bottom and there are remaining messages.
	// 2. If the scroll is at the bottom and there are remaining messages, call the getMessages function.

	// Step 1: Create a function to check if the scroll is at the bottom and there are remaining messages.
	const checkScrollAndFetchMessages = (e: HTMLElement) => {
		const bottomHeight = e.scrollTop + e.clientHeight;
		const edgeThreshold = e.clientHeight;

		const isTouchTopEdge = e.scrollTop <= edgeThreshold;
		const isTouchBottomEdge = bottomHeight >= e.scrollHeight - edgeThreshold;
		const isHitBottom =
			bottomHeight >= e.scrollHeight - (isMobileScreen ? 5 : 10);

		return { isTouchTopEdge, isTouchBottomEdge, isHitBottom };
	};

	const onChatBodyScroll = (e: HTMLElement) => {
		const { isTouchTopEdge, isTouchBottomEdge, isHitBottom } =
			checkScrollAndFetchMessages(e);

		const prevPageMsgIndex = msgRenderIndex - CHAT_PAGE_SIZE;
		const nextPageMsgIndex = msgRenderIndex + CHAT_PAGE_SIZE;

		if (isTouchTopEdge && !isTouchBottomEdge) {
			// 如果触碰到顶部，可以加载前一页的消息（如果有的话）
			if (currentPage > 1) {
				currentPage -= 1;
				getMessages(sessionId, currentPage);
			}
			setMsgRenderIndex(prevPageMsgIndex);
		} else if (isTouchBottomEdge && isHitBottom && hasNextPage) {
			console.log(
				"isTouchBottomEdge",
				isTouchBottomEdge,
				"hasNextPage",
				hasNextPage,
			);
			// 如果触碰到底部且还有下一页的消息，则加载下一页的消息
			currentPage += 1;
			getMessages(sessionId, currentPage);
			setMsgRenderIndex(nextPageMsgIndex);
		}

		// 更新是否触碰到底部的状态
		setHitBottom(isHitBottom);
		// 更新是否自动滚动到底部的状态
		setAutoScroll(isHitBottom);
	};

	// 采用store 的方式来获取 responseState
	let responseState = session.responseStatus;
	// 在responseState 为 true 时 执行 onNextworkflow
	useEffect(() => {
		const lastMessage = session.messages.at(-1)?.content ?? "";
		if (responseState && enableAutoFlow) {
			onNextworkflow(lastMessage);
			// 将session 的 responseState 转为false
			chatStore.updateSession(sessionId, () => {
				session.responseStatus = false;
			});
		}
	}, [responseState]);

	const onNextworkflow = (message: string) => {
		// 点击后将该条 message 传递到下一个 session
		// 找到当前session 的index
		const sessions = chatStore.sessions;
		const index = sessions.findIndex((s) => s.id === sessionId);
		// 找到下一个 是 workflow 的session 的index
		const nextSession = sessions.find(
			(s, i) => i > index && s.isworkflow === true,
		);

		// console.log(
		// 	"工作流, 当前session: ",
		// 	session,
		// 	"下一个session: ",
		// 	nextSession,
		// );

		if (!nextSession) {
			return;
		}

		const nextSessionId = nextSession.id;

		chatStore
			.onUserInput(message, undefined, nextSession)
			.then(() => {
				setIsLoading(false);
				updateUserInfo(userStore.user.id);
			})
			.catch((error) => {
				setIsLoading(false);
				// chatStore.clearAllData();
				const code = error.response?.status ?? error.code;
				const msg = error.response?.data?.message ?? error.message;
				console.log("code:", code);

				if (code == 4000 || code == 401) {
					messageApi.error(`${msg} 2秒后将跳转到登录页面`);

					setTimeout(() => {
						authHook.logoutHook();
						router.push("/auth/");
					}, 2000);
				} else {
					messageApi.error(`${msg}`);
				}

				console.error("chatStore.onUserInput error:", msg);
				// wait 1 sec push to login page
			})
			.catch((error) => {
				setIsLoading(false);
				console.error("chatStore.onUserInput error:", error);
			});
		localStorage.setItem(LAST_INPUT_KEY, userInput);
	};

	const onUserStop = (messageId: string) => {
		ChatControllerPool.stop(session.id, messageId);
	};

	const onResend = (message: ChatMessage) => {
		// when it is resending a message
		// 1. for a user's message, find the next bot response
		// 2. for a bot's message, find the last user's input
		// 3. delete original user input and bot's message
		// 4. resend the user's input

		const resendingIndex = session.messages.findIndex(
			(m) => m.id === message.id,
		);

		if (resendingIndex <= 0 || resendingIndex >= session.messages.length) {
			console.error("[Chat] failed to find resending message", message);
			return;
		}

		let userMessage: ChatMessage | undefined;
		let botMessage: ChatMessage | undefined;

		if (message.role === "assistant") {
			botMessage = message;
			for (let i = resendingIndex; i >= 0; i -= 1) {
				if (session.messages[i].role === "user") {
					userMessage = session.messages[i];
					break;
				}
			}
		} else if (message.role === "user") {
			userMessage = message;
			for (let i = resendingIndex; i < session.messages.length; i += 1) {
				if (session.messages[i].role === "assistant") {
					botMessage = session.messages[i];
					break;
				}
			}
		}

		if (userMessage === undefined) {
			console.error("[Chat] failed to resend", message);
			return;
		}

		deleteMessage(userMessage.id);
		deleteMessage(botMessage?.id);

		setIsLoading(true);
		chatStore
			.onUserInput(userMessage.content, userMessage.image_url, session)
			.then(() => setIsLoading(false));
		inputRef.current?.focus();
	};

	const deleteMessage = (msgId?: string) => {
		chatStore.updateSession(
			sessionId,
			() => (session.messages = session.messages.filter((m) => m.id !== msgId)),
		);
	};

	const onDelete = (msgId: string) => {
		deleteMessage(msgId);
	};

	const onPinMessage = (message: ChatMessage) => {
		chatStore.updateSession(sessionId, () =>
			session.mask.context.push(message),
		);

		showToast(Locale.Chat.Actions.PinToastContent, {
			text: Locale.Chat.Actions.PinToastAction,
			onClick: () => {
				setShowPromptModal(true);
			},
		});
	};

	const onRightClick = (e: any, message: ChatMessage) => {
		if (selectOrCopy(e.currentTarget, message.content)) {
			if (userInput.length === 0) {
				setUserInput(message.content);
			}

			e.preventDefault();
		}
	};

	return (
		<div
			className={styles["chat-body"]}
			ref={scrollRef}
			onScroll={(e) => onChatBodyScroll(e.currentTarget)}
			onMouseDown={() => inputRef.current?.blur()}
			onTouchStart={() => {
				inputRef.current?.blur();
				setAutoScroll(false);
			}}
		>
			{contextHolder}
			{session.mask.modelConfig.model == "midjourney" && <MJFloatButton />}
			{messages.map((message, i) => {
				const isUser = message.role === "user";
				const mjstatus = message.mjstatus;
				const actions = mjstatus?.action;

				const isContext = i < context.length;
				const showActions =
					i > 0 &&
					!(message.preview || message.content.length === 0) &&
					!isContext;
				const showTyping = message.preview || message.streaming;

				const shouldShowClearContextDivider = i === clearContextIndex - 1;

				return (
					<Fragment key={message.id}>
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
										{isUser ? (
											renderedUserAvatar
										) : (
											<MaskAvatar mask={session.mask} />
										)}
									</div>

									{showActions && (
										<div className={styles["chat-message-actions"]}>
											<div className={styles["chat-input-actions"]}>
												{message.streaming ? (
													<ChatAction
														text={Locale.Chat.Actions.Stop}
														icon={<StopIcon />}
														onClick={() => onUserStop(message.id ?? i)}
													/>
												) : (
													<>
														<ChatAction
															text={Locale.Chat.Actions.Retry}
															icon={<ResetIcon />}
															onClick={() => onResend(message)}
														/>
														<ChatAction
															text={Locale.Chat.Actions.Delete}
															icon={<DeleteIcon />}
															onClick={() => onDelete(message.id ?? i)}
														/>
														<ChatAction
															text={Locale.Chat.Actions.Pin}
															icon={<PinIcon />}
															onClick={() => onPinMessage(message)}
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
										></div>
									)}
									{isUser && !message && (
										<Loading3QuartersOutlined spin={true} />
									)}
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
									{isContext
										? Locale.Chat.IsContext
										: message.date.toLocaleString()}
								</div>
							</div>
						</div>
						{shouldShowClearContextDivider && (
							<ClearContextDivider sessionId={sessionId} />
						)}
					</Fragment>
				);
			})}
		</div>
	);
}
