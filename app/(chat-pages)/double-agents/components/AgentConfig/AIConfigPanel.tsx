"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Modal as AntdModal } from "antd";
import { Plus } from "lucide-react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

import { useMultipleAgentStore } from "@/app/store/multiagents/index";
import { Mask } from "@/app/types/";
import { Modal } from "@/app/components/ui-lib";
import { AgentConfigCard } from "@/app/(chat-pages)/chats/components/mask-modal";
import { Button } from "@/components/ui/button";
import { useMultipleAgentsChatHook } from "@/app/(chat-pages)/double-agents/hooks/useMultipleAgentsHook";
import { useAgentActions } from "@/app/hooks/useAgentActions";
import { updateMultiAgentSession } from "@/app/services/api/chats";
import MaskPage from "../../../chats/masklist/index";
import AIConfigCard from "./AIConfigCard";
import styles from "./AIConfig.module.scss";

const AIConfigPanel: React.FC = () => {
	// Store hooks
	const {
		updateConversation,
		setAIConfig,
		currentSession,
		currentConversationId,
	} = useMultipleAgentStore();

	const conversation = currentSession();
	const { handleAgentClick } = useMultipleAgentsChatHook();
	const { onDelete } = useAgentActions();

	// Local state
	const [showAgentList, setShowAgentList] = useState(false);
	const [showAgentEdit, setShowAgentEdit] = useState(false);
	const [agentIndex, setAgentIndex] = useState(0);
	const [agentData, setAgentData] = useState<Mask>({} as Mask);

	// Derived state
	const aiConfigs = useMemo(() => {
		return conversation?.aiConfigs || [];
	}, [conversation]);

	const [currentAgent, setCurrentAgent] = useState<Mask>(aiConfigs[0]);

	// Guards
	if (!aiConfigs || !conversation) {
		return null;
	}

	// Event handlers
	const handleModalClick = () => {
		setShowAgentList(!showAgentList);
	};

	const handleAgentEdit = (agent: Mask) => {
		setCurrentAgent(agent);
		setShowAgentEdit(true);
	};

	const handleAgentUpdate = async () => {
		setAIConfig(currentConversationId, agentIndex, agentData);
		setShowAgentEdit(false);

		await updateMultiAgentSession(
			{ custom_agents_data: aiConfigs },
			currentConversationId,
		);
	};

	const onDragEnd = async (result: any) => {
		if (!result.destination) return;

		const items = Array.from(aiConfigs);
		const [reorderedItem] = items.splice(result.source.index, 1);
		items.splice(result.destination.index, 0, reorderedItem);

		updateConversation(currentConversationId, {
			...conversation,
			aiConfigs: items,
		});

		await updateMultiAgentSession(
			{ custom_agents_data: items },
			currentConversationId,
		);
	};

	const handleModeChange = async (
		value: "round-robin" | "random" | "intelligent",
	) => {
		if (!conversation) return;

		const updatedSession = {
			...conversation,
			next_agent_type: value,
		};
		updateConversation(currentConversationId, updatedSession);

		await updateMultiAgentSession(
			{ next_agent_type: value },
			currentConversationId,
		);
	};

	const handleConversationModeChange = async (value: "chat" | "task") => {
		if (!conversation) return;

		const updatedSession = {
			...conversation,
			conversation_mode: value,
		};
		updateConversation(currentConversationId, updatedSession);

		await updateMultiAgentSession(
			{ conversation_mode: value },
			currentConversationId,
		);
	};

	return (
		<>
			<div className="flex flex-col border-b">
				<div className="flex items-center justify-between p-4">
					<h2 className="text-lg font-semibold">Agents</h2>
					<div className="flex items-center gap-2">
						<Select
							value={conversation?.next_agent_type}
							onValueChange={handleModeChange}
						>
							<SelectTrigger className="w-[120px]">
								<SelectValue placeholder="选择模式" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="round-robin">顺序模式</SelectItem>
								<SelectItem value="random">随机模式</SelectItem>
								<SelectItem value="intelligent">智能决策</SelectItem>
							</SelectContent>
						</Select>
						<Button size="icon" variant="ghost" onClick={handleModalClick}>
							<Plus className="h-4 w-4" />
							<span className="sr-only">添加 Agent</span>
						</Button>
					</div>
				</div>

				<div className="border-t px-4 py-2">
					<RadioGroup
						className="flex items-center gap-4"
						defaultValue={conversation?.conversation_mode || "chat"}
						onValueChange={handleConversationModeChange}
					>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="chat" id="chat-mode" />
							<Label htmlFor="chat-mode">对话模式</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="task" id="task-mode" />
							<Label htmlFor="task-mode">任务模式</Label>
						</div>
					</RadioGroup>
				</div>
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
						actions={[
							<Button key="save-and-close" onClick={handleAgentUpdate}>
								保存并关闭
							</Button>,
						]}
					>
						<AgentConfigCard
							mask={currentAgent}
							updateMask={(updater) => {
								const mask = currentAgent;
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
					<MaskPage onItemClick={handleAgentClick} onDelete={onDelete} />
				</AntdModal>
			)}
		</>
	);
};

export default AIConfigPanel;
