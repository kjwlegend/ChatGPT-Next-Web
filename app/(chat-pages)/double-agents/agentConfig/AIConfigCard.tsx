// src/components/ChatArea/AIConfigCard.tsx

import React, { forwardRef, useState } from "react";
import {
	Card,
	Button,
	Slider,
	Tooltip,
	Dropdown,
	Tag,
	Checkbox,
	Badge,
	Menu,
} from "antd";
import {
	SettingOutlined,
	UserOutlined,
	PlusCircleOutlined,
	SwitcherOutlined,
	ApiTwoTone,
	ThunderboltTwoTone,
	EditOutlined,
	DeleteOutlined,
	SwapOutlined,
} from "@ant-design/icons";
import { DownOutlined } from "@ant-design/icons";
import { DEFAULT_MODELS } from "@/app/constant";
import {
	DragDropContext,
	Droppable,
	Draggable,
	OnDragEndResponder,
	OnDragUpdateResponder,
} from "@hello-pangea/dnd";

import styles from "./AIConfig.module.scss";
import {
	useMultipleAgentStore,
	MultiAgentChatSession,
} from "@/app/store/multiagents";
import { AIConfig } from "../types";
import { Mask } from "@/app/types/";
import { usePluginStore } from "@/app/store/plugin";
import { getLang } from "@/app/locales";
import { Avatar } from "@/app/components/avatar";
import { useConversationActions } from "../multiAgentContext";

interface AgentCardProps {
	name: string;
	agentIndex: number;
	modelTag: React.ReactNode;
	description: string;

	onEdit: () => void;
	onDelete: () => void;
	draggableProps: any;
	dragHandleProps: any;
	avatar?: string;
}

const AgentCard = forwardRef<HTMLDivElement, AgentCardProps>(
	(
		{
			name,
			agentIndex,
			modelTag,
			description,
			onEdit,
			onDelete,
			draggableProps,
			dragHandleProps,
			avatar,
		},
		ref,
	) => {
		return (
			<div
				className={styles.agentCard}
				ref={ref}
				{...draggableProps}
				{...dragHandleProps}
			>
				<div className={styles.cardContent}>
					<div className={styles.avatarSection}>
						<Avatar size={50} avatar={avatar} nickname={name} />
					</div>
					<div>
						<h3>
							<Badge
								count={agentIndex + 1}
								showZero
								color="cyan"
								size="small"
								style={{
									marginRight: 8,
								}}
							></Badge>
							{name}
						</h3>
						<div>{modelTag}</div>
					</div>

					<div className={styles.actionSection}>
						<Button icon={<EditOutlined />} onClick={onEdit}></Button>
						<Button
							icon={<DeleteOutlined />}
							onClick={onDelete}
							danger
						></Button>
					</div>
				</div>
				<div className={styles.infoSection}>
					<p>{description}</p>
				</div>
			</div>
		);
	},
);

AgentCard.displayName = "AgentCard";

interface AIConfigCardProps {
	agent: Mask;
	index: number;
	agentEditClick: (agent: Mask) => void;
}
const AIConfigCard: React.FC<AIConfigCardProps> = ({
	agent,
	index,
	agentEditClick,
}) => {
	const {
		setAIConfig,
		clearAIConfig,
		updateConversation,
		currentConversationId,
	} = useMultipleAgentStore();

	const { deleteAgent, updateAgent } = useConversationActions();

	const handleSliderChange = (value: number) => {
		// 更新滑块值的逻辑
	};
	const availablePlugins = usePluginStore()
		.getAll()
		.filter((p) => getLang() === p.lang);

	const plugins = availablePlugins.map((p) => ({
		key: p.name,
		label: (
			<Checkbox
			// checked={aiConfigs.some(
			// 	(config) =>
			// 		config.plugins && config.plugins.includes(p.toolName ?? p.name),
			// )}
			// onChange={(e) => {
			// 	updatePlugins(e, p);
			// }}
			// onClick={(e) => {
			// 	e.stopPropagation();
			// }}
			>
				{p.name}
			</Checkbox>
		),
	}));

	const handleDeleteAI = (agentId: number) => {
		deleteAgent(agentId);
	};

	const [currentModel, setCurrentModel] = useState(agent.modelConfig.model);

	const handleModelChange = (newModel: string) => {
		setCurrentModel(newModel);
		const updatedAgent = {
			...agent,
			modelConfig: {
				...agent.modelConfig,
				model: newModel,
			},
		};
		updateAgent(index, updatedAgent);
	};

	const modelMenu = (
		<Menu onClick={({ key }) => handleModelChange(key as string)}>
			{DEFAULT_MODELS.flatMap((provider) =>
				provider.models
					.filter((model) => model.available)
					.map((model) => (
						<Menu.Item key={model.name}>{model.displayName}</Menu.Item>
					)),
			)}
		</Menu>
	);

	return (
		<Draggable key={agent.id} draggableId={agent.id.toString()} index={index}>
			{(provided) => (
				<AgentCard
					draggableProps={provided.draggableProps}
					dragHandleProps={provided.dragHandleProps}
					ref={provided.innerRef}
					key={agent.id}
					name={agent.name}
					avatar={agent.avatar}
					agentIndex={index}
					modelTag={
						<Dropdown overlay={modelMenu} trigger={["click"]}>
							<Button>
								{currentModel} <DownOutlined />
							</Button>
						</Dropdown>
					}
					description={agent.description}
					onEdit={() => agentEditClick(agent)}
					onDelete={() => handleDeleteAI(index)}
				/>
			)}
		</Draggable>
	);
};

export default AIConfigCard;
