import { useDebouncedCallback } from "use-debounce";
import React, {
	useState,
	useRef,
	useEffect,
	useMemo,
	Fragment,
	useContext,
} from "react";
import { ChatSession } from "../store";
import { getISOLang, getLang } from "../locales";

import SendWhiteIcon from "../icons/send-white.svg";
import CopyIcon from "../icons/copy.svg";
import PromptIcon from "../icons/prompt.svg";
import ResetIcon from "../icons/reload.svg";
import BreakIcon from "../icons/break.svg";
import SettingsIcon from "../icons/chat-settings.svg";
import LightIcon from "../icons/light.svg";
import DarkIcon from "../icons/dark.svg";
import AutoIcon from "../icons/auto.svg";
import BottomIcon from "../icons/bottom.svg";
import StopIcon from "../icons/pause.svg";
import RobotIcon from "../icons/robot.svg";
import playIcon from "../icons/play.svg";

import EnablePluginIcon from "@/app/icons/plugin_enable.svg";
import DisablePluginIcon from "@/app/icons/plugin_disable.svg";
import {
	ChatMessage,
	SubmitKey,
	useChatStore,
	BOT_HELLO,
	createMessage,
	useAccessStore,
	Theme,
	useAppConfig,
	DEFAULT_TOPIC,
	ModelType,
	useUserStore,
} from "../store";

import {
	copyToClipboard,
	selectOrCopy,
	autoGrowTextArea,
	useMobileScreen,
} from "../utils";

import { api } from "../client/api";

import dynamic from "next/dynamic";

import { ChatControllerPool } from "../client/controller";
import { Prompt, usePromptStore } from "../store/prompt";
import Locale from "../locales";

import { IconButton } from "../components/button";
import styles from "@/app/multi-chats/multi-chats.module.scss";

import {
	List,
	ListItem,
	Modal,
	Selector,
	showConfirm,
	showPrompt,
	showToast,
} from "../components/ui-lib";
import {
	CHAT_PAGE_SIZE,
	LAST_INPUT_KEY,
	MAX_RENDER_MSG_COUNT,
	Path,
	REQUEST_TIMEOUT_MS,
	UNFINISHED_INPUT,
} from "../constant";

import {
	ContextPrompts,
	MaskAvatar,
	MaskConfig,
} from "@/app/chats/mask-components";
import { useMaskStore } from "../store/mask";
import { ChatCommandPrefix, useChatCommand, useCommand } from "../command";

import { createChat, CreateChatData } from "../api/chat";
import useAuth from "../hooks/useAuth";
import { message } from "antd";

import {
	useSubmitHandler,
	useScrollToBottom,
	ClearContextDivider,
} from "./chat-controller";
import { ChatContext } from "../chats/chat/main";

import { useWorkflowStore } from "../store/workflow";
import { useAllModels } from "@/app/utils/hooks";

export function PromptHints(props: {
	prompts: RenderPompt[];
	onPromptSelect: (prompt: RenderPompt) => void;
}) {
	const noPrompts = props.prompts.length === 0;
	const [selectIndex, setSelectIndex] = useState(0);
	const selectedRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setSelectIndex(0);
	}, [props.prompts.length]);

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (noPrompts || e.metaKey || e.altKey || e.ctrlKey) {
				return;
			}
			// arrow up / down to select prompt
			const changeIndex = (delta: number) => {
				e.stopPropagation();
				e.preventDefault();
				const nextIndex = Math.max(
					0,
					Math.min(props.prompts.length - 1, selectIndex + delta),
				);
				setSelectIndex(nextIndex);
				selectedRef.current?.scrollIntoView({
					block: "center",
				});
			};

			if (e.key === "ArrowUp") {
				changeIndex(1);
			} else if (e.key === "ArrowDown") {
				changeIndex(-1);
			} else if (e.key === "Enter") {
				const selectedPrompt = props.prompts.at(selectIndex);
				if (selectedPrompt) {
					props.onPromptSelect(selectedPrompt);
				}
			}
		};

		window.addEventListener("keydown", onKeyDown);

		return () => window.removeEventListener("keydown", onKeyDown);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.prompts.length, selectIndex]);

	if (noPrompts) return null;
	return (
		<div className={styles["prompt-hints"]}>
			{props.prompts.map((prompt, i) => (
				<div
					ref={i === selectIndex ? selectedRef : null}
					className={
						styles["prompt-hint"] +
						` ${i === selectIndex ? styles["prompt-hint-selected"] : ""}`
					}
					key={prompt.title + i.toString()}
					onClick={() => props.onPromptSelect(prompt)}
					onMouseEnter={() => setSelectIndex(i)}
				>
					<div className={styles["hint-title"]}>{prompt.title}</div>
					<div className={styles["hint-content"]}>{prompt.content}</div>
				</div>
			))}
		</div>
	);
}

