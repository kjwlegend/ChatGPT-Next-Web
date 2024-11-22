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

import { useChatStore } from "@/app/store/chat/index";

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

import { BotAvatar } from "@/app/components/emoji";
import { Avatar as UserAvatar } from "antd";
import {
	ContextPrompts,
	MaskAvatar,
	MaskConfig,
} from "@/app/(chat-pages)/chats/components/mask-modal";

import { useMaskStore } from "@/app/store/mask/index";
import { useSessions } from "../hooks/useChatContext";
import { useWorkflowStore } from "@/app/store/workflow";

import { sessionConfig, workflowChatSession } from "@/app/types/";
// import { cloneDeep } from "lodash";

export function SessionConfigModal(props: {
	onClose: () => void;
	session?: sessionConfig;
	isworkflow: boolean;
}) {
	const chatStore = useChatStore.getState();
	const workflowStore = useWorkflowStore.getState();
	const session = useSessions();
	const sessionId = session.id;

	const maskStore = useMaskStore();
	// 用于保存子组件的 session 数据
	const [childSessionData, setChildSessionData] = useState(session);
	const isWorkflow = props.isworkflow;
	// 使用类型守卫和默认值处理
	const workflowId = isWorkflow
		? (session as workflowChatSession)?.workflow_group_id
		: null;

	// 如果session 存在 workflow_group_id, 则为 workflow

	const handleOnSave = (e: any) => {
		setChildSessionData(e);
	};

	const handleSave = () => {
		if (isWorkflow) {
			workflowStore.updateWorkflowSession(
				workflowId ?? "0",
				sessionId,
				childSessionData,
			);
		} else {
			chatStore.updateSession(
				sessionId,
				(session) => {
					Object.assign(session, childSessionData);
				},
				true,
			);
		}
		props.onClose();
	};
	return (
		<div className="modal-mask">
			<Modal
				title={Locale.Context.Edit}
				onClose={() => props.onClose()}
				actions={[
					<IconButton
						key="save"
						icon={<CopyIcon />}
						bordered
						text={"保存"}
						onClick={() => {
							handleSave();
						}}
					/>,

					// <IconButton
					// 	key="copy"
					// 	icon={<CopyIcon />}
					// 	bordered
					// 	text={Locale.Chat.Config.SaveAs}
					// 	onClick={() => {
					// 		setTimeout(() => {
					// 			maskStore.create(session.mask);
					// 		}, 500);
					// 	}}
					// />,
				]}
			>
				<MaskConfig
					mask={session.mask}
					updateMask={(updater) => {
						const mask = { ...session.mask };
						updater(mask);
						// chatStore.updateSession(
						// 	sessionId,
						// 	(session) => (session.mask = mask),
						// 	false,
						// );
					}}
					session={session}
					onSave={handleOnSave}
					shouldSyncFromGlobal
				></MaskConfig>
			</Modal>
		</div>
	);
}
