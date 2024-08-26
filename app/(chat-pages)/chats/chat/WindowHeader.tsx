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

import { useChatStore, useAppConfig, DEFAULT_TOPIC } from "@/app/store";

import { useNavigate } from "react-router-dom";
import { useMobileScreen } from "@/app/hooks/useMobileScreen";
import { Path } from "@/app/constant";

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

import { prettyObject } from "@/app/utils/format";
import { ExportMessageModal } from "@/app/(chat-pages)/chats/exporter";
import { getClientConfig } from "@/app/config/client";

import { message, Switch } from "antd";

import { SessionConfigModal } from "./SessionConfigModal";

import MultiAgent, { MultiAgentChatSession } from "@/app/store/multiagents";
import { LLMModelSwitch } from "./LLModelSwitch";
import { AppGeneralContext } from "@/app/contexts/AppContext";
import {
	useChatActions,
	useChatSetting,
	useSessions,
} from "./hooks/useChatContext";

export function EditMessageModal(props: {
	onClose: () => void;
	index?: number;
	session: ChatSession;
	isworkflow: boolean;
	MultiAgent?: boolean;
}) {
	const chatStore = useChatStore.getState();

	const session = props.session;
	const sessionId = session.id;

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
			</Modal>
		</div>
	);
}
const MaskModal = (props: {
	session?: ChatSession;
	index?: number;
	isworkflow: boolean;
	showModal?: boolean;
	setShowModal: (_: boolean) => void;
	MultiAgent?: boolean;
}) => {
	const chatStore = useChatStore.getState();
	const session = props.session;

	return (
		<div className={styles["prompt-toast"]} key="prompt-toast">
			{props.showModal && (
				<SessionConfigModal
					onClose={() => props.setShowModal(false)}
					session={session}
					index={props.index}
					isworkflow={props.isworkflow}
				/>
			)}
		</div>
	);
};
export function PromptToast(props: {
	showToast?: boolean;
	showModal?: boolean;
	setShowModal: (_: boolean) => void;
	isworkflow: boolean;
	index?: number;
	session: ChatSession;
}) {
	const chatStore = useChatStore.getState();

	const session = props.session;
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
		</div>
	);
}

// window header title

type WindowHeaderTitleProps = {
	session: ChatSession;
	index?: number;
	isworkflow: boolean;
	MultiAgent?: boolean;
};

function WindowHeaderTitle({
	session,
	index,
	isworkflow,
	MultiAgent,
}: WindowHeaderTitleProps) {
	const chatStore = useChatStore.getState();
	const currentSession = session;

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
					智能体: {session?.mask.name} | id: {session?.id}
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
	session: ChatSession;
	index?: number;
	isworkflow: boolean;
}) {
	const session = props.session;
	const index = props.index ?? 0;

	const config = useAppConfig();
	const [showExport, setShowExport] = useState(false);
	const [enableAutoFlow, setEnableAutoFlow] = useState(false);

	const isMobileScreen = useContext(AppGeneralContext).isMobile;
	const clientConfig = useMemo(() => getClientConfig(), []);
	const showMaxIcon =
		!isMobileScreen && !clientConfig?.isApp && !props.isworkflow;

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
				{/* {!props.isworkflow && <ExportButton />} */}
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

export function WindowHeader(props: {
	_session: ChatSession;
	index?: number;
	isworkflow: boolean;
	MultiAgent?: boolean;
}) {
	const { _session, index, isworkflow, MultiAgent } = props;
	// isworkflow = true then, session use props.session. else use currentSession

	const session = useSessions();

	const hitBottom = false;

	const { showPromptModal } = useChatSetting();
	const { setShowPromptModal } = useChatActions();
	const [isEditingMessage, setIsEditingMessage] = useState(false);

	const isMobileScreen = useContext(AppGeneralContext).isMobile;

	return (
		<div className="window-header" data-tauri-drag-region>
			{isMobileScreen && !props.isworkflow && <ReturnButton />}

			<WindowHeaderTitle
				session={session}
				index={index}
				isworkflow={props.isworkflow}
			/>

			<LLMModelSwitch session={session} isworkflow={props.isworkflow} />

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
			<MaskModal
				showModal={showPromptModal}
				setShowModal={setShowPromptModal}
				session={session}
				index={index}
				isworkflow={props.isworkflow}
			/>
		</div>
	);
}

export function MultiAgentWindowHeader(props: {
	session?: MultiAgentChatSession;
}) {
	const chatStore = MultiAgent();
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
