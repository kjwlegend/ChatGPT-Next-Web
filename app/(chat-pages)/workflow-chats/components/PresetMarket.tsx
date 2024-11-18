"use client";

import * as React from "react";
import {
	Search,
	Tag,
	ChevronRight,
	User,
	BarChart2,
	Eye,
	EyeIcon,
} from "lucide-react";
import { useMultipleAgents } from "../hooks/useWorkflow/useMultipleAgents";
import { useWorkflowGroups } from "../hooks/useWorkflow/useWorkflowGroups";
import { useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { oss_base } from "@/app/constant";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMasks } from "@/app/hooks/useMasks";
import { useMaskStore } from "@/app/store";
import { Mask } from "@/app/types/";

interface Preset {
	id: string;
	title: string;
	description: string;
	agents: Array<{
		id: string;
		name: string;
		description: string;
		image?: string;
	}>;
	creator: string;
	tags: string[];
	usageCount: number;
}

const MOCK_PRESETS: Preset[] = [
	{
		id: "preset-1",
		title: "客服工作流",
		description: "自动化客户服务响应流程，包含问题分类、回答生成和升级处理。",
		agents: [
			{ id: "a1", name: "分类助手", description: "问题分类" },
			{ id: "a2", name: "回答生成器", description: "回答生成" },
			{ id: "a3", name: "质量检查", description: "答案审核" },
		],
		creator: "系统管理员",
		tags: ["客服", "自动化", "工作流"],
		usageCount: 1234,
	},
	{
		id: "preset-2",
		title: "内容创作助手",
		description: "多步骤内容创作流程，包含主题研究、大纲生成和内容撰写。",
		agents: [
			{ id: "a4", name: "研究助手", description: "主题研究" },
			{ id: "a5", name: "大纲生成器", description: "结构规划" },
			{ id: "a6", name: "写作助手", description: "内容创作" },
		],
		creator: "内容团队",
		tags: ["创作", "写作", "内容"],
		usageCount: 5678,
	},
];

interface PresetMarketProps {
	onPresetSelect?: (agent: any, selectedId: string) => Promise<void>;
}

