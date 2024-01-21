"use client";
import { useDebouncedCallback } from "use-debounce";
import React, {
	useState,
	useRef,
	useEffect,
	useMemo,
	Fragment,
	useContext,
	use,
} from "react";
import { getISOLang, getLang } from "@/app/locales";
import { useRouter } from "next/navigation";

import SendWhiteIcon from "@/app/icons/send-white.svg";
import CopyIcon from "@/app/icons/copy.svg";
import PromptIcon from "@/app/icons/prompt.svg";
import ResetIcon from "@/app/icons/reload.svg";
import BreakIcon from "@/app/icons/break.svg";
import SettingsIcon from "@/app/icons/chat-settings.svg";
import LightIcon from "@/app/icons/light.svg";
import DarkIcon from "@/app/icons/dark.svg";
import AutoIcon from "@/app/icons/auto.svg";
import BottomIcon from "@/app/icons/bottom.svg";
import StopIcon from "@/app/icons/pause.svg";
import RobotIcon from "@/app/icons/robot.svg";
import Record from "@/app/icons/record.svg";
import UploadIcon from "@/app/icons/upload.svg";
import CloseIcon from "@/app/icons/close.svg";
import { oss } from "@/app/constant";
import CheckmarkIcon from "@/app/icons/checkmark.svg";

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
} from "@/app/store";

import {
	copyToClipboard,
	selectOrCopy,
	autoGrowTextArea,
	useMobileScreen,
} from "@/app/utils";

import { api } from "@/app/client/api";

import { ChatControllerPool } from "@/app/client/controller";
import { Prompt, usePromptStore } from "@/app/store/prompt";
import Locale from "@/app/locales";

import { IconButton } from "@/app/components/button";
import styles from "./chats.module.scss";

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
	UNFINISHED_INPUT,
	LAST_INPUT_IMAGE_KEY,
} from "@/app/constant";

import {
	ContextPrompts,
	MaskAvatar,
	MaskConfig,
} from "@/app/chats/mask-components";

import { Radio } from "antd";
import { useMaskStore } from "@/app/store/mask";
import { ChatCommandPrefix, useChatCommand, useCommand } from "@/app/command";
import Image from "next/image";

import { createChat, CreateChatData } from "@/app/api/backend/chat";
import useAuth from "@/app/hooks/useAuth";
import { message } from "antd";

import {
	useSubmitHandler,
	useScrollToBottom,
	ClearContextDivider,
} from "./chat-controller";
import WindowHeaer from "./WindowHeader";
import { ChatContext } from "./main";
// import { ChatContext } from "@/app/multi-chats/context";
import {
	startSpeechToText,
	convertTextToSpeech,
} from "@/app/utils/voicetotext";
import { useAllModels } from "@/app/utils/hooks";
import { ChatSession } from "@/app/store";

import {
	ApiTwoTone,
	ThunderboltTwoTone,
	SettingTwoTone,
	MessageTwoTone,
} from "@ant-design/icons";

