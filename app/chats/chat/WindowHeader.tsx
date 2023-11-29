import React, { useState, useEffect, useMemo, useContext } from "react";
import { useDebouncedCallback } from "use-debounce";

import { getISOLang, getLang } from "@/app/locales";

import BrainIcon from "@/app/icons/brain.svg";
import RenameIcon from "@/app/icons/rename.svg";
import ExportIcon from "@/app/icons/share.svg";
import ReturnIcon from "@/app/icons/return.svg";
import MaxIcon from "@/app/icons/max.svg";
import MinIcon from "@/app/icons/min.svg";
import ConfirmIcon from "@/app/icons/confirm.svg";
import CancelIcon from "@/app/icons/cancel.svg";

import {
	ChatMessage,
	SubmitKey,
	useChatStore,
	BOT_HELLO,
	createMessage,
	useAppConfig,
	DEFAULT_TOPIC,
} from "@/app/store";

import { useNavigate } from "react-router-dom";
import {
	copyToClipboard,
	selectOrCopy,
	autoGrowTextArea,
	useMobileScreen,
} from "@/app/utils";

import { Path } from "@/app/constant";

import { api } from "@/app/client/api";

import Locale from "@/app/locales";

import { IconButton } from "@/app/components/button";
import styles from "./multi-chats.module.scss";

import {
	List,
	ListItem,
	Modal,
	Selector,
	showConfirm,
	showPrompt,
	showToast,
} from "@/app/components/ui-lib";

import { ContextPrompts, MaskAvatar, MaskConfig } from "@/app/chats/mask";

import { prettyObject } from "@/app/utils/format";
import { ExportMessageModal } from "@/app/chats/exporter";
import { getClientConfig } from "@/app/config/client";

import useAuth from "@/app/hooks/useAuth";
import { message } from "antd";

import { SessionConfigModel } from "./common";

import { ChatContext } from "./main";

export function EditMessageModal(props: { onClose: () => void }) {
	const chatStore = useChatStore();
	const session = chatStore.currentSession();
	const [messages, setMessages] = useState(session.messages.slice());

	return (
		<div className="modal-mask">
			<Modal
				title={Locale.Chat.EditMessage.Title}
				onClose={props.onClose}
				actions={[
					<IconButton
						text={Locale.UI.Cancel}
						icon={<CancelIcon />}
						key="cancel"
						onClick={() => {
							props.onClose();
						}}
					/>,
					<IconButton
						type="primary"
						text={Locale.UI.Confirm}
						icon={<ConfirmIcon />}
						key="ok"
						onClick={() => {
							chatStore.updateCurrentSession((session) => {
								session.messages = messages;
							});
							props.onClose();
						}}
					/>,
				]}
			>
				<List>
					<ListItem
						title={Locale.Chat.EditMessage.Topic.Title}
						subTitle={Locale.Chat.EditMessage.Topic.SubTitle}
					>
						<input
							type="text"
							value={session.topic}
							onInput={(e) =>
								chatStore.updateCurrentSession((session) => {
									session.topic = e.currentTarget.value;
								})
							}
						></input>
					</ListItem>
				</List>
				{/* <ContextPrompts
					context={messages}
					updateContext={(updater) => {
						const newMessages = messages.slice();
						updater(newMessages);
						setMessages(newMessages);
					}}
				/> */}
			</Modal>
		</div>
	);
}

export default function WindowHeader() {
	const chatStore = useChatStore();
	const session = chatStore.currentSession();
	const config = useAppConfig();
	const [showExport, setShowExport] = useState(false);
	const navigate = useNavigate();

	const { showPromptModal, setShowPromptModal, hitBottom, setHitBottom } =
		useContext(ChatContext);

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
							onClick={() => navigate(Path.Home)}
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
					<div className="window-action-button">
						<IconButton
							icon={<RenameIcon />}
							bordered
							onClick={() => setIsEditingMessage(true)}
						/>
					</div>
				)}
				<div className="window-action-button">
					<IconButton
						icon={<ExportIcon />}
						bordered
						title={Locale.Chat.Actions.Export}
						onClick={() => {
							setShowExport(true);
						}}
					/>
				</div>
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
				/>
			)}
			<PromptToast
				showToast={!hitBottom}
				showModal={showPromptModal}
				setShowModal={setShowPromptModal}
			/>
			{showExport && (
				<ExportMessageModal onClose={() => setShowExport(false)} />
			)}
		</div>
	);
}

export function PromptToast(props: {
	showToast?: boolean;
	showModal?: boolean;
	setShowModal: (_: boolean) => void;
}) {
	const chatStore = useChatStore();
	const session = chatStore.currentSession();
	const context = session.mask.context;

	return (
		<div className={styles["prompt-toast"]} key="prompt-toast">
			{props.showToast && (
				<div
					className={styles["prompt-toast-inner"] + " clickable"}
					role="button"
					onClick={() => props.setShowModal(true)}
				>
					<BrainIcon />
					<span className={styles["prompt-toast-content"]}>
						{Locale.Context.Toast(context.length)}
					</span>
				</div>
			)}
			{props.showModal && (
				<SessionConfigModel onClose={() => props.setShowModal(false)} />
			)}
		</div>
	);
}
