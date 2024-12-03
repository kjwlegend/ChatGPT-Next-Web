import { useDebouncedCallback } from "use-debounce";
import React, { useState } from "react";

import CopyIcon from "@/app/icons/copy.svg";

import { useChatStore } from "@/app/store/chat/index";

import Locale from "@/app/locales";

import { IconButton } from "@/app/components/button";

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
			console.log(
				"handleSave workflowId:",
				workflowId,
				sessionId,
				childSessionData,
			);
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

export const SessionModal = (props: {
	session?: sessionConfig;
	index?: number;
	isworkflow: boolean;
	showModal?: boolean;
	setShowModal: (_: boolean) => void;
	MultiAgent?: boolean;
}) => {
	const session = props.session;

	return (
		<div>
			{props.showModal && (
				<SessionConfigModal
					onClose={() => props.setShowModal(false)}
					session={session}
					isworkflow={props.isworkflow}
				/>
			)}
		</div>
	);
};
