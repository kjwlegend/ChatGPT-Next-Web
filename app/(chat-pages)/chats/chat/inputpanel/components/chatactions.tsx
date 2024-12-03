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

import BottomIcon from "@/app/icons/bottom.svg";
import StopIcon from "@/app/icons/pause.svg";
import DeleteIcon from "@/app/icons/clear.svg";

import LoadingIcon from "@/app/icons/three-dots.svg";
import LoadingButtonIcon from "@/app/icons/loading.svg";
import ImageIcon from "@/app/icons/image.svg";

import { oss_base } from "@/app/constant";
import CheckmarkIcon from "@/app/icons/checkmark.svg";
import { FileInfo } from "@/app/client/platforms/utils";

import { useAccessStore, useAppConfig, useUserStore } from "@/app/store";
import { useChatStore } from "@/app/store/chat/index";
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

import styles from "../../chats.module.scss";

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

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
	TooltipProvider,
} from "@/components/ui/tooltip";
import {
	Globe,
	Image,
	Mic,
	Network,
	Paperclip,
	Send,
	Settings,
	Sparkles,
	Upload,
} from "lucide-react";

export const IconFont = createFromIconfontCN({
	scriptUrl: "//at.alicdn.com/t/c/font_4149808_awi8njsz19j.js",
});

const ChatActionComponent = (props: {
	text: string;
	icon: JSX.Element;
	loding?: boolean;
	innerNode?: JSX.Element;
	onClick: () => void;
	type?: "default" | "dropdown";
	dropdownItems?: MenuProps;
	hidetext?: boolean | undefined;
}) => {
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
};
ChatActionComponent.displayName = "ChatAction";

export const ChatAction = ChatActionComponent;

