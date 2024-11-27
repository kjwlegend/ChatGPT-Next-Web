"use client";
import React, {
	useState,
	useRef,
	useEffect,
	useMemo,
	useCallback,
	Fragment,
	memo,
	useContext,
} from "react";
import { useDebouncedCallback } from "use-debounce";
import dynamic from "next/dynamic";
import { ChatMessage, ChatSession } from "@/app/types/chat";

import { useAppConfig } from "@/app/store";
import { useChatStore } from "@/app/store/chat/index";

import { api } from "@/app/client/api";
import { Prompt, usePromptStore } from "@/app/store/prompt";

import {
	CHAT_PAGE_SIZE,
	LAST_INPUT_KEY,
	MAX_RENDER_MSG_COUNT,
	Path,
} from "@/app/constant";

import styles from "./chats.module.scss";

import { WindowHeader } from "./chat-header/WindowHeader";

import { useNavigate } from "react-router-dom";
import { workflowChatSession } from "@/app/types/";
import { createContext } from "vm";
import { ChatProvider, useChatActions } from "./hooks/useChatContext";

const ChatbodyDynamic = dynamic(
	async () => (await import("./chatbody/Chatbody")).Chatbody,
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
export type RenderPompt = Pick<Prompt, "title" | "content">;

interface ChatProps {
	_session: ChatSession | workflowChatSession | undefined;
	key?: number | string;
	index?: number;
	isworkflow: boolean;
	submitType: "chat" | "workflow" | undefined;
	storeType: string;
	className?: string;
}

export const _Chat: React.FC<ChatProps> = memo((props) => {
	const { _session, index, isworkflow, submitType, storeType, className } =
		props;
	const chatStore = useChatStore.getState();
	const { setSession } = useChatActions();

	useEffect(() => {
		if (_session) {
			setSession(_session);
		}
	}, [_session, setSession]);

	const commonProps = useMemo(
		() => ({
			index,
			isworkflow,
		}),
		[index, isworkflow],
	);

	if (!_session) return null;

	const sessionId = _session.id;

	return (
		<ChatProvider _session={_session} storeType={storeType}>
			<div
				className={`${styles.chat} ${isworkflow ? styles["workflow-chat"] : ""} ${className}`}
				key={sessionId}
				data-index={sessionId}
			>
				<WindowHeader {...commonProps} />
				<ChatbodyDynamic {...commonProps} />
				<InputpanelDynamic {...commonProps} submitType={submitType} />
			</div>
		</ChatProvider>
	);
});

_Chat.displayName = "Chat";
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
	const sessionIndex = chatStore.selectCurrentSessionIndex();
	const session = chatStore.selectCurrentSession();
	const navigate = useNavigate();

	useEffect(() => {
		if (!session) {
			navigate(Path.NewChat);
		}
	}, []);

	if (!session) {
		return null;
	}

	return (
		<_Chat
			_session={session}
			key={`main-chat-${session.id}`}
			index={sessionIndex}
			isworkflow={false}
			submitType="chat"
			storeType="chatstore"
		></_Chat>
	);
}
