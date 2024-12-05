"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Play,
	RefreshCcw,
	Wrench,
	Brain,
	CheckCircle2,
	FileOutput,
	ChevronDown,
	ChevronRight,
	Copy,
	RotateCcw,
	Search,
	Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { ActionNode, ActionStep, ActionType } from "@/app/boss-mod/types";

// Mock 数据
const mockActions: ActionNode[] = [
	{
		id: "action-1",
		taskId: "task-1",
		taskContent: "实现用户注册功能",
		status: "completed",
		timestamp: "2024-03-15 14:30:00",
		steps: [
			{
				id: "step-1",
				type: "execute",
				content: "分析任务需求",
				timestamp: "2024-03-15 14:30:00",
				status: "completed",
				metadata: {
					llmResponse: {
						thought: "需要实现用户注册功能，首先需要分析具体需求...",
						reasoning:
							"1. 需要收集用户信息\n2. 需要验证数据格式\n3. 需要保存到数据库",
						plan: "先创建数据模型，然后实现验证逻辑，最后完成数据库操作",
					},
				},
			},
			{
				id: "step-2",
				type: "use_tool",
				content: "使用代码生成工具",
				timestamp: "2024-03-15 14:30:05",
				status: "completed",
				metadata: {
					toolName: "code-generator",
					llmResponse: {
						thought: "需要生成用户模型，应包含基本字段和验证规则",
						reasoning: "使用代码生成工具可以快速创建基础结构，并确保代码质量",
					},
					functionCall: {
						name: "generateUserModel",
						arguments: {
							fields: ["username", "email", "password"],
							validations: ["required", "email", "min:6"],
						},
						result: "生成成功",
					},
				},
			},
			{
				id: "step-3",
				type: "save_memory",
				content: "保存实现经验",
				timestamp: "2024-03-15 14:31:00",
				status: "completed",
				metadata: {
					memoryId: "mem-1",
					result: "已保存用户注册功能的实现经验",
				},
			},
		],
	},
	{
		id: "action-2",
		taskId: "task-2",
		taskContent: "优化数据库查询性能",
		status: "running",
		timestamp: "2024-03-15 15:00:00",
		steps: [
			{
				id: "step-4",
				type: "replan",
				content: "性能问题分析",
				timestamp: "2024-03-15 15:00:00",
				status: "completed",
				metadata: {
					llmResponse: {
						thought: "当前查询性能不佳，需要重新规划查询策略",
						reasoning:
							"1. 当前查询未使用索引\n2. 存在N+1查询问题\n3. 缺少缓存机制",
						criticism: "之前的实现过于简单，没有考虑性能问题",
						plan: "1. 添加必要索引\n2. 优化关联查询\n3. 实现缓存层",
					},
				},
			},
			{
				id: "step-5",
				type: "use_tool",
				content: "数据库性能分析",
				timestamp: "2024-03-15 15:05:00",
				status: "completed",
				metadata: {
					toolName: "db-analyzer",
					functionCall: {
						name: "analyzeDatabasePerformance",
						arguments: {
							query: "SELECT * FROM users JOIN orders",
							timeRange: "24h",
						},
						result: "找到3个潜在的性能问题",
					},
				},
			},
			{
				id: "step-6",
				type: "evaluate",
				content: "评估优化效果",
				timestamp: "2024-03-15 15:10:00",
				status: "completed",
				metadata: {
					llmResponse: {
						thought: "分析优化后的性能指标",
						reasoning: "对比优化前后的查询时间和资源消耗",
						criticism: "虽有改善，但缓存策略可以进一步优化",
					},
					result: "查询性能提升了60%",
				},
			},
			{
				id: "step-7",
				type: "output",
				content: "生成性能报告",
				timestamp: "2024-03-15 15:15:00",
				status: "completed",
				metadata: {
					result: "性能优化报告已生成：/reports/perf-2024-03-15.pdf",
				},
			},
		],
	},
];

