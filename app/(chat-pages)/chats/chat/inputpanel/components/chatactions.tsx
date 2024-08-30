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
	useCallback,
	useLayoutEffect,
	memo,
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
import DeleteIcon from "@/app/icons/clear.svg";

import LoadingIcon from "@/app/icons/three-dots.svg";
import LoadingButtonIcon from "@/app/icons/loading.svg";
import ImageIcon from "@/app/icons/image.svg";

import { oss } from "@/app/constant";
import CheckmarkIcon from "@/app/icons/checkmark.svg";
import { FileInfo } from "@/app/client/platforms/utils";

import {
	PauseOutlined,
	PlayCircleOutlined,
	DeleteOutlined,
	HeartTwoTone,
} from "@ant-design/icons";

import { ChatMessage, ChatSession } from "@/app/types/chat";

import {
	SubmitKey,
	useChatStore,
	BOT_HELLO,
	createMessage,
	useAccessStore,
	Theme,
	useAppConfig,
	ModelType,
	useUserStore,
} from "@/app/store";

import { MULTI_AGENT_DEFAULT_TOPIC } from "@/app/store/multiagents";
import {
	copyToClipboard,
	selectOrCopy,
	autoGrowTextArea,
	getMessageTextContent,
	getMessageImages,
	isVisionModel,
	isFirefox,
	isSupportRAGModel,
} from "@/app/utils";

import { useMobileScreen } from "@/app/hooks/useMobileScreen";

import { api } from "@/app/client/api";

import { ChatControllerPool } from "@/app/client/controller";
import { Prompt, usePromptStore } from "@/app/store/prompt";
import Locale from "@/app/locales";

import { IconButton } from "@/app/components/button";
import styles from "../../chats.module.scss";

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

import { Radio, Switch } from "antd";
import { useMaskStore } from "@/app/store/mask";
import { ChatCommandPrefix, useChatCommand, useCommand } from "@/app/command";
import Image from "next/image";

import {
	startSpeechToText,
	convertTextToSpeech,
} from "@/app/utils/voicetotext";
import { useAllModels } from "@/app/utils/hooks";

import {
	ApiTwoTone,
	ThunderboltTwoTone,
	SettingTwoTone,
	MessageTwoTone,
} from "@ant-design/icons";

import { Dropdown, MenuProps, Checkbox, Divider } from "antd";
import { type } from "os";
import { usePluginStore } from "@/app/store/plugin";

import { compressImage } from "@/app/utils/chat/chat";
import { ClientApi } from "@/app/client/api";

import { createFromIconfontCN } from "@ant-design/icons";
import { AppGeneralContext } from "@/app/contexts/AppContext";
import { sessionConfig } from "@/app/types/";
import { sessionConfigUpdate } from "../../../utils/chatUtils";
export const IconFont = createFromIconfontCN({
	scriptUrl: "//at.alicdn.com/t/c/font_4149808_awi8njsz19j.js",
});
export function ChatAction(props: {
	text: string;
	icon: JSX.Element;
	loding?: boolean;
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

	const isMobileScreen = useContext(AppGeneralContext).isMobile;

	const updateWidth = useCallback(() => {
		if (!iconRef.current || !textRef.current) return;
		const getWidth = (dom: HTMLDivElement) => dom.getBoundingClientRect().width;
		const textWidth = getWidth(textRef.current);
		const iconWidth = getWidth(iconRef.current);
		setWidth({
			full: textWidth + iconWidth,
			icon: iconWidth,
		});
	}, [iconRef, textRef]);

	useLayoutEffect(() => {
		if (!isMobileScreen) {
			updateWidth(); // Update width on mount for non-mobile screens
		}
	}, [isMobileScreen, updateWidth]);

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

	const commonStyle =
		isMobileScreen || props.hidetext
			? ({
					"--icon-width": `${width.icon}px`,
					"--full-width": `${width.full}px`,
				} as React.CSSProperties)
			: ({
					width: "auto",
				} as React.CSSProperties);

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
					style={commonStyle}
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
				style={commonStyle}
			>
				{actionContent}
			</div>
		);
	}
}

