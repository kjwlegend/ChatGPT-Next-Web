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

import { oss_base } from "@/app/constant";
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
import styles from "@/app/(chat-pages)/chats/chat/chats.module.scss";

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

import { createChat, CreateChatData } from "@/app/api/backend/chat";
import useAuth from "@/app/hooks/useAuth";
import { message } from "antd";

import {
	useSubmitHandler,
	useScrollToBottom,
	ClearContextDivider,
} from "../../../../hooks/useGeneralChatHook";
import {
	startSpeechToText,
	convertTextToSpeech,
} from "@/app/utils/voicetotext";
import { useAllModels } from "@/app/utils/hooks";

import { createFromIconfontCN } from "@ant-design/icons";
export const IconFont = createFromIconfontCN({
	scriptUrl: "//at.alicdn.com/t/c/font_4149808_awi8njsz19j.js",
});

import { ChatActions } from "./components/chatactions";
import { DeleteImageButton, DeleteFileButton } from "./components/chatactions";
import { AttachImages } from "./components/AttachImages";

import {
	handlePasteEvent,
	uploadFile,
	uploadImage,
} from "./utils/fileUploader";
import { AttachFiles } from "./components/AttachFiles";
import { useDoSubmit } from "./hooks/useDoSubmit";
import { AppGeneralContext } from "@/app/contexts/AppContext";
import {
	useChatActions,
	useChatSetting,
	useSessions,
} from "../hooks/useChatContext";
import { sessionConfig } from "@/app/types/";
let voicetext: string[] = [];

export function Inputpanel(props: {
	index?: number;
	isworkflow: boolean;
	submitType?: "chat" | "workflow";
}) {
	const { index, isworkflow, submitType } = props;
	const config = useAppConfig();
	const session = useSessions();
	const isMobileScreen = useContext(AppGeneralContext).isMobile;

	const promptStore = usePromptStore();

	const inputRef = useRef<HTMLTextAreaElement>(null);
	const autoFocus = !isMobileScreen;

	const [userInput, setUserInput] = useState("");
	const [inputRows, setInputRows] = useState(2);
	const [userImage, setUserImage] = useState<any>();
	const [attachImages, setAttachImages] = useState<string[]>([]);
	const [uploading, setUploading] = useState(false);
	const [attachFiles, setAttachFiles] = useState<FileInfo[]>([]);

	const { setHitBottom, setShowPromptModal, setEnableAutoFlow } =
		useChatActions();
	const { hitBottom, showPromptModal, enableAutoFlow } = useChatSetting();

	const { submitKey, shouldSubmit } = useSubmitHandler();

	const textareaMinHeight = userImage ? 121 : 68;

	const { doSubmit, isLoading, contextHolder } = useDoSubmit(
		session,
		attachImages,
		attachFiles,
		props.submitType,
	);

	const handleSubmit = async () => {
		await doSubmit(userInput);
		setUserInput("");
		setAttachImages([]);
		setAttachFiles([]);
		if (!isMobileScreen) inputRef.current?.focus();
	};

	const onInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (
			e.key === "ArrowUp" &&
			userInput.length === 0 &&
			!e.metaKey &&
			!e.altKey &&
			!e.ctrlKey
		) {
			setUserInput(localStorage.getItem(LAST_INPUT_KEY) ?? "");
			setUserImage(localStorage.getItem(LAST_INPUT_IMAGE_KEY));
			e.preventDefault();
			return;
		}
		if (shouldSubmit(e)) {
			handleSubmit();
			e.preventDefault();
		}
	};

	const onInput = useCallback((text: string) => {
		// 简单的错误处理，防止输入过长
		setUserInput(text);
	}, []);

	const measure = useDebouncedCallback(
		() => {
			const rows = inputRef.current ? autoGrowTextArea(inputRef.current) : 1;
			setInputRows(Math.min(20, Math.max(2 + Number(!isMobileScreen), rows)));
		},
		100,
		{ leading: true, trailing: true },
	);

	useEffect(measure, [userInput]);

	useEffect(() => {
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
	}, [session.id, userInput]);

	const handlePaste = useCallback(
		(event: React.ClipboardEvent<HTMLTextAreaElement>) => {
			handlePasteEvent(event, {
				attachImages,
				setAttachImages,
				setUploading,
			});
		},
		[attachImages],
	);

	const handleUploadImage = useCallback(async () => {
		try {
			await uploadImage(setAttachImages);
		} catch (error) {
			console.error("上传图片失败:", error);
			// showToast(Locale.Chat.UploadImageFailed); // 假设showToast是一个显示提示信息的函数
		}
	}, [setAttachImages]);

	const handleUploadFile = useCallback(async () => {
		try {
			await uploadFile(setAttachFiles);
		} catch (error) {
			console.error("上传文件失败:", error);
			// showToast(Locale.Chat.UploadFileFailed); // 假设showToast是一个显示提示信息的函数
		}
	}, [setAttachFiles]);

	const handleSpeechRecognition = useCallback(async (): Promise<void> => {
		try {
			const text = await startSpeechToText();
			setUserInput((prev) => `${prev} ${text}`);
		} catch (error) {
			console.error("语音识别失败:", error);
			// showToast(Locale.Chat.SpeechRecognitionFailed); // 假设showToast是一个显示提示信息的函数
		}
	}, []);

	const handleShowPromptModal = useCallback(() => {
		setShowPromptModal(true);
	}, []);

	const handleimageSelected = useCallback(() => {
		setShowPromptModal(true);
	}, []);

	return (
		<div className={styles["chat-input-panel"]}>
			{/* {contextHolder} */}

			<ChatActions
				uploadImage={handleUploadImage}
				uploadFile={handleUploadFile}
				setAttachImages={setAttachImages}
				setAttachFiles={setAttachFiles}
				setUploading={setUploading}
				showPromptModal={handleShowPromptModal}
				hitBottom={hitBottom}
				uploading={uploading}
				session={session}
				index={props.index}
				workflow={isworkflow}
			/>
			<label
				className={`${styles["chat-input-panel-inner"]} ${
					attachImages.length != 0 || attachFiles.length != 0
						? styles["chat-input-panel-inner-attach"]
						: ""
				}`}
				htmlFor="chat-input"
			>
				<textarea
					ref={inputRef}
					className={styles["chat-input"]}
					placeholder={Locale.Chat.Input(submitKey)}
					onInput={(e) => onInput(e.currentTarget.value)}
					value={userInput}
					onKeyDown={onInputKeyDown}
					onPaste={handlePaste}
					rows={inputRows}
					autoFocus={autoFocus}
					style={{
						fontSize: config.fontSize,
						minHeight: textareaMinHeight,
					}}
				/>
				<AttachImages
					attachImages={attachImages}
					setAttachImages={setAttachImages}
				/>
				<AttachFiles
					attachFiles={attachFiles}
					setAttachFiles={setAttachFiles}
				/>

				<IconButton
					icon={<SendWhiteIcon />}
					text=""
					className={styles["chat-input-send"]}
					type="primary"
					onClick={() => handleSubmit()}
				/>
				<IconButton
					icon={<Record />}
					text=""
					className={styles["chat-input-voice"]}
					type="primary"
					onClick={() => handleSpeechRecognition()}
				/>
			</label>
		</div>
	);
}
