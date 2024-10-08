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

import { SubmitKey, useChatStore } from "../../store";

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
import { useWorkflowGroupActions } from "./workflowContext";

import { List, Input, Form, Row, Col } from "antd";
import { Avatar } from "@/app//components/avatar";

import { CopyOutlined } from "@ant-design/icons";
import { workflowChatSession, WorkflowGroup } from "@/app/types/workflow";

const { TextArea } = Input;

export function WorkflowModalConfig(props: {
	onClose: () => void;
	workflow: WorkflowGroup;
	workflowSessions: workflowChatSession[];
}) {
	const { workflow, workflowSessions, onClose } = props;
	const { topic, description, summary, id, created_at } = workflow;

	const { updateWorkflowSessionInfo } = useWorkflowGroupActions();

	const [workflowName, setWorkflowName] = useState(topic);
	const [workflowDescription, setWorkflowDescription] = useState(description);

	const agentlist = workflowSessions || [];
	// console.log("agentlist", agentlist);

	const handleSave = async () => {
		await updateWorkflowSessionInfo(workflow.id, {
			topic: workflowName,
			description: workflowDescription,
			lastUpdateTime: new Date().toISOString(),
			updated_at: new Date().toISOString(),
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
