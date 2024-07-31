import { useDebouncedCallback } from "use-debounce";
import React, {
	useState,
	useRef,
	useEffect,
	useMemo,
	useCallback,
	Fragment,
} from "react";

import { getISOLang, getLang } from "../../locales";

import SendWhiteIcon from "@/app/icons/send-white.svg";

import CopyIcon from "@/app/icons/copy.svg";
import PromptIcon from "@/app/icons/prompt.svg";

import ResetIcon from "@/app/icons/reload.svg";
import { ChatMessage, ChatSession, Mask } from "@/app/types/";

import {
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
} from "../../store";

import { api } from "../../client/api";

import dynamic from "next/dynamic";

import { ChatControllerPool } from "../../client/controller";
import { Prompt, usePromptStore } from "../../store/prompt";
import Locale from "../../locales";

import { IconButton } from "../../components/button";
import styles from "./workflow-chats.module.scss";

import {
	Modal,
	Selector,
	showConfirm,
	showPrompt,
	showToast,
} from "../../components/ui-lib";
import {
	CHAT_PAGE_SIZE,
	LAST_INPUT_KEY,
	MAX_RENDER_MSG_COUNT,
	Path,
	REQUEST_TIMEOUT_MS,
} from "../../constant";

import { useMaskStore } from "../../store/mask";
import { useWorkflowContext } from "./workflowContext";

import { List, Input, Form, Row, Col } from "antd";
import { Avatar } from "../../chats/components/avatar";
import { CopyOutlined } from "@ant-design/icons";

const { TextArea } = Input;

export function WorkflowModalConfig(props: {
	onClose: () => void;
	workflow: any;
}) {
	const { workflow, onClose } = props;
	const { topic, description } = workflow;

	const {
		workflowGroup,
		selectedId,
		setselectedId,
		deleteWorkflowGroup,
		updateSingleWorkflowGroup,
	} = useWorkflowContext();

	const [workflowName, setWorkflowName] = useState(topic);
	const [workflowDescription, setWorkflowDescription] = useState(description);

	const chatStore = useChatStore();

	// use workflow.sessions to get the agent list from chatStore.sessions

	const agentlist =
		workflow.sessions?.map((item: any) => {
			const agent = chatStore.sessions.find(
				(session: ChatSession) => session.id === item,
			);
			return agent;
		}) ?? [];

	console.log("agentlist", agentlist);
	console.log("workflow", workflow);

	const handleSave = async () => {
		await updateSingleWorkflowGroup(workflow.id, {
			topic: workflowName,
			lastUpdateTime: new Date().toISOString(),
			description: workflowDescription,
		});
		onClose();
	};

	return (
		<div className="modal-mask">
			<Modal
				title={Locale.Context.Edit}
				onClose={() => props.onClose()}
				actions={[
					<IconButton
						key="copy"
						icon={<CopyIcon />}
						bordered
						text={Locale.Chat.Config.SaveAs}
						onClick={async () => handleSave()}
					/>,
				]}
			>
				<Row gutter={16}>
					<Col span={12}>
						<h3>基本介绍</h3>
						<div style={{ marginBottom: 16 }}>
							<label
								htmlFor="workflowName"
								style={{ display: "block", marginBottom: 8 }}
							>
								工作流名称
							</label>
							<Input
								id="workflowName"
								prefix={<CopyOutlined />}
								value={workflowName}
								onChange={(e) => setWorkflowName(e.target.value)}
							/>
						</div>
						<div style={{ marginBottom: 16 }}>
							<label
								htmlFor="workflowDescription"
								style={{ display: "block", marginBottom: 8 }}
							>
								工作流描述
							</label>
							<Input.TextArea
								id="workflowDescription"
								value={workflowDescription}
								rows={4}
								onChange={(e) => setWorkflowDescription(e.target.value)}
							/>
						</div>
					</Col>
					<Col span={12}>
						<h3>Agent 列表</h3>
						<List
							itemLayout="vertical"
							className={styles["agent-list"]}
							dataSource={agentlist}
							size="small"
							renderItem={(item: ChatSession, index) => (
								<List.Item>
									<List.Item.Meta
										avatar={<Avatar avatar={item.mask.avatar} />}
										title={item.mask.name}
										description={item.mask.description}
									/>
								</List.Item>
							)}
						/>
					</Col>
				</Row>
			</Modal>
		</div>
	);
}