export function ChatAction(props: {
	text: string;
	icon: JSX.Element;
	onClick: () => void;
}) {
	const iconRef = useRef<HTMLDivElement>(null);
	const textRef = useRef<HTMLDivElement>(null);
	const [width, setWidth] = useState({
		full: 16,
		icon: 16,
	});

	function updateWidth() {
		if (!iconRef.current || !textRef.current) return;
		const getWidth = (dom: HTMLDivElement) => dom.getBoundingClientRect().width;
		const textWidth = getWidth(textRef.current);
		const iconWidth = getWidth(iconRef.current);
		setWidth({
			full: textWidth + iconWidth,
			icon: iconWidth,
		});
	}

	return (
		<div
			className={`${styles["chat-input-action"]} clickable`}
			onClick={() => {
				props.onClick();
				setTimeout(updateWidth, 1);
			}}
			onMouseEnter={updateWidth}
			onTouchStart={updateWidth}
			style={
				{
					"--icon-width": `${width.icon}px`,
					"--full-width": `${width.full}px`,
				} as React.CSSProperties
			}
		>
			<div ref={iconRef} className={styles["icon"]}>
				{props.icon}
			</div>
			<div className={styles["text"]} ref={textRef}>
				{props.text}
			</div>
		</div>
	);
}

export function ChatActions(props: {
	showPromptModal: () => void;
	scrollToBottom: () => void;
	showPromptHints: () => void;
	hitBottom: boolean;
	session: ChatSession;
	index: number;
}) {
	const config = useAppConfig();
	const chatStore = useChatStore();
	const { chat_balance } = useUserStore().user;
	const sessionId = props.session.id;
	const session = props.session;

	const usePlugins = session.mask.usePlugins;
	function switchUsePlugins() {
		chatStore.updateSession(sessionId, () => {
			session.mask.usePlugins = !session.mask.usePlugins;
		});
		console.log("switchUsePlugins", usePlugins);
		console.log("session", session, "index: ", props.index);
	}

	// console.log("session", session, "index: ", props.index);
	const index = props.index;
	// switch themes
	const theme = config.theme;
	function nextTheme() {
		const themes = [Theme.Auto, Theme.Light, Theme.Dark];
		const themeIndex = themes.indexOf(theme);
		const nextIndex = (themeIndex + 1) % themes.length;
		const nextTheme = themes[nextIndex];
		config.update((config) => (config.theme = nextTheme));
	}

	// stop all responses
	const couldStop = ChatControllerPool.hasPending();
	const stopAll = () => ChatControllerPool.stopAll();

	// switch model
	const currentModel = session.mask.modelConfig.model;
	const models = useAllModels()
		.filter((m) => m.available)
		.map((m) => ({
			title: m.displayName,
			value: m.name,
		}));
	const [showModelSelector, setShowModelSelector] = useState(false);

	return (
		<div className={styles["chat-input-actions"]}>
			<div>
				{couldStop && (
					<ChatAction
						onClick={stopAll}
						text={Locale.Chat.InputActions.Stop}
						icon={<StopIcon />}
					/>
				)}
				{!props.hitBottom && (
					<ChatAction
						onClick={props.scrollToBottom}
						text={Locale.Chat.InputActions.ToBottom}
						icon={<BottomIcon />}
					/>
				)}
				{props.hitBottom && (
					<ChatAction
						onClick={props.showPromptModal}
						text={Locale.Chat.InputActions.Settings}
						icon={<SettingsIcon />}
					/>
				)}
				{/* 
      <ChatAction
        onClick={nextTheme}
        text={Locale.Chat.InputActions.Theme[theme]}
        icon={
          <>
            {theme === Theme.Auto ? (
              <AutoIcon />
            ) : theme === Theme.Light ? (
              <LightIcon />
            ) : theme === Theme.Dark ? (
              <DarkIcon />
            ) : null}
          </>
        }
      /> */}

				<ChatAction
					onClick={props.showPromptHints}
					text={Locale.Chat.InputActions.Prompt}
					icon={<PromptIcon />}
				/>

				<ChatAction
					onClick={() => setShowModelSelector(true)}
					text={currentModel}
					icon={<RobotIcon />}
				/>
				{config.pluginConfig.enable &&
					/^gpt(?!.*03\d{2}$).*$/.test(currentModel) && (
						<ChatAction
							onClick={switchUsePlugins}
							text={
								usePlugins
									? Locale.Chat.InputActions.DisablePlugins
									: Locale.Chat.InputActions.EnablePlugins
							}
							icon={usePlugins ? <EnablePluginIcon /> : <DisablePluginIcon />}
						/>
					)}
				{showModelSelector && (
					<Selector
						defaultSelectedValue={currentModel}
						items={models.map((m) => ({
							title: m.title ? m.title : m.value,
							value: m.value,
						}))}
						onClose={() => setShowModelSelector(false)}
						onSelection={(s) => {
							if (s.length === 0) return;
							chatStore.updateSession(sessionId, () => {
								session.mask.modelConfig.model = s[0] as ModelType;
								session.mask.syncGlobalConfig = false;
								// session.mask.usePlugins = /^gpt(?!.*03\d{2}$).*$/.test(
								// 	session.mask.modelConfig.model,
								// );
								console.log(session.mask.modelConfig);
							});
							showToast(s[0]);
						}}
					/>
				)}
				<ChatAction
					text={Locale.Chat.InputActions.Clear}
					icon={<BreakIcon />}
					onClick={() => {
						console.log("=-====clear====");
						chatStore.updateSession(sessionId, () => {
							if (session.clearContextIndex === session.messages.length) {
								session.clearContextIndex = undefined;
							} else {
								session.clearContextIndex = session.messages.length;
								session.memoryPrompt = ""; // will clear memory
							}
							console.log(
								"session",
								sessionId,
								"clearContextIndex",
								session.clearContextIndex,
							);
						});
					}}
				/>
			</div>
			<div>
				{/* 展示用户余额 */}
				<span className={styles["chat-balance"]}>对话余额: {chat_balance}</span>
			</div>
		</div>
	);
}
export type RenderPompt = Pick<Prompt, "title" | "content">;

