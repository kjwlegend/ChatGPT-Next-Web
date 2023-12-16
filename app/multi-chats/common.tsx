import { useDebouncedCallback } from "use-debounce";
import React, {
	useState,
	useRef,
	useEffect,
	useMemo,
	useCallback,
	Fragment,
} from "react";

import { getISOLang, getLang } from "../locales";

import SendWhiteIcon from "../icons/send-white.svg";

import CopyIcon from "../icons/copy.svg";
import PromptIcon from "../icons/prompt.svg";

import ResetIcon from "../icons/reload.svg";
import BreakIcon from "../icons/break.svg";
import SettingsIcon from "../icons/chat-settings.svg";

import LightIcon from "../icons/light.svg";
import DarkIcon from "../icons/dark.svg";
import AutoIcon from "../icons/auto.svg";
import BottomIcon from "../icons/bottom.svg";
import StopIcon from "../icons/pause.svg";
import RobotIcon from "../icons/robot.svg";

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
	ChatSession,
} from "../store";

import {
	copyToClipboard,
	selectOrCopy,
	autoGrowTextArea,
	useMobileScreen,
} from "../utils";

import { api } from "../client/api";

import dynamic from "next/dynamic";

import { ChatControllerPool } from "../client/controller";
import { Prompt, usePromptStore } from "../store/prompt";
import Locale from "../locales";

import { IconButton } from "../components/button";
import styles from "./multi-chats.module.scss";

import {
	List,
	ListItem,
	Modal,
	Selector,
	showConfirm,
	showPrompt,
	showToast,
} from "../components/ui-lib";
import {
	CHAT_PAGE_SIZE,
	LAST_INPUT_KEY,
	MAX_RENDER_MSG_COUNT,
	Path,
	REQUEST_TIMEOUT_MS,
} from "../constant";
import { Avatar } from "../components/emoji";
import { Avatar as UserAvatar } from "antd";
import {
	ContextPrompts,
	MaskAvatar,
	MaskConfig,
} from "@/app/chats/mask-components";

import { useMaskStore } from "../store/mask";

export function SessionConfigModel(props: {
	onClose: () => void;
	index: number;
	session: ChatSession;
}) {
	const chatStore = useChatStore();

	const sessionId = props.session.id;
	const session = props.session;
	const index = props.index;
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