import { Dropdown, MenuProps, Checkbox, Divider } from "antd";
import { type } from "os";
import { usePluginStore } from "@/app/store/plugin";
import { submitChatMessage } from "@/app/services/chatService";

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
	innerNode?: JSX.Element;
	onClick: () => void;
	type?: "default" | "dropdown";
	dropdownItems?: MenuProps;
	hidetext?: boolean | undefined;
}) {
	const iconRef = useRef<HTMLDivElement>(null);
	const textRef = useRef<HTMLDivElement>(null);
	const [width, setWidth] = useState({
		full: 16,
		icon: 16,
	});

	const isMobileScreen = useMobileScreen();

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

	useEffect(() => {
		if (!isMobileScreen) {
			updateWidth(); // Update width on mount for non-mobile screens
		}
	}, [isMobileScreen]);

	const actionContent = (
		<>
			<div ref={iconRef} className={styles["icon"]}>
				{props.icon}
			</div>
			<div className={styles["text"]} ref={textRef}>
				{props.text}
			</div>
			{props.innerNode}
		</>
	);

	if (props.type === "dropdown" && props.dropdownItems) {
		return (
			<Dropdown
				menu={props.dropdownItems}
				placement="topLeft"
				trigger={["click"]}
				arrow={{ pointAtCenter: true }}
			>
				<div
					className={`${styles["chat-input-action"]} clickable`}
					onClick={props.onClick}
					style={
						isMobileScreen || props.hidetext
							? ({
									"--icon-width": `${width.icon}px`,
									"--full-width": `${width.full}px`,
							  } as React.CSSProperties)
							: ({
									width: "auto",
							  } as React.CSSProperties)
					}
				>
					{actionContent}
				</div>
			</Dropdown>
		);
	} else {
		return (
			<div
				className={`${styles["chat-input-action"]} clickable`}
				onClick={() => {
					props.onClick();
					if (isMobileScreen) {
						setTimeout(updateWidth, 1);
					}
				}}
				onMouseEnter={
					props.hidetext && isMobileScreen ? updateWidth : undefined
				}
				onTouchStart={
					props.hidetext && isMobileScreen ? updateWidth : undefined
				}
				style={
					isMobileScreen || props.hidetext
						? ({
								"--icon-width": `${width.icon}px`,
								"--full-width": `${width.full}px`,
						  } as React.CSSProperties)
						: ({
								width: "auto",
						  } as React.CSSProperties)
				}
			>
				{actionContent}
			</div>
		);
	}
}

