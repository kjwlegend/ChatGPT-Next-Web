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
import styles from "../chats.module.scss";

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
} from "../../hooks/useChathooks";
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
export const IconFont = createFromIconfontCN({
	scriptUrl: "//at.alicdn.com/t/c/font_4149808_awi8njsz19j.js",
});

export type RenderPompt = Pick<Prompt, "title" | "content">;

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
