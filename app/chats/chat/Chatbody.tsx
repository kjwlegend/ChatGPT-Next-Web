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
import styles from "./multi-chats.module.scss";

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

import { CreateChatData, createChat } from "@/app/api/chat";

import { convertTextToSpeech } from "@/app/utils/voicetotext";
import { SpeechSynthesizer } from "microsoft-cognitiveservices-speech-sdk";
import { ChatSession } from "@/app/store";
import { message } from "antd";
import useAuth from "@/app/hooks/useAuth";

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

	const { _session, index, isworkflow } = props;

	// if props._session is not provided, use current session
	const session = _session ?? chatStore.currentSession();

	const sessionId = session.id;

	const config = useAppConfig();
	const fontSize = config.fontSize;

	const inputRef = useRef<HTMLTextAreaElement>(null);

	const [isLoading, setIsLoading] = useState(false);
	const isMobileScreen = useMobileScreen();

	const [synthesizer, setSynthesizer] = useState<any | null>(null);
	const [messageApi, contextHolder] = message.useMessage();

	const playAudio = async (message: ChatMessage) => {
		console.log("synthesizer", synthesizer);

		// remove * _ and special characters from message.content
		const regex = /[*_~`]/g;
		const newContent = message.content.replace(regex, "");
		console.log("newContent", newContent);

		const newSynthesizer = await convertTextToSpeech(newContent);
		console.log("newSynthesizer", newSynthesizer);
		setSynthesizer(newSynthesizer);
	};

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
		if (!accessStore.isAuthorized(IsAuthenticated)) {
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

	const onChatBodyScroll = (e: HTMLElement) => {
		const bottomHeight = e.scrollTop + e.clientHeight;
		const edgeThreshold = e.clientHeight;

		const isTouchTopEdge = e.scrollTop <= edgeThreshold;
		const isTouchBottomEdge = bottomHeight >= e.scrollHeight - edgeThreshold;
		const isHitBottom =
			bottomHeight >= e.scrollHeight - (isMobileScreen ? 5 : 10);

		const prevPageMsgIndex = msgRenderIndex - CHAT_PAGE_SIZE;
		const nextPageMsgIndex = msgRenderIndex + CHAT_PAGE_SIZE;

		if (isTouchTopEdge && !isTouchBottomEdge) {
			setMsgRenderIndex(prevPageMsgIndex);
		} else if (isTouchBottomEdge) {
			setMsgRenderIndex(nextPageMsgIndex);
		}

		setHitBottom(isHitBottom);
		setAutoScroll(isHitBottom);
	};

	// 采用store 的方式来获取 responseState
	let responseState = session.responseStatus;
	// console.log("response checkkkkkk", responseState);
	// 在responseState 为 true 时 执行 onNextworkflow
	useEffect(() => {
		const lastMessage = session.messages.at(-1)?.content ?? "";
		// console.log("responseState old", responseState);
		// console.log("lastMessage", lastMessage);
		if (responseState && enableAutoFlow) {
			onNextworkflow(lastMessage);
			// 将session 的 responseState 转为false
			chatStore.updateSession(sessionId, () => {
				session.responseStatus = false;
			});
		}
		// console.log("responseState2222 new", responseState);
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

		console.log(
			"工作流, 当前session: ",
			session,
			"下一个session: ",
			nextSession,
		);

		if (!nextSession) {
			return;
		}

		const nextSessionId = nextSession.id;

		// 获取所点击的 message
		// console.log("nextSession", nextSession, message);
		const recentMessages = chatStore.getMessagesWithMemory(nextSession);

		chatStore
			.onUserInput(message, undefined, nextSession)
			.then(() => {
				setIsLoading(false);

				const createChatData: CreateChatData = {
					user: userStore.user.id,
					chat_session: session.id,
					message: message,
					memory: recentMessages,
					model: session.mask.modelConfig.model,
				};

				createChat(createChatData).then((response) => {
					console.log("createChat response:", response);
					const data = response.data;

					if (data) {
						console.log("createChat success:", response);
						const newSessionId = data.chat_session;

						if (session.id !== newSessionId) {
							chatStore.updateSession(sessionId, (session) => {
								session.id = newSessionId;
							});
						}
					} else {
						if (response.code === 401) {
							messageApi.error("登录已过期(令牌无效)，请重新登录");
							authHook.logoutHook();
						} else if (response.code === 4001) {
							messageApi.error("登录已过期(令牌无效)，请重新登录");
							authHook.logoutHook();
						} else if (response.code === 4000) {
							messageApi.error(
								"当前对话出现错误, 请重新新建对话",
								response.msg,
							);
						}
					}
				});
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
			{messages.map((message, i) => {
				const isUser = message.role === "user";

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
										>
											<button onClick={() => playAudio(message)}>
												<PlayIcon />
											</button>
										</div>
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
