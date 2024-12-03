// src/components/ChatArea/AIConfigCard.tsx

import React, { forwardRef, useState } from "react";
import {
	Card,
	// Button,
	Slider,
	Tooltip,
	Dropdown,
	Tag,
	Checkbox,
	Badge,
	Menu,
} from "antd";

import { Button } from "@/components/ui/button";

import {
	GripIcon,
	MoreVerticalIcon,
	PencilIcon,
	TrashIcon,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import { useMultipleAgentStore } from "@/app/store/multiagents/index";
import { AIConfig } from "../../types";
import { Mask } from "@/app/types/";
import { usePluginStore } from "@/app/store/plugin";
import { getLang } from "@/app/locales";
import Avatar from "@/app/components/avatar";
import { useConversationActions } from "../../hooks/useConversationActions";
import { ChevronDownIcon } from "@radix-ui/react-icons";

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
		const statusColors = {
			active: "bg-green-500",
			idle: "bg-gray-500",
			thinking: "bg-yellow-500",
		};

		const randomStatus =
			Object.keys(statusColors)[
				Math.floor(Math.random() * Object.keys(statusColors).length)
			];

		return (
			<div
				className={styles.agentCard}
				ref={ref}
				{...draggableProps}
				{...dragHandleProps}
			>
				<div className="flex items-center space-x-2 rounded-lg border bg-background p-2">
					<div className="cursor-move" {...dragHandleProps}>
						<GripIcon className="h-5 w-5 text-muted-foreground" />
					</div>
					<Avatar size={50} avatar={avatar} nickname={name} />
					<div className="flex-1">
						<Tooltip title={description}>
							<div className="font-medium">{name}</div>
						</Tooltip>
						<div className="text-sm text-muted-foreground">{modelTag}</div>
					</div>
					<div
						className={`h-2 w-2 rounded-full ${statusColors[randomStatus as keyof typeof statusColors]}`}
					/>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon">
								<MoreVerticalIcon className="h-4 w-4" />
								<span className="sr-only">打开菜单</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onSelect={onEdit}>
								<PencilIcon className="mr-2 h-4 w-4" />
								<span>编辑</span>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onSelect={onDelete} className="text-red-600">
								<TrashIcon className="mr-2 h-4 w-4" />
								<span>删除</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
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
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									className="border-1 h-8 border-transparent bg-transparent text-sm font-normal hover:border-border"
								>
									{currentModel}
									<ChevronDownIcon className="ml-2 h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-[200px]">
								{DEFAULT_MODELS.flatMap((provider) =>
									provider.models
										.filter((model) => model.available)
										.map((model) => (
											<DropdownMenuItem
												key={model.name}
												onClick={() => handleModelChange(model.name)}
											>
												{model.displayName}
											</DropdownMenuItem>
										)),
								)}
							</DropdownMenuContent>
						</DropdownMenu>
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