export function ChatActions(props: {
	showPromptModal: () => void;
	scrollToBottom: () => void;
	showPromptHints: () => void;
	imageSelected: (img: any) => void;
	hitBottom: boolean;
	session?: ChatSession;
	index?: number;
	workflows?: boolean;
}) {
	const config = useAppConfig();
	const chatStore = useChatStore();
	const session = props.session ? props.session : chatStore.currentSession();
	const sessionId = session.id;
	const { chat_balance } = useUserStore().user;

	const fileInputRef = React.useRef<HTMLInputElement>(null);

	const usePlugins = session.mask.usePlugins;

	// use useeffect to check mask.plugins.length , if zero then set usePlugins to false

	function selectImage() {
		if (fileInputRef?.current) {
			console.log("upload click1");

			fileInputRef.current.click();
		}
	}

	const onImageSelected = async (e: any) => {
		const file = e.target.files[0];
		const fileName = await api.file.upload(file, "upload");
		props.imageSelected({
			fileName,
			fileUrl: `${oss}${fileName}!uploadthumbnail`,
		});
		e.target.value = null;
	};

	function switchUsePlugins() {
		// based on session.mask.plugins to decide if use plugins

		if (session.mask.plugins && session.mask.plugins?.length > 0) {
			chatStore.updateSession(
				session.id,
				() => {
					session.mask.usePlugins = true;
				},
				false,
			);
		} else {
			chatStore.updateSession(
				session.id,
				() => {
					session.mask.usePlugins = false;
				},
				false,
			);
		}
	}
	// function MjConfigChange(e: any) {
	// 	const sizevalue = e.target.value;
	// 	if (sizevalue == "0") {
	// 		return;
	// 	}
	// 	const size = "--ar " + sizevalue;
	// 	chatStore.updateSession(session.id, () => {
	// 		session.mjConfig.size = size;
	// 	});
	// 	console.log("session id", session.id, "mjConfig: ", session.mjConfig);
	// }

	// useEffect(() => {
	// 	console.log("usePlugins: ", session.mask.usePlugins);
	// }, [session.mask.plugins]);

	const availablePlugins = usePluginStore()
		.getAll()
		.filter((p) => getLang() === p.lang);

	if (!session.mask.plugins) {
		session.mask.plugins = [];
	}

	// console.log("availablePlugins", availablePlugins);
	// add available plugins to items, make the option as a checkbox using antd component
	// when click the check box item, it will add the item.toolName into mask.plugins
	// when click the check box item again, it will remove the item.toolName from mask.plugins
	// use checkbox style to show the check box
	// add a select all button to select all plugins

	const items: MenuProps["items"] = availablePlugins.map((p) => {
		return {
			key: p.name,
			label: (
				<Checkbox
					checked={
						session.mask.plugins &&
						session.mask.plugins.includes(p.toolName ?? p.name)
					}
					onChange={(e) => {
						chatStore.updateSession(
							session.id,
							() => {
								if (e.target.checked) {
									session.mask.plugins?.push(p.toolName ?? p.name);
								} else {
									session.mask.plugins = session.mask.plugins?.filter(
										(name) => name !== p.toolName,
									);
								}
							},
							false,
						);

						switchUsePlugins();
					}}
					onClick={(e) => {
						e.stopPropagation();
					}}
				>
					{p.name}
				</Checkbox>
			),
		};
	});

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
						hidetext={props.workflows ? true : false}
					/>
				)}
				{!props.hitBottom && (
					<ChatAction
						onClick={props.scrollToBottom}
						text={Locale.Chat.InputActions.ToBottom}
						icon={<BottomIcon />}
						hidetext={props.workflows ? true : false}
					/>
				)}
				{props.hitBottom && (
					<ChatAction
						onClick={props.showPromptModal}
						text={Locale.Chat.InputActions.Settings}
						icon={<SettingTwoTone style={{ fontSize: "15px" }} />}
						hidetext={props.workflows ? true : false}
					/>
				)}

				{/* <ChatAction
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

				{/* <ChatAction
					onClick={props.showPromptHints}
					text={Locale.Chat.InputActions.Prompt}
					icon={<MessageTwoTone style={{ fontSize: "15px" }} />}
				/> */}

				<ChatAction
					onClick={() => setShowModelSelector(true)}
					text={currentModel}
					icon={<MessageTwoTone style={{ fontSize: "15px" }} />}
					hidetext={props.workflows ? true : false}
				/>

				{config.pluginConfig.enable &&
					/^gpt(?!.*03\d{2}$).*$/.test(currentModel) &&
					currentModel != "gpt-4-vision-preview" && (
						<ChatAction
							onClick={switchUsePlugins}
							text={
								session.mask.plugins.length > 0
									? Locale.Chat.InputActions.DisablePlugins
									: Locale.Chat.InputActions.EnablePlugins
							}
							icon={
								session.mask.plugins.length > 0 ? (
									<ThunderboltTwoTone
										style={{
											fontSize: "15px",
										}}
									/>
								) : (
									<ApiTwoTone
										twoToneColor="#52c41a"
										style={{ fontSize: "15px" }}
									/>
								)
							}
							type="dropdown"
							dropdownItems={{ items }}
							hidetext={props.workflows ? true : false}
						/>
					)}
				{currentModel == "gpt-4-vision-preview" && (
					<ChatAction
						onClick={selectImage}
						text="选择图片"
						icon={<UploadIcon />}
						innerNode={
							<input
								type="file"
								accept=".png,.jpg,.webp,.jpeg"
								id="chat-image-file-select-upload"
								style={{ display: "none" }}
								onChange={onImageSelected}
								ref={fileInputRef}
							/>
						}
						hidetext={props.workflows ? true : false}
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
				{/* {currentModel == "midjourney" && (
					<div className={`${styles["chat-input-action"]} `}>
						<span>尺寸:</span>
						<Radio.Group
							defaultValue="a"
							buttonStyle="solid"
							size="small"
							style={{ borderRadius: 25, marginLeft: 10 }}
							onChange={MjConfigChange}
						>
							<Radio.Button value="1:1">1:1</Radio.Button>
							<Radio.Button value="4:3">4:3</Radio.Button>
							<Radio.Button value="16:9">16:9</Radio.Button>
							<Radio.Button value="9:16">9:16</Radio.Button>
							<Radio.Button value="0">自定义</Radio.Button>
						</Radio.Group>
					</div>
				)} */}

				{currentModel !== "midjourney" && (
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
						hidetext={props.workflows ? true : false}
					/>
				)}
			</div>
			<div>
				<div>
					{/* 展示用户余额 */}
					<span className={styles["chat-balance"]}>
						对话余额: {chat_balance}
					</span>
				</div>
			</div>
		</div>
	);
}
export type RenderPompt = Pick<Prompt, "title" | "content">;
let voicetext: string[] = [];

