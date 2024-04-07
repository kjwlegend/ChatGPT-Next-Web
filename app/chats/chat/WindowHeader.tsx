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

import { ChatMessage, ChatSession } from "@/app/types/chat";

import {
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
	ContextPrompts,
	MaskAvatar,
	MaskConfig,
} from "@/app/chats/mask-components";

import { prettyObject } from "@/app/utils/format";
import { ExportMessageModal } from "@/app/chats/exporter";
import { getClientConfig } from "@/app/config/client";

import useAuth from "@/app/hooks/useAuth";
import { message } from "antd";

import { SessionConfigModel } from "./common";

import { ChatContext } from "./main";
import { index, is } from "cheerio/lib/api/traversing";
import { Switch } from "antd";
import doubleAgent, { DoubleAgentChatSession } from "@/app/store/doubleAgents";

export function EditMessageModal(props: {
	onClose: () => void;
	index?: number;
	session?: ChatSession;
	isworkflow: boolean;
	doubleAgent?: boolean;
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

	const [messages, setMessages] = useState(session.messages.slice());
	const [topic, setTopic] = useState(session.topic);

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
							chatStore.updateSession(sessionId, () => {
								// session.messages = messages;
								session.topic = topic;
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
							value={topic}
							onInput={
								(e) => setTopic(e.currentTarget.value)
								// chatStore.updateSession(sessionId, () => {
								// 	session.topic = e.currentTarget.value;
								// })
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

export function PromptToast(props: {
	showToast?: boolean;
	showModal?: boolean;
	setShowModal: (_: boolean) => void;
	isworkflow: boolean;
	index?: number;
	session?: ChatSession;
	doubleAgent?: boolean;
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

	const context = session.mask?.context;

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
				<SessionConfigModel
					onClose={() => props.setShowModal(false)}
					session={session}
					index={props.index}
					isworkflow={props.isworkflow}
				/>
			)}
		</div>
	);
}

// window header title

type WindowHeaderTitleProps = {
	session?: ChatSession;
	index?: number;
	isworkflow: boolean;
	doubleAgent?: boolean;
};

function WindowHeaderTitle({
	session,
	index,
	isworkflow,
}: WindowHeaderTitleProps) {
	const chatStore = useChatStore();
	const currentSession =
		isworkflow && session ? session : chatStore.currentSession();
	const sessionId = currentSession.id;
	const config = useAppConfig();

	const isMobileScreen = useMobileScreen();
	const clientConfig = useMemo(() => getClientConfig(), []);
	const showMaxIcon = !isMobileScreen && !clientConfig?.isApp;

	const [isEditingMessage, setIsEditingMessage] = useState(false);

	return (
		<>
			<div className={`window-header-title ${styles["chat-body-title"]}`}>
				<div
					className={`window-header-main-title ${styles["chat-body-main-title"]}`}
					onClickCapture={() => setIsEditingMessage(true)}
				>
					{!currentSession.topic ? DEFAULT_TOPIC : currentSession.topic}
				</div>
				<div className="window-header-sub-title">
					{Locale.Chat.SubTitle(currentSession.messages?.length ?? 0)}
				</div>
			</div>
			{isEditingMessage && (
				<EditMessageModal
					onClose={() => {
						setIsEditingMessage(false);
					}}
					isworkflow={isworkflow}
					session={currentSession}
				/>
			)}
		</>
	);
}

// window actions

//  将按钮部分抽离出来
function ReturnButton() {
	const navigate = useNavigate();

	return (
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
	);
}
// auto flow switch
type AutoFlowSwitchProps = {
	enableAutoFlow: boolean;
	setEnableAutoFlow: (checked: boolean) => void;
	index: number;
};
function AutoFlowSwitch({
	enableAutoFlow,
	setEnableAutoFlow,
	index,
}: AutoFlowSwitchProps) {
	return (
		<div>
			<span style={{ marginRight: "10px", fontSize: "12px" }}>自动流</span>
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
	);
}

function WindowActions(props: {
	session?: ChatSession;
	index?: number;
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
	const index = props.index ?? 0;

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

	const AutoFlowSwitchButton = () => (
		<div className="window-action-button">
			<AutoFlowSwitch
				enableAutoFlow={enableAutoFlow}
				setEnableAutoFlow={setEnableAutoFlow}
				index={index}
			/>
		</div>
	);

	const RenameButton = () => (
		<div className="window-action-button">
			<IconButton
				icon={<RenameIcon />}
				bordered
				onClick={() => setIsEditingMessage(true)}
			/>
		</div>
	);

	const ExportButton = () => (
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
	);

	const MaxMinButton = () => (
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
	);

	return (
		<>
			<div className="window-actions">
				{!isMobileScreen && props.isworkflow && <AutoFlowSwitchButton />}
				{!isMobileScreen && !props.isworkflow && <RenameButton />}
				{!props.isworkflow && <ExportButton />}
				{showMaxIcon && <MaxMinButton />}
			</div>
			{showExport && (
				<ExportMessageModal onClose={() => setShowExport(false)} />
			)}
			{isEditingMessage && (
				<EditMessageModal
					onClose={() => {
						setIsEditingMessage(false);
					}}
					isworkflow={props.isworkflow}
					session={session}
				/>
			)}
		</>
	);
}

export default function WindowHeader(props: {
	session?: ChatSession;
	index?: number;
	isworkflow: boolean;
	doubleAgent?: boolean;
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
	const index = props.index ?? 0;

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
			{isMobileScreen && !props.isworkflow && <ReturnButton />}

			<WindowHeaderTitle
				session={session}
				index={index}
				isworkflow={props.isworkflow}
			/>

			<WindowActions
				session={session}
				index={index}
				isworkflow={props.isworkflow}
			/>

			<PromptToast
				showToast={!hitBottom}
				showModal={showPromptModal}
				setShowModal={setShowPromptModal}
				session={session}
				index={index}
				isworkflow={props.isworkflow}
			/>
		</div>
	);
}

function DoulbeAgentWindowHeaderTitle({
	session,
	index,
	isworkflow,
}: WindowHeaderTitleProps) {
	const chatStore = doubleAgent();
	const currentSession = session ?? chatStore.currentSession();
	const sessionId = currentSession.id;
	const config = useAppConfig();

	const isMobileScreen = useMobileScreen();
	const clientConfig = useMemo(() => getClientConfig(), []);
	const showMaxIcon = !isMobileScreen && !clientConfig?.isApp;

	const [isEditingMessage, setIsEditingMessage] = useState(false);

	return (
		<>
			<div className={`window-header-title ${styles["chat-body-title"]}`}>
				<div
					className={`window-header-main-title ${styles["chat-body-main-title"]}`}
					onClickCapture={() => setIsEditingMessage(true)}
				>
					{!currentSession.topic ? DEFAULT_TOPIC : currentSession.topic}
				</div>
				<div className="window-header-sub-title">
					{Locale.Chat.SubTitle(currentSession.messages.length)}
				</div>
			</div>
			{isEditingMessage && (
				<EditMessageModal
					onClose={() => {
						setIsEditingMessage(false);
					}}
					isworkflow={isworkflow}
					// session={currentSession}
				/>
			)}
		</>
	);
}

export function DoubleAgentWindowHeader(props: {
	session?: DoubleAgentChatSession;
}) {
	const chatStore = doubleAgent();
	let session = props.session ?? chatStore.currentSession();
	const sessionId = session.id;
	const [showExport, setShowExport] = useState(false);
	const [isEditingMessage, setIsEditingMessage] = useState(false);
	const isMobileScreen = useMobileScreen();
	const clientConfig = useMemo(() => getClientConfig(), []);

	return (
		<div className="window-header" data-tauri-drag-region>
			<div className={`window-header-title ${styles["chat-body-title"]}`}>
				<div
					className={`window-header-main-title ${styles["chat-body-main-title"]}`}
					onClickCapture={() => setIsEditingMessage(true)}
				>
					{!session.topic ? DEFAULT_TOPIC : session.topic}
				</div>
			</div>
		</div>
	);
}