export function ActionsView() {
	const [searchTerm, setSearchTerm] = useState("");
	const [filterType, setFilterType] = useState<ActionType | "all">("all");

	const filteredActions = mockActions.filter((action) => {
		const matchesSearch =
			action.taskContent.toLowerCase().includes(searchTerm.toLowerCase()) ||
			action.steps.some((step) =>
				step.content.toLowerCase().includes(searchTerm.toLowerCase()),
			);

		if (filterType === "all") return matchesSearch;

		return (
			matchesSearch && action.steps.some((step) => step.type === filterType)
		);
	});

	return (
		<div className="flex h-full flex-col">
			<div className="border-b p-4">
				<div className="flex space-x-4">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="搜索执行记录..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-9"
						/>
					</div>
					<Select
						value={filterType}
						onValueChange={(value) =>
							setFilterType(value as ActionType | "all")
						}
					>
						<SelectTrigger className="w-[180px]">
							<Filter className="mr-2 h-4 w-4" />
							<SelectValue placeholder="过滤类型" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">全部类型</SelectItem>
							<SelectItem value="execute">执行</SelectItem>
							<SelectItem value="replan">重新规划</SelectItem>
							<SelectItem value="use_tool">工具调用</SelectItem>
							<SelectItem value="save_memory">保存记忆</SelectItem>
							<SelectItem value="evaluate">评估</SelectItem>
							<SelectItem value="output">输出</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<ScrollArea className="flex-1">
				<div className="space-y-4 p-4">
					{filteredActions.map((action) => (
						<ActionTaskCard key={action.id} action={action} />
					))}
				</div>
			</ScrollArea>
		</div>
	);
}

function ActionTaskCard({ action }: { action: ActionNode }) {
	const [isExpanded, setIsExpanded] = useState(true);

	return (
		<Card className="p-4">
			<div className="space-y-3">
				{/* Task Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-3">
						<Button
							variant="ghost"
							size="sm"
							className="h-6 w-6 p-0"
							onClick={() => setIsExpanded(!isExpanded)}
						>
							{isExpanded ? (
								<ChevronDown className="h-4 w-4" />
							) : (
								<ChevronRight className="h-4 w-4" />
							)}
						</Button>
						<div>
							<h3 className="font-medium">{action.taskContent}</h3>
							<p className="text-xs text-muted-foreground">
								{action.timestamp}
							</p>
						</div>
					</div>
					<ActionStatus status={action.status} />
				</div>

				{/* Steps */}
				{isExpanded && (
					<div className="ml-6 space-y-3 border-l pl-4">
						{action.steps.map((step) => (
							<ActionStepCard key={step.id} step={step} />
						))}
					</div>
				)}
			</div>
		</Card>
	);
}