export function Inputpanel(props: { session?: ChatSession; index?: number }) {
	const config = useAppConfig();
	const chatStore = useChatStore();
	const session = props.session ? props.session : chatStore.currentSession();
	const userStore = useUserStore();
	const authHook = useAuth();
	const promptStore = usePromptStore();
	const isMobileScreen = useMobileScreen();
	const router = useRouter();

	const { updateUserInfo } = authHook;

	const inputRef = useRef<HTMLTextAreaElement>(null);

	const {
		hitBottom,
		setHitBottom,
		showPromptModal,
		setShowPromptModal,
		userInput,
		setUserInput,
		scrollRef,
		enableAutoFlow,
		setEnableAutoFlow,
		userImage,
		setUserImage,
	} = useContext(ChatContext);

	const { submitKey, shouldSubmit } = useSubmitHandler();
	const { setAutoScroll, scrollDomToBottom } = useScrollToBottom(scrollRef);
	const [promptHints, setPromptHints] = useState<RenderPompt[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const textareaMinHeight = userImage ? 121 : 68;

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
				session.id,
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

	const doSubmit = (userInput: string, userImage?: any) => {
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

		chatStore
			.onUserInput(userInput, userImage?.fileUrl, session)
			.then((res) => {
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
			});
		localStorage.setItem(LAST_INPUT_KEY, userInput);
		setUserInput("");
		voicetext = [];
		setPromptHints([]);
		setUserImage(null);
		if (!isMobileScreen) inputRef.current?.focus();
		setAutoScroll(false);
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
		// console.log(scrollRef.current);
		scrollDomToBottom();
	}

	const onInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (
			e.key === "ArrowUp" &&
			userInput.length <= 0 &&
			!(e.metaKey || e.altKey || e.ctrlKey)
		) {
			setUserInput(localStorage.getItem(LAST_INPUT_KEY) ?? "");
			setUserImage(localStorage.getItem(LAST_INPUT_IMAGE_KEY));

			e.preventDefault();
			return;
		}
		if (shouldSubmit(e) && promptHints.length === 0) {
			doSubmit(userInput, userImage);
			e.preventDefault();
		}
	};

	// only search prompts when user input is short
	const SEARCH_TEXT_LIMIT = 30;
	const onInput = (text: string) => {
		setUserInput(text);
		const n = text.trim().length;
		// clear search results
		if (n === 0) {
			setPromptHints([]);
		} else if (text.startsWith(ChatCommandPrefix)) {
			setPromptHints(chatCommands.search(text));
		} else if (!config.disablePromptHint && n < SEARCH_TEXT_LIMIT) {
			// check if need to trigger auto completion
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

	// remember unfinished input
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

	const handleSpeechRecognition = async (): Promise<void> => {
		console.log(voicetext);
		const text = await startSpeechToText();
		voicetext.push(text);
		console.log("after push", voicetext);

		console.log("voice text:", voicetext.join(" "));
		const fulltext = voicetext.join(" ");
		setUserInput(fulltext);
	};

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
				imageSelected={(img: any) => {
					setUserImage(img);
				}}
				session={session}
				index={props.index}
				workflows={props.session?.isworkflow}
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
						minHeight: textareaMinHeight,
					}}
				/>
				{userImage && (
					<div className={styles["chat-input-image"]}>
						<div
							style={{ position: "relative", width: "48px", height: "48px" }}
						>
							<Image
								loader={() => userImage.fileUrl}
								src={userImage.fileUrl}
								alt={userImage.filename}
								title={userImage.filename}
								layout="fill"
								objectFit="cover"
								objectPosition="center"
							/>
						</div>
						<button
							className={styles["chat-input-image-close"]}
							onClick={() => {
								setUserImage(null);
							}}
						>
							<CloseIcon />
						</button>
					</div>
				)}
				<IconButton
					icon={<SendWhiteIcon />}
					text=""
					className={styles["chat-input-send"]}
					type="primary"
					onClick={() => doSubmit(userInput, userImage)}
				/>
				<IconButton
					icon={<Record />}
					text=""
					className={styles["chat-input-voice"]}
					type="primary"
					onClick={() => handleSpeechRecognition()}
				/>
			</div>
		</div>
	);
}
