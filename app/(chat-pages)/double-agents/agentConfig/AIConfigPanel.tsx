"use client";
// src/components/ChatArea/AIConfigPanel.tsx

import { BotAvatar as MaskAvatar } from "@/app/components/emoji";
import {
	useMultipleAgentStore,
	MultiAgentChatSession,
} from "@/app/store/multiagents";

import { ChatMessage, ChatSession, Mask } from "@/app/types/";

import { Modal } from "@/app/components/ui-lib";
import {
	AgentConfigCard,
	MaskConfig,
} from "@/app/(chat-pages)/chats/components/mask-modal";
import { useMobileScreen } from "@/app/hooks/useMobileScreen";

import Locale from "@/app/locales";
import { usePluginStore } from "@/app/store/plugin";

import { getLang, getISOLang } from "@/app/locales";
import { IconButton } from "@/app/components/button";
import { MaskPage } from "../../chats/masklist/mask";
import { useMultipleAgentsChatHook } from "@/app/(chat-pages)/double-agents/useMultipleAgentsHook";
import { useAgentActions } from "@/app/hooks/useAgentActions";
import React, { useState, useMemo, useEffect } from "react";
import {
	Card,
	Button,
	Avatar,
	Slider,
	Tooltip,
	Checkbox,
	Dropdown,
	Menu,
	Tag,
	Modal as AntdModal,
} from "antd";
import {
	PlusCircleOutlined,
	SettingOutlined,
	UserOutlined,
	ApiTwoTone,
	ThunderboltTwoTone,
	SwitcherOutlined,
} from "@ant-design/icons";
// import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import {
	DragDropContext,
	Droppable,
	Draggable,
	OnDragEndResponder,
	OnDragUpdateResponder,
} from "@hello-pangea/dnd";

import AIConfigCard from "./AIConfigCard";
import { updateMultiAgentSession } from "@/app/services/api/chats";
import { useCurrentConversation } from "../multiAgentContext";
import styles from "./AIConfig.module.scss";
const AIConfigPanel: React.FC = () => {
	const { updateConversation, setAIConfig } = useMultipleAgentStore();

	const { conversation, conversationId } = useCurrentConversation();

	const { handleAgentClick } = useMultipleAgentsChatHook();
	const { onDelete } = useAgentActions();
	const [showAgentList, setShowAgentList] = useState(false);
	const [showAgentEdit, setShowAgentEdit] = useState(false);
	const [agentIndex, setAgentIndex] = useState(0);
	const [agentData, setAgentData] = useState<Mask>({} as Mask);

	const session = conversation;
	const aiConfigs = useMemo(() => {
		return conversation?.aiConfigs || [];
	}, [conversation]);

	const [currentAgent, setCurrentAgent] = useState<Mask>(aiConfigs[0]);

	useEffect(() => {
		if (!session) {
			return;
		}
	}, [session]);

	const handleModalClick = () => {
		setShowAgentList(!showAgentList);
	};

	const handleAgentEdit = (agent: Mask) => {
		console.log("🚀 ~ file: AIConfigPanel.tsx:handleAgentEdit ~ agent:");
		setCurrentAgent(agent);
		setShowAgentEdit(true);
	};

	const handleAgentUpdate = async () => {
		setAIConfig(conversationId, agentIndex, agentData); // 暂时使用第一个配置
		setShowAgentEdit(false);

		// update multiagentchatsession
		const res = await updateMultiAgentSession(
			{ custom_agents_data: aiConfigs },
			conversationId,
		);
		console.log("multipleagents debug: handleAgentUpdate", res);
	};

	if (!aiConfigs) {
		return null;
	}

	if (!conversation) {
		return null;
	}

	if (!session) {
		return null;
	}

	const onDragEnd = async (result: any) => {
		if (!result.destination) return;

		const items = Array.from(aiConfigs);
		const [reorderedItem] = items.splice(result.source.index, 1);
		items.splice(result.destination.index, 0, reorderedItem);

		// 更新会话顺序
		updateConversation(conversationId, {
			...session,
			aiConfigs: items,
		});

		// 更新会话顺序
		const res = await updateMultiAgentSession(
			{ custom_agents_data: items },
			conversationId,
		);
		console.log("multipleagents debug: onDragEnd", res);
	};

	return (
		<>
			<div className={styles["addAgentButtonContainer"]}>
				<Button
					icon={<PlusCircleOutlined />}
					onClick={handleModalClick}
					className={styles["addAgentButton"]}
					ghost
					type="primary"
				>
					添加 Agent
				</Button>
			</div>

			<div className={styles.scrollableContainer}>
				<DragDropContext onDragEnd={onDragEnd}>
					<Droppable droppableId="agents">
						{(provided) => (
							<div
								{...provided.droppableProps}
								ref={provided.innerRef}
								className={styles.agentList}
							>
								{aiConfigs.map((agent, index) => (
									<AIConfigCard
										key={agent.id}
										agent={agent}
										index={index}
										agentEditClick={handleAgentEdit}
									/>
								))}
								{provided.placeholder}
							</div>
						)}
					</Droppable>
				</DragDropContext>
			</div>

			{showAgentEdit && (
				<div className="modal-mask">
					<Modal
						title="AI配置"
						onClose={handleAgentUpdate}
						footer={null}
						actions={[<Button onClick={handleAgentUpdate}>保存并关闭</Button>]}
					>
						<AgentConfigCard
							mask={currentAgent}
							updateMask={(updater) => {
								const mask = currentAgent; // 暂时使用第一个配置
								updater(mask);
							}}
						/>
					</Modal>
				</div>
			)}
			{showAgentList && (
				<AntdModal
					open={showAgentList}
					onCancel={handleModalClick}
					footer={null}
					width="70vw"
					height="80vh"
					style={{ overflow: "scroll" }}
				>
					<MaskPage
						onItemClick={(mask) => handleAgentClick(mask)} // 暂时使用第一个配置
						onDelete={onDelete}
					/>
				</AntdModal>
			)}
		</>
	);
};

export default AIConfigPanel;