export const ChatActions = memo(
	(props: {
		uploadImage: () => void;
		setAttachImages: (images: string[]) => void;
		uploadFile: () => void;
		setAttachFiles: (files: FileInfo[]) => void;
		setUploading: (uploading: boolean) => void;
		showPromptModal: () => void;
		hitBottom: boolean;
		uploading: boolean;
		session: sessionConfig;
		index?: number;
		workflow?: boolean;
	}) => {
		const config = useAppConfig();
		const chatStore = useChatStore.getState();
		const session = props.session ? props.session : chatStore.currentSession();
		const sessionId = session.id;
		const { basic_chat_balance } = useUserStore.getState().user.user_balance;

		const accessStore = useAccessStore();
		const isEnableRAG = useMemo(
			() => accessStore.enableRAG(),
			// eslint-disable-next-line react-hooks/exhaustive-deps
			[],
		);

		const updateType = props.workflow ? "workflow" : "chat";
		const workflowGroupId = props.workflow ? session.workflow_group_id : null;

		const fileInputRef = React.useRef<HTMLInputElement>(null);

		const usePlugins = session.mask.usePlugins;

		const [showModelSelector, setShowModelSelector] = useState(false);
		const [showUploadImage, setShowUploadImage] = useState(false);
		const [showUploadFile, setShowUploadFile] = useState(false);

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

		const availablePlugins = usePluginStore()
			.getAll()
			.filter((p) => getLang() === p.lang);

		if (!session.mask.plugins) {
			session.mask.plugins = [];
		}

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

		useEffect(() => {
			const show = isVisionModel(currentModel);

			if (show !== showUploadImage) {
				setShowUploadImage(show);
			}

			const showFile = isEnableRAG && isSupportRAGModel(currentModel);
			if (showFile !== showUploadFile) {
				setShowUploadFile(showFile);
			}

			// 只有在 currentModel 发生变化且 show 为 false 时才更新父组件状态
			if (!show) {
				// 使用 setTimeout 来避免在当前渲染周期中更新父组件状态
				setTimeout(() => {
					props.setAttachImages([]);
					props.setUploading(false);
				}, 0);
			}
			// 这里确保 useEffect 仅在 currentModel 发生变化时触发
		}, [currentModel]);

		const chatInjection = session.mask.modelConfig;
		const [enableUserInfo, setEnableUserInfo] = useState(
			chatInjection.enableUserInfos,
		);
		const [enableRelatedQuestions, setEnableRelatedQuestions] = useState(
			chatInjection.enableRelatedQuestions,
		);

		const handleInjectUserInfo = () => {
			chatStore.updateSession(sessionId, () => {
				session.mask.modelConfig.enableUserInfos =
					!session.mask.modelConfig.enableUserInfos;
			});
			setEnableUserInfo(session.mask.modelConfig.enableUserInfos);
		};

		const handleInjectRelatedQuestions = () => {
			// chatStore.updateSession(sessionId, () => {
			// 	session.mask.modelConfig.enableRelatedQuestions =
			// 		!session.mask.modelConfig.enableRelatedQuestions;

			// });

			const newstate = !enableRelatedQuestions;

			sessionConfigUpdate(updateType, {
				sessionId: sessionId,
				groupId: workflowGroupId,
				updates: {
					mask: {
						...session.mask,
						modelConfig: {
							...session.mask.modelConfig,
							enableRelatedQuestions: newstate,
						},
					},
				},
			});
			setEnableRelatedQuestions(!enableRelatedQuestions);
		};

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
							onClick={() => {}}
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
					{/* <ChatAction
					onClick={() => setShowModelSelector(true)}
					text={currentModel}
					icon={<MessageTwoTone style={{ fontSize: "15px" }} />}
					hidetext={props.workflows ? true : false}
				/> */}

					{showUploadImage && (
						<ChatAction
							onClick={props.uploadImage}
							text={Locale.Chat.InputActions.UploadImage}
							icon={props.uploading ? <LoadingButtonIcon /> : <ImageIcon />}
						/>
					)}

					{showUploadFile && (
						<ChatAction
							onClick={props.uploadFile}
							text={Locale.Chat.InputActions.UploadFle}
							icon={props.uploading ? <LoadingButtonIcon /> : <UploadIcon />}
						/>
					)}

					{config.pluginConfig.enable && (
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

					<ChatAction
						icon={
							enableRelatedQuestions ? (
								<IconFont
									type="iconfont-Thinking"
									style={{ fontSize: "15px" }}
								/>
							) : (
								<IconFont
									type="iconfont-think-fill"
									style={{ fontSize: "15px" }}
								/>
							)
						}
						onClick={handleInjectRelatedQuestions}
						text={enableRelatedQuestions ? "关闭联想" : "开启联想"}
					/>

					<ChatAction
						icon={
							enableUserInfo ? (
								<IconFont
									type="iconfont-user-active"
									style={{ fontSize: "15px" }}
								/>
							) : (
								<IconFont type="iconfont-user" style={{ fontSize: "15px" }} />
							)
						}
						onClick={handleInjectUserInfo}
						text={enableUserInfo ? "个性化" : "通用"}
					/>
				</div>
				<div>
					<div>
						{/* 展示用户余额 */}
						<span className={styles["chat-balance"]}>
							对话余额: {basic_chat_balance}
						</span>
					</div>
				</div>
			</div>
		);
	},
);

export function DeleteImageButton(props: { deleteImage: () => void }) {
	return (
		<div className={styles["delete-image"]} onClick={props.deleteImage}>
			<DeleteIcon />
		</div>
	);
}

export function DeleteFileButton(props: { deleteFile: () => void }) {
	return (
		<div className={styles["delete-file"]} onClick={props.deleteFile}>
			<DeleteIcon />
		</div>
	);
}
