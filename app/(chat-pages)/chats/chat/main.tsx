"use client";
import React, {
	useState,
	useRef,
	useEffect,
	useMemo,
	useCallback,
	Fragment,
	memo,
} from "react";
import { useDebouncedCallback } from "use-debounce";
import dynamic from "next/dynamic";
import { ChatMessage, ChatSession } from "@/app/types/chat";

import {
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

import {
	CHAT_PAGE_SIZE,
	LAST_INPUT_KEY,
	MAX_RENDER_MSG_COUNT,
	Path,
	REQUEST_TIMEOUT_MS,
} from "@/app/constant";
import { prettyObject } from "@/app/utils/format";

import styles from "./chats.module.scss";

import { WindowHeader } from "./WindowHeader";

import { useScrollToBottom } from "./useChathooks";
import { useNavigate } from "react-router-dom";
import { workflowChatSession } from "@/app/store/workflow";

const ChatbodyDynamic = dynamic(
	async () => (await import("./Chatbody")).Chatbody,
	{
		ssr: false,
	},
);
const InputpanelDynamic = dynamic(
	async () => (await import("./inputpanel/Inputpanel")).Inputpanel,
	{
		ssr: false,
	},
);
interface ChatContextType {
	hitBottom: boolean;
	setHitBottom: React.Dispatch<React.SetStateAction<boolean>>;
	showPromptModal: boolean;
	setShowPromptModal: React.Dispatch<React.SetStateAction<boolean>>;
	autoScroll: boolean;
	setAutoScroll: React.Dispatch<React.SetStateAction<boolean>>;
	userInput: string;
	setUserInput: React.Dispatch<React.SetStateAction<string>>;
	scrollRef: React.RefObject<HTMLDivElement>;
	enableAutoFlow: boolean;
	setEnableAutoFlow: React.Dispatch<React.SetStateAction<boolean>>;
	userImage: any;
	setUserImage: React.Dispatch<React.SetStateAction<any>>;
	session: any;
	submitType: "chat" | "workflow" | undefined;
}

// 创建 ChatContext 上下文对象
export const ChatContext = React.createContext<ChatContextType>({
	hitBottom: true,
	setHitBottom: () => void 0,
	showPromptModal: false,
	setShowPromptModal: () => void 0,
	autoScroll: true,
	setAutoScroll: () => void 0,
	userInput: "",
	setUserInput: () => void 0,
	scrollRef: React.createRef<HTMLDivElement>(),
	enableAutoFlow: false,
	setEnableAutoFlow: () => void 0,
	userImage: "",
	setUserImage: () => void 0,
	session: {},
	submitType: "chat",
});

export type RenderPompt = Pick<Prompt, "title" | "content">;

interface ChatProps {
	_session: ChatSession | workflowChatSession | undefined;
	key?: number | string;
	index?: number;
	isworkflow: boolean;
	submitType: "chat" | "workflow" | undefined;
}

export const _Chat: React.FC<ChatProps> = memo((props) => {
	const { _session, index, isworkflow, submitType } = props;
	const chatStore = useChatStore();

	// if props._session is not provided, use current session

	const session = _session;

	if (!session) return;

	const sessionId = session.id;

	const [hitBottom, setHitBottom] = useState(true);
	const [showPromptModal, setShowPromptModal] = useState(false);
	const [userInput, setUserInput] = useState("");
	const [enableAutoFlow, setEnableAutoFlow] = useState(false);
	const [userImage, setUserImage] = useState<any>();
	const { autoScroll, setAutoScroll, scrollDomToBottom, scrollRef } =
		useScrollToBottom();

	if (!session) return null;

	return (
		<div
			className={`${styles.chat} ${isworkflow ? styles["workflow-chat"] : ""}`}
			key={sessionId}
			data-index={sessionId}
		>
			<ChatContext.Provider
				value={{
					hitBottom,
					setHitBottom,
					autoScroll,
					setAutoScroll,
					showPromptModal,
					setShowPromptModal,
					userInput,
					setUserInput,
					scrollRef,
					enableAutoFlow,
					setEnableAutoFlow,
					userImage,
					setUserImage,
					session,
					submitType,
				}}
			>
				{/* TODO  windowheader 有bug */}
				<WindowHeader
					_session={session}
					index={index}
					isworkflow={isworkflow}
				/>
				<ChatbodyDynamic
					_session={session}
					index={index}
					isworkflow={isworkflow}
				/>
				<InputpanelDynamic
					_session={session}
					index={index}
					submitType={submitType}
				/>
			</ChatContext.Provider>
		</div>
	);
});

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
	const sessions = chatStore.sessions;
	const session = chatStore.currentSession();
	const navigate = useNavigate();

	if (sessions.length === 0) {
		navigate(Path.NewChat);
		return null;
	}
	// if (!sessionIndex) return null;
	return (
		<_Chat
			_session={session}
			key={sessionIndex}
			index={sessionIndex}
			isworkflow={false}
			submitType="chat"
		></_Chat>
	);
}
