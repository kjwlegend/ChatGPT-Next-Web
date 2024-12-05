"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Play, StopCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ThoughtNode, ThinkingSession } from "@/app/boss-mod/types";

export function PlanningView() {
	const [isThinking, setIsThinking] = useState(false);
	const [currentPrompt, setCurrentPrompt] = useState("");
	const [session, setSession] = useState<ThinkingSession | null>(null);
	const { toast } = useToast();

	const startThinking = () => {
		if (!currentPrompt) {
			toast({
				title: "请输入目标",
				description: "在开始思考之前，请先输入目标或提示",
				variant: "destructive",
			});
			return;
		}

		const newSession: ThinkingSession = {
			id: `session-${Date.now()}`,
			goal: currentPrompt,
			status: "thinking",
			thoughts: [],
		};
		setSession(newSession);
		setIsThinking(true);

		// 模拟Agent的思考过程
		simulateThinking(newSession);
	};

	const simulateThinking = (session: ThinkingSession) => {
		// 模拟思考流程
		const thoughtStream: Array<
			Pick<ThoughtNode, "type" | "content"> & Partial<ThoughtNode>
		> = [
			{
				type: "thought",
				content: "分析目标，需要实现用户认证系统...",
			},
			{
				type: "task_group",
				content: "用户认证系统",
				status: "pending",
				children: [
					{
						id: `task-${Date.now()}-1`,
						type: "task",
						content: "实现用户注册功能",
						status: "pending",
						timestamp: new Date().toLocaleTimeString(),
						metadata: {
							estimatedTime: "2d",
							priority: 1,
						},
					},
					{
						id: `task-${Date.now()}-2`,
						type: "task",
						content: "实现登录功能",
						status: "pending",
						timestamp: new Date().toLocaleTimeString(),
						metadata: {
							estimatedTime: "1d",
							priority: 1,
						},
					},
				],
			},
			// ... 更多思考流
		];

		let index = 0;
		const interval = setInterval(() => {
			if (index < thoughtStream.length) {
				const thought = thoughtStream[index];
				const newThought: ThoughtNode = {
					id: `thought-${Date.now()}-${index}`,
					...thought,
					timestamp: new Date().toLocaleTimeString(),
					status:
						thought.type === "task" || thought.type === "task_group"
							? "pending"
							: undefined,
				};

				setSession((prev) => {
					if (!prev) return prev;
					return {
						...prev,
						thoughts: addThoughtToTree(prev.thoughts, newThought),
					};
				});

				index++;
			} else {
				clearInterval(interval);
				setIsThinking(false);
			}
		}, 2000);
	};

	// 将新的思考添加到树中
	const addThoughtToTree = (
		thoughts: ThoughtNode[],
		newThought: ThoughtNode,
	): ThoughtNode[] => {
		// 如果是任务，找到其父任务组
		if (newThought.type === "task") {
			return thoughts.map((thought) => {
				if (thought.type === "task_group") {
					return {
						...thought,
						children: [...(thought.children || []), newThought],
					};
				}
				return thought;
			});
		}
		// 如果是其他类型，直接添加到根级别
		return [...thoughts, newThought];
	};

	const approveTask = (taskId: string) => {
		setSession((prev) => {
			if (!prev) return prev;
			return {
				...prev,
				thoughts: updateTaskStatus(prev.thoughts, taskId, "approved"),
			};
		});
	};

	const rejectTask = (taskId: string) => {
		setSession((prev) => {
			if (!prev) return prev;
			return {
				...prev,
				thoughts: updateTaskStatus(prev.thoughts, taskId, "rejected"),
			};
		});
	};

	// 递归更新任务状态
	const updateTaskStatus = (
		thoughts: ThoughtNode[],
		taskId: string,
		status: "approved" | "rejected",
	): ThoughtNode[] => {
		return thoughts.map((thought) => {
			if (thought.id === taskId) {
				return { ...thought, status };
			}
			if (thought.children) {
				return {
					...thought,
					children: updateTaskStatus(thought.children, taskId, status),
				};
			}
			return thought;
		});
	};

	return (
		<div className="flex h-full flex-col">
			{/* Control Panel */}
			<div className="space-y-4 border-b p-4">
				<div className="flex items-center justify-between">
					<Button
						variant={isThinking ? "destructive" : "default"}
						onClick={() =>
							isThinking ? setIsThinking(false) : startThinking()
						}
						disabled={!currentPrompt || session?.status === "completed"}
					>
						{isThinking ? (
							<>
								<StopCircle className="mr-2 h-4 w-4" />
								停止思考
							</>
						) : (
							<>
								<Play className="mr-2 h-4 w-4" />
								开始思考
							</>
						)}
					</Button>
				</div>

				<Textarea
					placeholder="输入目标或提示..."
					value={currentPrompt}
					onChange={(e) => setCurrentPrompt(e.target.value)}
					className="min-h-[100px]"
					disabled={isThinking}
				/>
			</div>

			{/* Thought Stream */}
			<ScrollArea className="flex-1 p-4">
				<div className="space-y-4">
					{session?.thoughts.map((thought) => (
						<ThoughtNode
							key={thought.id}
							thought={thought}
							onApprove={approveTask}
							onReject={rejectTask}
							level={0}
						/>
					))}
					{isThinking && <ThinkingIndicator />}
				</div>
			</ScrollArea>
		</div>
	);
}

