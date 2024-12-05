"use client";

import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { TaskGroup, TaskNode } from "../PlanningView";

interface TreeViewProps {
	group: TaskGroup;
}

export function TreeView({ group }: TreeViewProps) {
	return (
		<div className="flex h-full flex-col">
			<div className="mb-4">
				<h3 className="text-lg font-medium">{group.title}</h3>
				<p className="text-sm text-muted-foreground">{group.description}</p>
			</div>

			<ScrollArea className="flex-1">
				<div className="space-y-2">
					{buildTaskTree(group.tasks).map((task) => (
						<TaskTreeNode key={task.id} task={task} level={0} />
					))}
				</div>
			</ScrollArea>
		</div>
	);
}

interface TaskTreeNode extends TaskNode {
	children?: TaskTreeNode[];
}

function TaskTreeNode({ task, level }: { task: TaskTreeNode; level: number }) {
	const [isExpanded, setIsExpanded] = useState(true);
	const hasChildren = task.children && task.children.length > 0;

	return (
		<div>
			<Card className="p-3">
				<div
					className="flex items-start space-x-2"
					style={{ paddingLeft: `${level * 20}px` }}
				>
					{hasChildren && (
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
					)}
					<div className="flex-1">
						<div className="flex items-start justify-between">
							<div>
								<h4 className="font-medium">{task.title}</h4>
								<p className="text-sm text-muted-foreground">{task.content}</p>
							</div>
							<span
								className={`rounded px-2 py-1 text-xs ${getStatusStyle(task.status)}`}
							>
								{getStatusLabel(task.status)}
							</span>
						</div>
						{task.metadata && (
							<div className="mt-2 text-xs text-muted-foreground">
								<span>预计时间: {task.metadata.estimatedTime}</span>
								{task.metadata.assignedTools && (
									<span className="ml-4">
										工具: {task.metadata.assignedTools.join(", ")}
									</span>
								)}
							</div>
						)}
					</div>
				</div>
			</Card>
			{hasChildren && isExpanded && (
				<div className="ml-4">
					{task.children!.map((child) => (
						<TaskTreeNode key={child.id} task={child} level={level + 1} />
					))}
				</div>
			)}
		</div>
	);
}

function buildTaskTree(tasks: TaskNode[]): TaskTreeNode[] {
	const taskMap = new Map<string, TaskTreeNode>();
	const roots: TaskTreeNode[] = [];

	// 首先创建所有节点
	tasks.forEach((task) => {
		taskMap.set(task.id, { ...task, children: [] });
	});

	// 然后建立父子关系
	tasks.forEach((task) => {
		const node = taskMap.get(task.id)!;
		if (task.dependencies.length === 0) {
			roots.push(node);
		} else {
			task.dependencies.forEach((parentId) => {
				const parent = taskMap.get(parentId);
				if (parent) {
					parent.children = parent.children || [];
					parent.children.push(node);
				}
			});
		}
	});

	return roots;
}

function getStatusStyle(status: TaskNode["status"]) {
	const styles = {
		pending: "bg-yellow-100 text-yellow-800",
		in_progress: "bg-blue-100 text-blue-800",
		completed: "bg-green-100 text-green-800",
		blocked: "bg-red-100 text-red-800",
	};
	return styles[status];
}

function getStatusLabel(status: TaskNode["status"]) {
	const labels = {
		pending: "待处理",
		in_progress: "进行中",
		completed: "已完成",
		blocked: "已阻塞",
	};
	return labels[status];
}
