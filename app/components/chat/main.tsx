"use client";
import React, {
	useState,
	useRef,
	useEffect,
	useMemo,
	useCallback,
	Fragment,
} from "react";
import { useDebouncedCallback } from "use-debounce";
import dynamic from "next/dynamic";

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
import { api } from "@/app/client/api";
import { ChatControllerPool } from "@/app/client/controller";
import { Prompt, usePromptStore } from "@/app/store/prompt";
import { useMaskStore } from "@/app/store/mask";
import { useChatCommand, useCommand } from "@/app/command";
import { getClientConfig } from "@/app/config/client";
import useAuth from "@/app/hooks/useAuth";
import { getISOLang, getLang } from "@/app/locales";
import {
	copyToClipboard,
	selectOrCopy,
	autoGrowTextArea,
	useMobileScreen,
} from "@/app/utils";
import {
	CHAT_PAGE_SIZE,
	LAST_INPUT_KEY,
	MAX_RENDER_MSG_COUNT,
	Path,
	REQUEST_TIMEOUT_MS,
} from "@/app/constant";
import { prettyObject } from "@/app/utils/format";

import BrainIcon from "@/app/icons/brain.svg";
import LoadingIcon from "@/app/icons/three-dots.svg";

import styles from "@/app/components/chat/multi-chats.module.scss";

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
import { Avatar } from "@/app/components/emoji";
import { Avatar as UserAvatar } from "antd";
import { ContextPrompts, MaskAvatar, MaskConfig } from "@/app/components/mask";
import { ExportMessageModal } from "@/app/components/exporter";
import { useAuthStore } from "@/app/store/auth";
import { createChat, CreateChatData } from "@/app/api/chat";

import { ChatActions, ChatAction, Inputpanel } from "./Inputpanel";
import {
	useSubmitHandler,
	useScrollToBottom,
	ClearContextDivider,
} from "./chat-controller";
import WindowHeaer from "./WindowHeader";
import { Chatbody } from "./Chatbody";

interface ChatContextType {
	hitBottom: boolean;
	setHitBottom: React.Dispatch<React.SetStateAction<boolean>>;
	showPromptModal: boolean;
	setShowPromptModal: React.Dispatch<React.SetStateAction<boolean>>;
	userInput: string;
	setUserInput: React.Dispatch<React.SetStateAction<string>>;
	scrollRef: React.RefObject<HTMLDivElement>;
}

// 创建 ChatContext 上下文对象
export const ChatContext = React.createContext<ChatContextType>({
	hitBottom: true,
	setHitBottom: () => void 0,
	showPromptModal: false,
	setShowPromptModal: () => void 0,
	userInput: "",
	setUserInput: () => void 0,
	scrollRef: React.createRef<HTMLDivElement>(),
});

export function Loading(props: { noLogo?: boolean }) {
	return (
		<div className={styles["loading-content"] + " no-dark"}>
			{!props.noLogo && <BrainIcon />}
			<LoadingIcon />
		</div>
	);
}

export type RenderPompt = Pick<Prompt, "title" | "content">;

function _Chat() {
	const chatStore = useChatStore();
	const session = chatStore.currentSession();

	const [hitBottom, setHitBottom] = useState(true);
	const [showPromptModal, setShowPromptModal] = useState(false);
	const [userInput, setUserInput] = useState("");
	const scrollRef = useRef<HTMLDivElement>(null);

	const config = useAppConfig();

	const inputRef = useRef<HTMLTextAreaElement>(null);

	const isMobileScreen = useMobileScreen();

	useEffect(() => {
		chatStore.updateCurrentSession((session) => {
			const stopTiming = Date.now() - REQUEST_TIMEOUT_MS;
			session.messages.forEach((m) => {
				// check if should stop all stale messages
				if (m.isError || new Date(m.date).getTime() < stopTiming) {
					if (m.streaming) {
						m.streaming = false;
					}

					if (m.content.length === 0) {
						m.isError = true;
						m.content = prettyObject({
							error: true,
							message: "empty response",
						});
					}
				}
			});
			// auto sync mask config from global config
			if (session.mask.syncGlobalConfig) {
				console.log("[Mask] syncing from global, name = ", session.mask.name);
				session.mask.modelConfig = { ...config.modelConfig };
			}
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const clientConfig = useMemo(() => getClientConfig(), []);

	return (
		<div className={styles.chat} key={session.id}>
			<ChatContext.Provider
				value={{
					hitBottom,
					setHitBottom,
					showPromptModal,
					setShowPromptModal,
					userInput,
					setUserInput,
					scrollRef,
				}}
			>
				<WindowHeaer />
				<Chatbody />
				<Inputpanel />
			</ChatContext.Provider>
		</div>
	);
}

export function useLoadData() {
	const config = useAppConfig();

	useEffect(() => {
		(async () => {
			const models = await api.llm.models();
			config.mergeModels(models);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
}

export function Chat() {
	const chatStore = useChatStore();
	const sessionIndex = chatStore.currentSessionIndex;
	return <_Chat key={sessionIndex}></_Chat>;
}
