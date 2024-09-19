// src/components/ChatArea/AIConfigCard.tsx

import React, { forwardRef } from "react";
import {
	Card,
	Button,
	Slider,
	Tooltip,
	Dropdown,
	Tag,
	Checkbox,
	Badge,
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
	modelTag: string;
	description: string;
	onEdit: () => void;
	onDelete: () => void;
	draggableProps: any;
	dragHandleProps: any;
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
						<Avatar size={64} nickname={name} />
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
						<div>
							<Tag color="blue">{modelTag}</Tag>
						</div>
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

	const { deleteAgent } = useConversationActions();

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

	return (
		<Draggable key={agent.id} draggableId={agent.id.toString()} index={index}>
			{(provided) => (
				<AgentCard
					draggableProps={provided.draggableProps}
					dragHandleProps={provided.dragHandleProps}
					ref={provided.innerRef}
					key={agent.id}
					name={agent.name}
					agentIndex={index}
					modelTag={agent.modelConfig.model}
					description={agent.description}
					onEdit={() => agentEditClick(agent)}
					onDelete={() => handleDeleteAI(index)}
				/>
				// <Card
				// 	ref={provided.innerRef}
				// 	{...provided.draggableProps}
				// 	{...provided.dragHandleProps}
				// 	className={styles.aiConfigCard}
				// 	actions={[
				// 		<Button
				// 			key={config.id + "setting"}
				// 			onClick={() => setShowModal(true)}
				// 			icon={<SettingOutlined />}
				// 		>
				// 			配置
				// 		</Button>,
				// 		<Button
				// 			key={config.id + "delete"}
				// 			danger
				// 			onClick={() => handleDeleteAI(index)}
				// 			icon={<PlusCircleOutlined />}
				// 		>
				// 			删除
				// 		</Button>,
				// 		<a onClick={(e) => e.preventDefault()}>
				// 			<Button icon={<SwitcherOutlined />} onClick={() => {}}>
				// 				替换
				// 			</Button>
				// 		</a>,
				// 	]}
				// >
				// 	<div className="flex-container column">
				// 		<Avatar size={55} icon={<UserOutlined />} />
				// 		<h3>{config.name}</h3>
				// 	</div>
				// 	<p>{config.description}</p>
				// 	<Tag>模型: {config.modelConfig.model}</Tag>
				// 	<Dropdown menu={{ items: plugins }}>
				// 		<Button
				// 			icon={
				// 				config.plugins.length > 0 ? (
				// 					<ThunderboltTwoTone />
				// 				) : (
				// 					<ApiTwoTone />
				// 				)
				// 			}
				// 			onClick={(e) => e.preventDefault()}
				// 		>
				// 			{config.plugins.length > 0 ? "禁用插件" : "启用插件"}
				// 		</Button>
				// 	</Dropdown>
				// 	{renderSlider(
				// 		"多样性（Temperature）",
				// 		"temperature",
				// 		config.modelConfig.temperature,
				// 		0.01,
				// 		1,
				// 		"控制输出的随机性和多样性",
				// 	)}
				// 	{renderSlider(
				// 		"概率阈值（Top P）",
				// 		"top_p",
				// 		config.modelConfig.top_p,
				// 		0.01,
				// 		1,
				// 		"保留的概率阈值",
				// 	)}
				// 	{renderSlider(
				// 		"新主题惩罚（Presence Penalty）",
				// 		"presence_penalty",
				// 		config.modelConfig.presence_penalty,
				// 		0.01,
				// 		1,
				// 		"引入新主题的频率",
				// 	)}
				// 	{renderSlider(
				// 		"重复主题惩罚（Frequency Penalty）",
				// 		"frequency_penalty",
				// 		config.modelConfig.frequency_penalty,
				// 		0.01,
				// 		1,
				// 		"限制重复主题的频率",
				// 	)}
				// </Card>
			)}
		</Draggable>
	);
};

export default AIConfigCard;
