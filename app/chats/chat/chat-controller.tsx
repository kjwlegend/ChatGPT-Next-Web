"use client";
import { useDebouncedCallback } from "use-debounce";
import React, {
	useState,
	useRef,
	useEffect,
	useMemo,
	useCallback,
	Fragment,
} from "react";

import { getISOLang, getLang } from "@/app/locales";

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

import dynamic from "next/dynamic";

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
} from "@/app/constant";
import { Avatar } from "@/app/components/emoji";
import { Avatar as UserAvatar } from "antd";
import {
	ContextPrompts,
	MaskAvatar,
	MaskConfig,
} from "@/app/chats/mask-components";

import { useMaskStore } from "@/app/store/mask";
import { ChatCommandPrefix, useChatCommand, useCommand } from "@/app/command";
import { prettyObject } from "@/app/utils/format";
import { ExportMessageModal } from "@/app/chats/exporter";
import { getClientConfig } from "@/app/config/client";
import { useAuthStore } from "@/app/store/auth";
import { createChat, CreateChatData } from "@/app/api/backend/chat";
import useAuth from "@/app/hooks/useAuth";
import { message } from "antd";

export function useSubmitHandler() {
	const config = useAppConfig();
	const submitKey = config.submitKey;
	const isComposing = useRef(false);

	useEffect(() => {
		const onCompositionStart = () => {
			isComposing.current = true;
		};
		const onCompositionEnd = () => {
			isComposing.current = false;
		};

		window.addEventListener("compositionstart", onCompositionStart);
		window.addEventListener("compositionend", onCompositionEnd);

		return () => {
			window.removeEventListener("compositionstart", onCompositionStart);
			window.removeEventListener("compositionend", onCompositionEnd);
		};
	}, []);

	const shouldSubmit = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key !== "Enter") return false;
		if (e.key === "Enter" && (e.nativeEvent.isComposing || isComposing.current))
			return false;
		return (
			(config.submitKey === SubmitKey.AltEnter && e.altKey) ||
			(config.submitKey === SubmitKey.CtrlEnter && e.ctrlKey) ||
			(config.submitKey === SubmitKey.ShiftEnter && e.shiftKey) ||
			(config.submitKey === SubmitKey.MetaEnter && e.metaKey) ||
			(config.submitKey === SubmitKey.Enter &&
				!e.altKey &&
				!e.ctrlKey &&
				!e.shiftKey &&
				!e.metaKey)
		);
	};

	return {
		submitKey,
		shouldSubmit,
	};
}

export function ClearContextDivider(props: { sessionId?: string }) {
	const chatStore = useChatStore();
	const sessionId = props.sessionId;

	return (
		<div
			className={styles["clear-context"]}
			onClick={() =>
				chatStore.updateSession(
					sessionId,
					(session) => (session.clearContextIndex = undefined),
				)
			}
		>
			<div className={styles["clear-context-tips"]}>{Locale.Context.Clear}</div>
			<div className={styles["clear-context-revert-btn"]}>
				{Locale.Context.Revert}
			</div>
		</div>
	);
}

export function useScrollToBottom(scrollRef: any) {
	// for auto-scroll
	// const scrollRef = useRef<HTMLDivElement>(null);
	const [autoScroll, setAutoScroll] = useState(true);

	function scrollDomToBottom() {
		const dom = scrollRef.current;
		if (dom) {
			// requestAnimationFrame(() => {
			//   setAutoScroll(true);
			//   dom.scrollTo(0, dom.scrollHeight);
			// });
			setAutoScroll(true);
			dom.scrollTo(0, dom.scrollHeight);
		}
	}

	// auto scroll
	useEffect(() => {
		if (autoScroll) {
			scrollDomToBottom();
		}
	});

	return {
		scrollRef,
		autoScroll,
		setAutoScroll,
		scrollDomToBottom,
	};
}
