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

import { useLocation, useNavigate } from "react-router-dom";

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
import { ChatSession } from "@/app/store";

export function SessionConfigModel(props: {
	onClose: () => void;
	index?: number;
	session?: ChatSession;
	isworkflow: boolean;
}) {
	const chatStore = useChatStore();
	let session: ChatSession;
	// isworkflow = true then, session use props.session. else use currentSession
	if (props.isworkflow && props.session) {
		session = props.session;
	} else {
		session = chatStore.currentSession();
	}
	const sessionId = session.id;

	const maskStore = useMaskStore();

	return (
		<div className="modal-mask">
			<Modal
				title={Locale.Context.Edit}
				onClose={() => props.onClose()}
				actions={[
					<IconButton
						key="reset"
						icon={<ResetIcon />}
						bordered
						text={Locale.Chat.Config.Reset}
						onClick={async () => {
							if (await showConfirm(Locale.Memory.ResetConfirm)) {
								chatStore.updateSession(
									sessionId,
									() => (session.memoryPrompt = ""),
								);
							}
						}}
					/>,
					<IconButton
						key="copy"
						icon={<CopyIcon />}
						bordered
						text={Locale.Chat.Config.SaveAs}
						onClick={() => {
							setTimeout(() => {
								maskStore.create(session.mask);
							}, 500);
						}}
					/>,
				]}
			>
				<MaskConfig
					mask={session.mask}
					updateMask={(updater) => {
						const mask = { ...session.mask };
						updater(mask);
						chatStore.updateSession(sessionId, () => (session.mask = mask));
					}}
					shouldSyncFromGlobal
					extraListItems={
						session.mask.modelConfig.sendMemory ? (
							<ListItem
								title={`${Locale.Memory.Title} (${session.lastSummarizeIndex} of ${session.messages.length})`}
								subTitle={session.memoryPrompt || Locale.Memory.EmptyContent}
							></ListItem>
						) : (
							<></>
						)
					}
				></MaskConfig>
			</Modal>
		</div>
	);
}