function ActionStepCard({ step }: { step: ActionStep }) {
	const [showDetails, setShowDetails] = useState(false);
	const { toast } = useToast();

	const handleCopy = (text: string) => {
		navigator.clipboard.writeText(text);
		toast({
			description: "已复制到剪贴板",
		});
	};

	const handleRetry = async (stepId: string) => {
		try {
			// 这里实现重试逻辑
			toast({
				description: "正在重试...",
			});
		} catch (error) {
			toast({
				variant: "destructive",
				description: "重试失败，请稍后再试",
			});
		}
	};

	return (
		<div className="space-y-2">
			<div className="flex items-start justify-between">
				<div className="flex items-center space-x-2">
					<ActionIcon type={step.type} />
					<div>
						<div className="flex items-center space-x-2">
							<span className="text-sm">{step.content}</span>
							<ActionStatus status={step.status} />
						</div>
						<span className="text-xs text-muted-foreground">
							{step.timestamp}
						</span>
					</div>
				</div>
				<div className="flex items-center space-x-2">
					{step.status === "failed" && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => handleRetry(step.id)}
						>
							<RotateCcw className="mr-1 h-4 w-4" />
							重试
						</Button>
					)}
					{step.metadata && (
						<>
							<Button
								variant="ghost"
								size="sm"
								onClick={() =>
									handleCopy(JSON.stringify(step.metadata, null, 2))
								}
							>
								<Copy className="mr-1 h-4 w-4" />
								复制
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setShowDetails(!showDetails)}
							>
								{showDetails ? "隐藏详情" : "查看详情"}
							</Button>
						</>
					)}
				</div>
			</div>

			{showDetails && step.metadata && (
				<div className="space-y-2">
					{/* LLM Response */}
					{step.metadata.llmResponse && (
						<div className="space-y-2 rounded-md bg-blue-50 p-3">
							{Object.entries(step.metadata.llmResponse).map(([key, value]) => (
								<div key={key} className="group relative">
									<div className="flex items-start justify-between">
										<span className="text-xs font-medium text-blue-500">
											{key === "thought"
												? "思考过程"
												: key === "reasoning"
													? "推理过程"
													: key === "criticism"
														? "自我评估"
														: "执行计划"}
										</span>
										<Button
											variant="ghost"
											size="sm"
											className="opacity-0 transition-opacity group-hover:opacity-100"
											onClick={() => handleCopy(value)}
										>
											<Copy className="h-3 w-3" />
										</Button>
									</div>
									<p className="whitespace-pre-line text-sm text-blue-700">
										{value}
									</p>
								</div>
							))}
						</div>
					)}

					{/* Function Call */}
					{step.metadata?.functionCall && (
						<div className="group relative rounded-md bg-purple-50 p-3">
							<div className="flex items-start justify-between">
								<span className="text-xs font-medium text-purple-500">
									工具调用
								</span>
								<Button
									variant="ghost"
									size="sm"
									className="opacity-0 transition-opacity group-hover:opacity-100"
									onClick={() =>
										step.metadata?.functionCall &&
										handleCopy(
											JSON.stringify(step.metadata.functionCall, null, 2),
										)
									}
								>
									<Copy className="h-3 w-3" />
								</Button>
							</div>
							<div className="font-mono text-sm text-purple-700">
								<pre>{JSON.stringify(step.metadata.functionCall, null, 2)}</pre>
							</div>
						</div>
					)}

					{/* Result */}
					{step.metadata?.result && (
						<div className="group relative rounded-md bg-green-50 p-3">
							<div className="flex items-start justify-between">
								<span className="text-xs font-medium text-green-500">
									执行结果
								</span>
								<Button
									variant="ghost"
									size="sm"
									className="opacity-0 transition-opacity group-hover:opacity-100"
									onClick={() =>
										step.metadata?.result && handleCopy(step.metadata.result)
									}
								>
									<Copy className="h-3 w-3" />
								</Button>
							</div>
							<p className="text-sm text-green-700">{step.metadata.result}</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

function ActionIcon({ type }: { type: ActionStep["type"] }) {
	const icons: Record<ActionType, JSX.Element> = {
		execute: <Play className="h-4 w-4 text-blue-500" />,
		replan: <RefreshCcw className="h-4 w-4 text-yellow-500" />,
		use_tool: <Wrench className="h-4 w-4 text-purple-500" />,
		save_memory: <Brain className="h-4 w-4 text-green-500" />,
		evaluate: <CheckCircle2 className="h-4 w-4 text-orange-500" />,
		output: <FileOutput className="h-4 w-4 text-cyan-500" />,
	};
	return icons[type];
}

function ActionStatus({ status }: { status: ActionNode["status"] }) {
	const styles = {
		running: "bg-blue-100 text-blue-800",
		completed: "bg-green-100 text-green-800",
		failed: "bg-red-100 text-red-800",
	};

	const labels = {
		running: "执行中",
		completed: "已完成",
		failed: "失败",
	};

	return (
		<Badge variant="outline" className={styles[status]}>
			{labels[status]}
		</Badge>
	);
}