export function PresetMarket({ onPresetSelect }: PresetMarketProps) {
	const [searchQuery, setSearchQuery] = React.useState("");
	const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
	const [filteredPresets, setFilteredPresets] = React.useState<Preset[]>([]);

	// 使用 useMultipleAgents hook
	const {
		agents: multipleAgents,
		loading,
		fetchMultipleAgents,
		contextHolder,
	} = useMultipleAgents();

	const { selectMaskById } = useMaskStore();
	// 在组件加载时获取多智能体列表
	React.useEffect(() => {
		fetchMultipleAgents();
	}, [fetchMultipleAgents]);

	// 将 multipleAgents 转换为 Preset 格式
	React.useEffect(() => {
		const presets: Preset[] = multipleAgents.map((agent) => ({
			id: agent.multiple_agent_id,
			title: agent.multiple_agent_name,
			description: agent.description || "",
			agents:
				agent.agents_data?.map((agentData: any, index: number) => ({
					id: agentData.agent_id,
					name: agentData.agent_name || `Agent ${index + 1}`,
					description: agentData.description || `Role ${index + 1}`,
					image: agentData.image || "",
				})) || [],
			creator: agent.creator || "",
			tags: agent.tags ? agent.tags.map((tag: any) => tag.tag_name) : ["预设"],
			usageCount: agent.use_count || 0,
		}));

		const filtered = presets.filter((preset) => {
			const matchesSearch =
				searchQuery === "" ||
				preset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				preset.description.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesTags =
				selectedTags.length === 0 ||
				selectedTags.every((tag) => preset.tags.includes(tag));

			return matchesSearch && matchesTags;
		});

		setFilteredPresets(filtered);
	}, [multipleAgents, searchQuery, selectedTags]);

	// Get unique tags from all presets
	const allTags = React.useMemo(() => {
		const tags = new Set<string>();
		filteredPresets.forEach((preset) => {
			preset.tags.forEach((tag) => tags.add(tag));
		});
		return Array.from(tags);
	}, [filteredPresets]);

	const toggleTag = (tag: string) => {
		setSelectedTags((prev) =>
			prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
		);
	};

	const { createWorkflowGroup, setSelectedId, selectedId } =
		useWorkflowGroups();

	const handleAgentClick = async (preset: any) => {
		try {
			if (onPresetSelect) {
				// 如果父组件提供了处理函数，则使用父组件的处理逻辑
				// get agent by preset.agents
				console.log(preset);
				const agentIds = preset.agents.map((agent: any) => agent.id);

				console.log(agentIds);
				// get mask by agentIds
				const masks = agentIds.map((id: string) => selectMaskById(id));

				console.log(masks);
				//  for each mask, add to workflow
				masks.forEach(async (mask: Mask) => {
					await onPresetSelect(mask, selectedId);
				});
			} else {
				// 默认行为：创建工作流组
				const workflowId = await createWorkflowGroup({
					multiple_agents: preset.id,
					session_topic: preset.title,
				});

				if (workflowId) {
					setSelectedId(workflowId);
				}
			}
		} catch (error) {
			console.error("Failed to create workflow group:", error);
		}
	};

	if (loading) {
		return (
			<div className="flex h-full items-center justify-center">加载中...</div>
		);
	}

	return (
		<div className="flex flex-col gap-6 p-6">
			<div className="flex flex-col gap-4">
				<h1 className="text-2xl font-bold">工作流预设</h1>
				<div className="flex flex-col gap-4">
					<div className="relative">
						<Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="搜索预设..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-8"
						/>
					</div>
					<div className="flex flex-wrap gap-2">
						{allTags.map((tag) => (
							<Toggle
								key={tag}
								pressed={selectedTags.includes(tag)}
								onPressedChange={() => toggleTag(tag)}
								variant="outline"
								size="sm"
							>
								<Tag className="mr-2 h-3 w-3" />
								{tag}
							</Toggle>
						))}
					</div>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{filteredPresets.map((preset, index) => (
					<Card
						key={preset.id}
						className="group relative transition-all duration-300 hover:shadow-lg"
					>
						<div className="absolute right-4 top-4">
							<Button
								onClick={(e) => {
									e.stopPropagation();
									handleAgentClick(preset);
								}}
								variant="outline"
								size="sm"
								className="hover:bg-primary hover:text-primary-foreground"
							>
								使用此预设
							</Button>
						</div>
						<CardHeader>
							<div className="flex items-center gap-4 border-b pb-2">
								<h3 className="text-normal text-left font-bold">
									{preset.title}
								</h3>
							</div>
							<div className="mt-4 flex flex-col">
								<div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
									<div className="flex items-center">
										<User className="mr-1 h-3 w-3" />
										<span className="mr-2">@{preset.creator}</span>
									</div>
									<div>
										<span className="flex items-center text-xs font-medium text-muted-foreground">
											<EyeIcon className="mr-2 h-3 w-3" />
											<span>{preset.usageCount}</span>
										</span>
									</div>
								</div>
								<p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
									{preset.description}
								</p>
							</div>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col gap-4">
								<div>
									<div className="mt-2 flex items-center overflow-x-auto pb-2">
										{preset.agents.map((agent, index) => (
											<React.Fragment key={agent.id}>
												<Tooltip>
													<TooltipTrigger asChild>
														<div className="flex flex-col items-center">
															{agent.image ? (
																<div className="h-10 w-10 overflow-hidden rounded-full">
																	<img
																		src={`${oss_base}/${agent.image}`}
																		alt={agent.name}
																		className="h-full w-full object-cover"
																	/>
																</div>
															) : (
																<div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
																	{agent.name[0]}
																</div>
															)}
															<span className="mt-1 max-w-[60px] truncate text-xs">
																{agent.name}
															</span>
														</div>
													</TooltipTrigger>
													<TooltipContent>
														<p>{agent.description}</p>
													</TooltipContent>
												</Tooltip>
												{index < preset.agents.length - 1 && (
													<ChevronRight className="mx-2 h-4 w-4 shrink-0 text-muted-foreground" />
												)}
											</React.Fragment>
										))}
									</div>
								</div>
								<Separator />
								<div className="flex flex-wrap gap-2">
									{preset.tags.map((tag) => (
										<Badge key={tag} variant="secondary">
											<Tag className="mr-1 h-3 w-3" />
											{tag}
										</Badge>
									))}
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
