import React, { useState, useEffect, useMemo, useContext } from "react";
import { useDebouncedCallback } from "use-debounce";

import { getISOLang, getLang } from "../locales";

import BrainIcon from "../icons/brain.svg";
import RenameIcon from "../icons/rename.svg";
import ExportIcon from "../icons/share.svg";
import ReturnIcon from "../icons/return.svg";
import MaxIcon from "../icons/max.svg";
import MinIcon from "../icons/min.svg";
import ConfirmIcon from "../icons/confirm.svg";
import CancelIcon from "../icons/cancel.svg";

import {
	ChatMessage,
	SubmitKey,
	useChatStore,
	BOT_HELLO,
	createMessage,
	useAppConfig,
	DEFAULT_TOPIC,
	ChatSession,
} from "../store";

import {
	copyToClipboard,
	selectOrCopy,
	autoGrowTextArea,
	useMobileScreen,
} from "../utils";

import { api } from "../client/api";

import Locale from "../locales";

import { IconButton } from "../components/button";
import styles from "@/app/multi-chats/multi-chats.module.scss";

import {
	List,
	ListItem,
	Modal,
	Selector,
	showConfirm,
	showPrompt,
	showToast,
} from "../components/ui-lib";

import { ContextPrompts, MaskAvatar, MaskConfig } from "../chats/mask";

import { prettyObject } from "../utils/format";
import { getClientConfig } from "../config/client";

import useAuth from "../hooks/useAuth";
import { message, Switch } from "antd";

import { SessionConfigModel } from "./common";

import { ChatContext } from "./context";

import { EditMessageModal, PromptToast } from "../chats/chat/WindowHeader";

export default function WindowHeader(props: {
	session: ChatSession;
	index: number;
}) {
	const sessionId = props.session.id;
	const session = props.session;
	const index = props.index;
	const chatStore = useChatStore();
	// const session = chatStore.currentSession();
	const config = useAppConfig();
	const [showExport, setShowExport] = useState(false);

	const {
		hitBottom,
		setHitBottom,

		showPromptModal,
		setShowPromptModal,
		userInput,
		setUserInput,
		enableAutoFlow,
		setEnableAutoFlow,
	} = useContext(ChatContext);

	const isMobileScreen = useMobileScreen();
	const clientConfig = useMemo(() => getClientConfig(), []);
	const showMaxIcon = !isMobileScreen && !clientConfig?.isApp;

	const [isEditingMessage, setIsEditingMessage] = useState(false);

	return (
		<div className="window-header" data-tauri-drag-region>
			{isMobileScreen && (
				<div className="window-actions">
					<div className={"window-action-button"}>
						<IconButton
							icon={<ReturnIcon />}
							bordered
							title={Locale.Chat.Actions.ChatList}
						/>
					</div>
				</div>
			)}

			<div className={`window-header-title ${styles["chat-body-title"]}`}>
				<div
					className={`window-header-main-title ${styles["chat-body-main-title"]}`}
					onClickCapture={() => setIsEditingMessage(true)}
				>
					{!session.topic ? DEFAULT_TOPIC : session.topic}
				</div>
				<div className="window-header-sub-title">
					{Locale.Chat.SubTitle(session.messages.length)}
				</div>
			</div>
			<div className="window-actions">
				{!isMobileScreen && (
					<div>
						<span style={{ marginRight: "10px", fontSize: "12px" }}>
							自动流
						</span>
						<Switch
							checkedChildren="开启"
							unCheckedChildren="人工"
							defaultChecked={enableAutoFlow}
							onChange={(checked) => {
								console.log(checked, index);
								setEnableAutoFlow(checked);
							}}
						/>
					</div>
				)}

				{showMaxIcon && (
					<div className="window-action-button">
						<IconButton
							icon={config.tightBorder ? <MinIcon /> : <MaxIcon />}
							bordered
							onClick={() => {
								config.update((config) => {
									config.showHeader = !config.showHeader;
								});
							}}
						/>
					</div>
				)}
			</div>
			{isEditingMessage && (
				<EditMessageModal
					onClose={() => {
						setIsEditingMessage(false);
					}}
					index={index}
					session={session}
					isworkflow={true}
				/>
			)}
			<PromptToast
				showToast={!hitBottom}
				showModal={showPromptModal}
				setShowModal={setShowPromptModal}
				session={session}
				index={index}
				isworkflow={true}
			/>
		</div>
	);
}

