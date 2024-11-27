import React, { useState, useEffect, useMemo, useContext } from "react";
import { useDebouncedCallback } from "use-debounce";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Maximize2, Pencil } from "lucide-react";
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

import { useAppConfig } from "@/app/store";

import { useChatStore, DEFAULT_TOPIC } from "@/app/store/chat";

import { useNavigate } from "react-router-dom";
import { useMobileScreen } from "@/app/hooks/useMobileScreen";
import { Path } from "@/app/constant";

import Locale from "@/app/locales";

import { IconButton } from "@/app/components/button";
import styles from "../chats.module.scss";

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

import { SessionConfigModal } from "../modals/SessionConfigModal";

import { MultiAgentChatSession } from "@/app/store/multiagents";
import { LLMModelSwitch } from "./LLModelSwitch";
import { AppGeneralContext } from "@/app/contexts/AppContext";
import {
	useChatActions,
	useChatSetting,
	useSessions,
} from "../hooks/useChatContext";
import { SessionModal } from "../modals/sessionConfig";
import { sessionConfig } from "@/app/types/";
import { useWorkflowStore } from "@/app/store/workflow";

export function EditMessageModal(props: {
	onClose: () => void;
	index?: number;
	session: sessionConfig;
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

export function PromptToast(props: {
	showToast?: boolean;
	showModal?: boolean;
	setShowModal: (_: boolean) => void;
	isworkflow: boolean;
	index?: number;
	session: sessionConfig;
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
	session: sessionConfig;
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
	const currentSession = session;
	const [isEditingMessage, setIsEditingMessage] = useState(false);
	const isMobileScreen = useContext(AppGeneralContext).isMobile;

	return (
		<>
			<div
				className={`flex ${isMobileScreen ? "flex-col items-start gap-1" : "items-center gap-3"}`}
			>
				{!isworkflow && (
					<div className="flex items-center gap-2">
						<h1
							className={`font-semibold ${isMobileScreen ? "text-sm" : "text-base"}`}
						>
							{!currentSession.topic ? DEFAULT_TOPIC : currentSession.topic}
						</h1>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							onClick={() => setIsEditingMessage(true)}
						>
							<Pencil className="h-3 w-3" />
							<span className="sr-only">Edit title</span>
						</Button>
					</div>
				)}
				<div
					className={`flex items-center ${isMobileScreen ? "gap-2" : "gap-3"}`}
				>
					<Badge variant="secondary" className="px-1 py-0 text-xs">
						智能体: {session?.mask.name}
					</Badge>
					<span className="text-xs text-muted-foreground">
						id: {session?.mask.id || session?.mask.agent_id}
					</span>
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
export function ReturnButton() {
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
	index: number;
	session: sessionConfig;
};
function AutoFlowSwitch({ index, session }: AutoFlowSwitchProps) {
	const enable = session.enableAutoFlow;

	const [enableAutoFlow, setEnableAutoFlow] = useState(enable);

	const workflowStore = useWorkflowStore();

	const handleChange = () => {
		const newEnableAutoFlow = !enableAutoFlow;
		setEnableAutoFlow(newEnableAutoFlow);
		workflowStore.updateWorkflowSession(session.workflow_group_id, session.id, {
			enableAutoFlow: newEnableAutoFlow,
		});
	};

	return (
		<div>
			<span style={{ marginRight: "10px", fontSize: "12px" }}>自动流</span>
			<Switch
				checkedChildren="开启"
				unCheckedChildren="人工"
				defaultChecked={enableAutoFlow}
				onChange={handleChange}
			/>
		</div>
	);
}

function WindowActions(props: {
	session: sessionConfig;
	index?: number;
	isworkflow: boolean;
}) {
	const session = props.session;
	const index = props.index ?? 0;
	const config = useAppConfig();

	const isMobileScreen = useContext(AppGeneralContext).isMobile;
	const showMaxIcon = !isMobileScreen && !props.isworkflow;

	const toggleMaximize = () => {
		config.update((config) => {
			config.showHeader = !config.showHeader;
		});
	};

	const AutoFlowSwitchButton = () => (
		<div className="window-action-button">
			<AutoFlowSwitch index={index} session={session} />
		</div>
	);

	const MaxMinButton = () => (
		<Button
			variant="ghost"
			size="icon"
			className="h-7 w-7"
			onClick={toggleMaximize}
		>
			<Maximize2 className="h-3 w-3" />
			<span className="sr-only">Fullscreen</span>
		</Button>
	);

	return (
		<>
			<div className="window-actions flex items-center gap-2">
				<LLMModelSwitch session={session} isworkflow={props.isworkflow} />
				{!isMobileScreen && props.isworkflow && <AutoFlowSwitchButton />}
				{showMaxIcon && <MaxMinButton />}
			</div>
		</>
	);
}

export const WindowHeader = React.memo(
	(props: { index?: number; isworkflow: boolean; MultiAgent?: boolean }) => {
		const { index, isworkflow, MultiAgent } = props;

		const session = useSessions() as sessionConfig;
		const hitBottom = false;

		const { showPromptModal } = useChatSetting();
		const { setShowPromptModal } = useChatActions();
		const [isEditingMessage, setIsEditingMessage] = useState(false);

		const isMobileScreen = useContext(AppGeneralContext).isMobile;

		const commonProps = useMemo(
			() => ({
				session,
				index,
				isworkflow,
			}),
			[session, index, isworkflow],
		);

		return (
			<>
				<div
					className="window-header flex items-center justify-between"
					data-tauri-drag-region
				>
					{isMobileScreen && !isworkflow && <ReturnButton />}

					<WindowHeaderTitle {...commonProps} />

					<WindowActions {...commonProps} />
				</div>

				<SessionModal
					showModal={showPromptModal}
					setShowModal={setShowPromptModal}
					{...commonProps}
				/>
			</>
		);
	},
);

WindowHeader.displayName = "WindowHeader";
