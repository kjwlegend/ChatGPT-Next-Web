"use client";
// src/components/ChatArea/AIConfigPanel.tsx

import { BotAvatar as MaskAvatar } from "@/app/components/emoji";
import {
	useMultipleAgentStore,
	MultiAgentChatSession,
} from "@/app/store/multiagents";
import styles from "../multi-agents.module.scss";

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
import { useMultiAgentChatContext } from "../multiAgentContext";
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
// import styles from "./AIConfigPanel.module.css"; // 假设你有一个CSS模块文件
const AIConfigPanel: React.FC = () => {
	const {
		conversations,
		currentConversationId,
		updateConversation,
		setAIConfig,
	} = useMultipleAgentStore();

	const { handleAgentClick } = useMultipleAgentsChatHook();
	const { onDelete } = useAgentActions();
	const [showAgentList, setShowAgentList] = useState(false);
	const [showAgentEdit, setShowAgentEdit] = useState(false);
	const [agentIndex, setAgentIndex] = useState(0);
	const [agentData, setAgentData] = useState<Mask>({} as Mask);

	const session = conversations.find(
		(c: MultiAgentChatSession) => c.id === currentConversationId,
	);

	const aiConfigs = useMemo(() => {
		const session = conversations.find(
			(c: MultiAgentChatSession) => c.id === currentConversationId,
		);
		return session?.aiConfigs || [];
	}, [conversations, currentConversationId]);

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

	const handleAgentUpdate = () => {
		setAIConfig(currentConversationId, agentIndex, agentData); // 暂时使用第一个配置
		setShowAgentEdit(false);
	};

	if (!aiConfigs) {
		return null;
	}

	if (!conversations) {
		return null;
	}

	if (!session) {
		return null;
	}

	const onDragEnd = (result: any) => {
		if (!result.destination) return;

		const items = Array.from(aiConfigs);
		const [reorderedItem] = items.splice(result.source.index, 1);
		items.splice(result.destination.index, 0, reorderedItem);

		// 更新会话顺序
		updateConversation(currentConversationId, {
			...session,
			aiConfigs: items,
		});
	};

	return (
		<>
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
				<Button icon={<PlusCircleOutlined />} onClick={handleModalClick}>
					添加 Agent
				</Button>
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