export function Inputpanel(props: { session: ChatSession; index: number }) {
	const config = useAppConfig();
	const chatStore = useChatStore();
	const workflowStore = useWorkflowStore();
	const userStore = useUserStore();

	const authHook = useAuth();

	const sessionId = props.session.id;
	const session = props.session;

	const index = props.index;

	const sessions = workflowStore.sessions;
	const nextSession = sessions.at(index + 1);

	const inputRef = useRef<HTMLTextAreaElement>(null);
	const [isLoading, setIsLoading] = useState(false);
	const {
		hitBottom,
		setHitBottom,

		showPromptModal,
		setShowPromptModal,
		userInput,
		setUserInput,
		enableAutoFlow,
		setEnableAutoFlow,
	} = useContext(ChatContext);

	const { submitKey, shouldSubmit } = useSubmitHandler();
	const { scrollRef, setAutoScroll, scrollDomToBottom } = useScrollToBottom();
	const isMobileScreen = useMobileScreen();

	const promptStore = usePromptStore();
	const [promptHints, setPromptHints] = useState<RenderPompt[]>([]);

	const onSearch = useDebouncedCallback(
		(text: string) => {
			const matchedPrompts = promptStore.search(text);
			setPromptHints(matchedPrompts);
		},
		100,
		{ leading: true, trailing: true },
	);

	const chatCommands = useChatCommand({
		new: () => chatStore.newSession(),
		prev: () => chatStore.nextSession(-1),
		next: () => chatStore.nextSession(1),
		clear: () =>
			chatStore.updateSession(
				sessionId,
				() => (session.clearContextIndex = session.messages.length),
			),
		del: () => chatStore.deleteSession(chatStore.currentSessionIndex),
	});

	const onPromptSelect = (prompt: RenderPompt) => {
		setTimeout(() => {
			setPromptHints([]);

			const matchedChatCommand = chatCommands.match(prompt.content);
			if (matchedChatCommand.matched) {
				matchedChatCommand.invoke();
				setUserInput("");
			} else {
				setUserInput(prompt.content);
			}
			inputRef.current?.focus();
		}, 30);
	};

	const [messageApi, contextHolder] = message.useMessage();

	const doSubmit = (userInput: string) => {
		if (userInput.trim() === "") return;

		const matchCommand = chatCommands.match(userInput);
		if (matchCommand.matched) {
			setUserInput("");
			setPromptHints([]);
			matchCommand.invoke();
			return;
		}

		setIsLoading(true);
		const recentMessages = chatStore.getMessagesWithMemory();

		// console.log("current session id:", session);
		// console.log("next session:", nextSession ?? "null");
		chatStore
			.onUserInput(userInput, undefined, session)
			.then(() => {
				setIsLoading(false);
				// 构建 createChat 接口的请求参数

				const createChatData: CreateChatData = {
					user: userStore.user.id, // 替换为实际的用户 ID
					chat_session: session.id, // 替换为实际的聊天会话 ID
					message: userInput, // 使用用户输入作为 message 参数
					memory: recentMessages,
					model: session.mask.modelConfig.model,
				};
				// console.log("createChatData:", createChatData);

				createChat(createChatData).then((response) => {
					console.log("createChat response:", response);
					const data = response.data;

					if (data) {
						console.log("createChat success:", response);
						const newSessionId = data.chat_session;

						if (session.id !== newSessionId) {
							chatStore.updateSession(sessionId, () => {
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
		setUserInput("");
		setPromptHints([]);
		if (!isMobileScreen) inputRef.current?.focus();
		setAutoScroll(true);
	};

	type RenderMessage = ChatMessage & { preview?: boolean };

	const context: RenderMessage[] = useMemo(() => {
		return session.mask.hideContext ? [] : session.mask.context.slice();
	}, [session.mask.context, session.mask.hideContext]);

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
		userInput,
	]);

	const [msgRenderIndex, _setMsgRenderIndex] = useState(
		Math.max(0, renderMessages.length - CHAT_PAGE_SIZE),
	);
	function setMsgRenderIndex(newIndex: number) {
		newIndex = Math.min(renderMessages.length - CHAT_PAGE_SIZE, newIndex);
		newIndex = Math.max(0, newIndex);
		_setMsgRenderIndex(newIndex);
	}

	function scrollToBottom() {
		setMsgRenderIndex(renderMessages.length - CHAT_PAGE_SIZE);
		scrollDomToBottom();
	}

	const onInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (
			e.key === "ArrowUp" &&
			userInput.length <= 0 &&
			!(e.metaKey || e.altKey || e.ctrlKey)
		) {
			setUserInput(localStorage.getItem(LAST_INPUT_KEY) ?? "");
			e.preventDefault();
			return;
		}
		if (shouldSubmit(e) && promptHints.length === 0) {
			doSubmit(userInput);
			e.preventDefault();
		}
	};

	const SEARCH_TEXT_LIMIT = 20;
	const onInput = (text: string) => {
		setUserInput(text);
		const n = text.trim().length;

		if (n === 0) {
			setPromptHints([]);
		} else if (text.startsWith(ChatCommandPrefix)) {
			setPromptHints(chatCommands.search(text));
		} else if (!config.disablePromptHint && n < SEARCH_TEXT_LIMIT) {
			if (text.startsWith("/")) {
				let searchText = text.slice(1);
				onSearch(searchText);
			}
		}
	};

	const [inputRows, setInputRows] = useState(2);
	const measure = useDebouncedCallback(
		() => {
			const rows = inputRef.current ? autoGrowTextArea(inputRef.current) : 1;
			const inputRows = Math.min(
				20,
				Math.max(2 + Number(!isMobileScreen), rows),
			);
			setInputRows(inputRows);
		},
		100,
		{
			leading: true,
			trailing: true,
		},
	);
	useEffect(measure, [userInput]);

	useEffect(() => {
		// try to load from local storage
		const key = UNFINISHED_INPUT(session.id);
		const mayBeUnfinishedInput = localStorage.getItem(key);
		if (mayBeUnfinishedInput && userInput.length === 0) {
			setUserInput(mayBeUnfinishedInput);
			localStorage.removeItem(key);
		}

		const dom = inputRef.current;
		return () => {
			localStorage.setItem(key, dom?.value ?? "");
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const autoFocus = !isMobileScreen;

	return (
		<div className={styles["chat-input-panel"]}>
			{contextHolder}
			<PromptHints prompts={promptHints} onPromptSelect={onPromptSelect} />

			<ChatActions
				showPromptModal={() => setShowPromptModal(true)}
				scrollToBottom={scrollToBottom}
				hitBottom={hitBottom}
				showPromptHints={() => {
					if (promptHints.length > 0) {
						setPromptHints([]);
						return;
					}

					inputRef.current?.focus();
					setUserInput("/");
					onSearch("");
				}}
				session={session}
				index={index}
			/>
			<div className={styles["chat-input-panel-inner"]}>
				<textarea
					ref={inputRef}
					className={styles["chat-input"]}
					placeholder={Locale.Chat.Input(submitKey)}
					onInput={(e) => onInput(e.currentTarget.value)}
					value={userInput}
					onKeyDown={onInputKeyDown}
					onFocus={scrollToBottom}
					onClick={scrollToBottom}
					rows={inputRows}
					autoFocus={autoFocus}
					style={{
						fontSize: config.fontSize,
					}}
				/>
				<IconButton
					icon={<SendWhiteIcon />}
					text={Locale.Chat.Send}
					className={styles["chat-input-send"]}
					type="primary"
					onClick={() => doSubmit(userInput)}
				/>
			</div>
		</div>
	);
}