// 思考节点组件
interface ThoughtNodeProps {
	thought: ThoughtNode;
	onApprove: (taskId: string) => void;
	onReject: (taskId: string) => void;
	level: number;
}

function ThoughtNode({
	thought,
	onApprove,
	onReject,
	level,
}: ThoughtNodeProps) {
	return (
		<div className="space-y-2" style={{ marginLeft: `${level * 20}px` }}>
			<Card className="p-4">
				<div className="space-y-2">
					<div className="flex items-start justify-between">
						<div className="space-y-1">
							<div className="flex items-center space-x-2">
								<span className="text-xs text-muted-foreground">
									{thought.timestamp}
								</span>
								<span className={`text-xs ${getTypeStyle(thought.type)}`}>
									{getTypeLabel(thought.type)}
								</span>
								{thought.status && (
									<span className={`text-xs ${getStatusStyle(thought.status)}`}>
										{getStatusLabel(thought.status)}
									</span>
								)}
							</div>
							<p className="text-sm">{thought.content}</p>
							{thought.metadata && (
								<div className="space-x-4 text-xs text-muted-foreground">
									{thought.metadata.estimatedTime && (
										<span>预计时间: {thought.metadata.estimatedTime}</span>
									)}
									{thought.metadata.priority && (
										<span>优先级: P{thought.metadata.priority}</span>
									)}
								</div>
							)}
						</div>
						{(thought.type === "task" || thought.type === "task_group") &&
							thought.status === "pending" && (
								<div className="flex space-x-2">
									<Button
										size="sm"
										variant="outline"
										onClick={() => onApprove(thought.id)}
									>
										批准{thought.type === "task_group" ? "任务组" : "任务"}
									</Button>
									<Button
										size="sm"
										variant="outline"
										onClick={() => onReject(thought.id)}
									>
										拒绝
									</Button>
								</div>
							)}
					</div>
				</div>
			</Card>
			{thought.children && (
				<div className="ml-4 space-y-2">
					{thought.children.map((child) => (
						<ThoughtNode
							key={child.id}
							thought={child}
							onApprove={onApprove}
							onReject={onReject}
							level={level + 1}
						/>
					))}
				</div>
			)}
		</div>
	);
}

function ThinkingIndicator() {
	return (
		<div className="flex animate-pulse items-center space-x-2 text-muted-foreground">
			<div className="h-2 w-2 rounded-full bg-current" />
			<div className="animation-delay-200 h-2 w-2 rounded-full bg-current" />
			<div className="animation-delay-400 h-2 w-2 rounded-full bg-current" />
			<span className="text-sm">思考中...</span>
		</div>
	);
}

function getTypeStyle(type: ThoughtNode["type"]) {
	const styles: Record<ThoughtNode["type"], string> = {
		thought: "text-blue-600",
		task: "text-green-600",
		task_group: "text-yellow-600",
		conclusion: "text-purple-600",
	};
	return styles[type];
}

function getTypeLabel(type: ThoughtNode["type"]) {
	const labels: Record<ThoughtNode["type"], string> = {
		thought: "思考",
		task: "任务",
		task_group: "任务组",
		conclusion: "结论",
	};
	return labels[type];
}

function getStatusStyle(status: NonNullable<ThoughtNode["status"]>) {
	const styles = {
		pending: "bg-yellow-100 text-yellow-800",
		approved: "bg-green-100 text-green-800",
		rejected: "bg-red-100 text-red-800",
	};
	return styles[status];
}

function getStatusLabel(status: NonNullable<ThoughtNode["status"]>) {
	const labels = {
		pending: "待审批",
		approved: "已批准",
		rejected: "已拒绝",
	};
	return labels[status];
}
