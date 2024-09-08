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
	useMobileScreen,
	getMessageTextContent,
	getMessageImages,
	isVisionModel,
	isFirefox,
	isSupportRAGModel,
} from "@/app/utils";

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

import { createChat, CreateChatData } from "@/app/api/backend/chat";
import useAuth from "@/app/hooks/useAuth";
import { message } from "antd";

import { ChatContext } from "../../main";
// import { ChatContext } from "@/app/workflow-chats/context";
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
import { submitChatMessage } from "@/app/services/chatservice";

import { compressImage } from "@/app/utils/chat/chat";
import { ClientApi } from "@/app/client/api";

import { createFromIconfontCN } from "@ant-design/icons";

type FileProcessFunction<T> = (file: File) => Promise<T>;
type UploadCallback<T> = (files: T[]) => void;

async function uploadFiles<T>(
	acceptTypes: string,
	processFile: FileProcessFunction<T>,
	callback: UploadCallback<T>,
) {
	const fileInput = document.createElement("input");
	fileInput.type = "file";
	fileInput.accept = acceptTypes;
	fileInput.multiple = true;

	fileInput.onchange = (event: any) => {
		const files = event.target.files;
		const fileDatas: T[] = [];
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			processFile(file)
				.then((fileData) => {
					fileDatas.push(fileData);
					if (fileDatas.length === 3 || fileDatas.length === files.length) {
						callback(fileDatas);
					}
				})
				.catch((e) => {
					console.error(e);
				});
		}
	};
	fileInput.click();
}

// 文件路径: src/components/YourComponent.tsx

export const uploadImage = async (
	setAttachImages: (images: string[]) => void,
) => {
	const attachImages: string[] = [];

	const processImage = (file: File): Promise<string> => {
		return compressImage(file, 256 * 1024);
	};

	uploadFiles<string>(
		"image/png, image/jpeg, image/webp, image.heic, image.heif",
		processImage,
		(images) => {
			attachImages.push(...images);
			if (attachImages.length > 3) {
				attachImages.splice(3, attachImages.length - 3);
			}
			setAttachImages(attachImages);
		},
	);
};

export const uploadFile = async (
	setAttachFiles: (files: FileInfo[]) => void,
) => {
	const attachFiles: FileInfo[] = [];

	const processFile = (file: File): Promise<FileInfo> => {
		const api = new ClientApi();
		return api.file.upload(file);
	};

	uploadFiles<FileInfo>(
		".pdf,.txt,.md,.json,.csv,.docx,.srt,.mp3",
		processFile,
		(files) => {
			attachFiles.push(...files);
			if (attachFiles.length > 5) {
				attachFiles.splice(5, attachFiles.length - 5);
			}
			setAttachFiles(attachFiles);
		},
	);
};

interface HandlePasteOptions {
	attachImages: string[];
	setAttachImages: (images: string[]) => void;
	setUploading: (uploading: boolean) => void;
	maxImages?: number;
}

export const handlePasteEvent = async (
	event: React.ClipboardEvent<HTMLTextAreaElement>,
	options: HandlePasteOptions,
) => {
	const {
		attachImages,
		setAttachImages,
		setUploading,
		maxImages = 3,
	} = options;

	const items = (event.clipboardData || (window as any).clipboardData).items;
	for (const item of items) {
		if (item.kind === "file" && item.type.startsWith("image/")) {
			event.preventDefault();
			const file = item.getAsFile();
			if (file) {
				const images: string[] = [...attachImages];
				images.push(
					...(await new Promise<string[]>((res, rej) => {
						setUploading(true);
						const imagesData: string[] = [];
						compressImage(file, 256 * 1024)
							.then((dataUrl) => {
								imagesData.push(dataUrl);
								setUploading(false);
								res(imagesData);
							})
							.catch((e) => {
								setUploading(false);
								rej(e);
							});
					})),
				);

				if (images.length > maxImages) {
					images.splice(maxImages);
				}
				setAttachImages(images);
			}
		}
	}
};