export const ChatActions = memo(
	(props: {
		uploadImage: () => void;
		setAttachImages: (images: string[]) => void;
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
		const session = props.session
			? props.session
			: chatStore.selectCurrentSession();
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

		const usePlugins = session.mask.plugins;

		// 判断plugins是否包含web-search
		const webSearchEnabled =
			session.mask.plugins?.includes("web-search") ?? false;

		// console.log("plugins", usePlugins, "webSearchEnabled", webSearchEnabled);
		const [isWebSearchEnabled, setIsWebSearchEnabled] =
			useState(webSearchEnabled);
		const [showModelSelector, setShowModelSelector] = useState(false);
		const [showUploadImage, setShowUploadImage] = useState(false);
		const [showUploadFile, setShowUploadFile] = useState(false);

		const pluginStore = usePluginStore();
		const [sessionPlugins, setSessionPlugins] = useState(
			session?.mask?.plugins || [],
		);

		const handleWebSearchEnabled = () => {
			setIsWebSearchEnabled(!isWebSearchEnabled);
			sessionConfigUpdate(updateType, {
				sessionId: sessionId,
				groupId: workflowGroupId,
				updates: {
					mask: {
						...session.mask,
						plugins: isWebSearchEnabled
							? session.mask.plugins.filter(
									(p) => p !== "web-search" && p !== "web-browser",
								)
							: [...session.mask.plugins, "web-search", "web-browser"],
					},
				},
			});
		};

		useEffect(() => {
			setSessionPlugins(session?.mask?.plugins || []);
		}, [session?.mask?.plugins]);

		const availablePlugins = useMemo(() => {
			return pluginStore.getAll().filter((p) => getLang() === p.lang);
		}, [pluginStore]);

		const items: MenuProps["items"] = useMemo(() => {
			if (!session?.mask) return [];

			return availablePlugins.map((p) => ({
				key: p.name,
				label: (
					<Checkbox
						checked={sessionPlugins.includes(p.toolName ?? p.name)}
						onChange={(e) => {
							if (!session?.mask) return;

							const updatedPlugins = e.target.checked
								? [...sessionPlugins, p.toolName ?? p.name]
								: sessionPlugins.filter(
										(name) => name !== (p.toolName ?? p.name),
									);

							sessionConfigUpdate(updateType, {
								sessionId: sessionId,
								groupId: workflowGroupId,
								updates: {
									mask: {
										...session.mask,
										plugins: updatedPlugins,
									},
								},
							});

							setSessionPlugins(updatedPlugins);
							switchUsePlugins();
						}}
						onClick={(e) => {
							e.stopPropagation();
						}}
					>
						{p.name}
					</Checkbox>
				),
			}));
		}, [
			availablePlugins,
			sessionPlugins,
			session?.mask,
			sessionId,
			workflowGroupId,
			updateType,
		]);

		function switchUsePlugins() {
			if (!session?.id) return;

			chatStore.updateSession(
				session.id,
				(updatedSession) => {
					if (updatedSession.mask) {
						updatedSession.mask.usePlugins = sessionPlugins.length > 0;
					}
				},
				false,
			);
		}

		// stop all responses
		const couldStop = ChatControllerPool.hasPending();
		const stopAll = () => ChatControllerPool.stopAll();

		// switch model
		const currentModel = session.mask.modelConfig.model;

		useEffect(() => {
			const show = isVisionModel(currentModel);

			if (show !== showUploadImage) {
				setShowUploadImage(show);
			}

			const showFile = isEnableRAG;

			setShowUploadFile(showFile);

			// Only update parent component state when currentModel changes and show is false
			if (!show) {
				// Use setTimeout to avoid updating parent component state in the current render cycle
				setTimeout(() => {
					props.setAttachImages([]);
					props.setUploading(false);
				}, 0);
			}
		}, [currentModel, isEnableRAG, showUploadImage, showUploadFile, props]);

		const chatInjection = session.mask.modelConfig;
		const [enableUserInfo, setEnableUserInfo] = useState(
			chatInjection.enableUserInfos,
		);
		const [enableRelatedQuestions, setEnableRelatedQuestions] = useState(
			chatInjection.enableRelatedQuestions,
		);

		const handleInjectUserInfo = () => {
			const newEnableUserInfos = !enableUserInfo;
			sessionConfigUpdate(updateType, {
				sessionId: sessionId,
				groupId: workflowGroupId,
				updates: {
					mask: {
						...session.mask,
						modelConfig: {
							...session.mask.modelConfig,
							enableUserInfos: newEnableUserInfos,
						},
					},
				},
			});
			setEnableUserInfo(newEnableUserInfos);
		};

		const handleInjectRelatedQuestions = () => {
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
			setEnableRelatedQuestions(newstate);
		};

		return (
			<div className={styles["chat-input-actions"]}>
				<div>
					{couldStop && (
						<ChatAction
							onClick={stopAll}
							text={Locale.Chat.InputActions.Stop}
							icon={<StopIcon />}
							hidetext={props.workflow ? true : false}
						/>
					)}
					{!props.hitBottom && (
						<ChatAction
							onClick={() => {}}
							text={Locale.Chat.InputActions.ToBottom}
							icon={<BottomIcon />}
							hidetext={props.workflow ? true : false}
						/>
					)}
					{props.hitBottom && (
						<ChatAction
							onClick={props.showPromptModal}
							text={Locale.Chat.InputActions.Settings}
							icon={<SettingTwoTone style={{ fontSize: "15px" }} />}
							hidetext={props.workflow ? true : false}
						/>
					)}

					{config.pluginConfig.enable && (
						<ChatAction
							onClick={switchUsePlugins}
							text={
								sessionPlugins.length > 0
									? Locale.Chat.InputActions.DisablePlugins
									: Locale.Chat.InputActions.EnablePlugins
							}
							icon={
								sessionPlugins.length > 0 ? (
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
							hidetext={props.workflow ? true : false}
						/>
					)}

					<ChatAction
						icon={
							<Globe
								className={`h-4 w-4 transition-colors duration-200 ${isWebSearchEnabled ? "text-blue-500" : ""}`}
							/>
						}
						onClick={handleWebSearchEnabled}
						text={isWebSearchEnabled ? "关闭联网" : "开启联网"}
					/>
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
				<div className="ml-auto flex items-center gap-1">
					{/* placeholder */}
				</div>
			</div>
		);
	},
);
ChatActions.displayName = "ChatActions";

// simple Chatactions ,只保留上传图片和文件, 用于多轮对话

// 简化版 ChatActions，只保留上传图片和文件功能
const SimpleChatActionsComponent = memo(
	(props: { uploadImage: () => void; uploading: boolean }) => {
		const [showUploadImage, setShowUploadImage] = useState(false);
		const [showUploadFile, setShowUploadFile] = useState(false);
		const config = useAppConfig();
		const currentModel = config.modelConfig.model;

		useEffect(() => {
			const show = isVisionModel(currentModel);
			setShowUploadImage(show);
			setShowUploadFile(show);
		}, [currentModel]);

		return (
			<div className={styles["chat-input-actions"]}>
				<div>
					{showUploadImage && (
						<ChatAction
							onClick={props.uploadImage}
							text={Locale.Chat.InputActions.UploadImage}
							icon={props.uploading ? <LoadingButtonIcon /> : <ImageIcon />}
						/>
					)}
				</div>
			</div>
		);
	},
);
SimpleChatActionsComponent.displayName = "SimpleChatActions";

export const SimpleChatActions = SimpleChatActionsComponent;

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
