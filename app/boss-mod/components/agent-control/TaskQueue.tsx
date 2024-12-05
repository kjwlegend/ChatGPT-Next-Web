"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { ThoughtNode } from "@/app/boss-mod/types";

interface TaskQueueProps {
	thoughts: ThoughtNode[];
	onTaskClick: (taskId: string) => void;
}

export function TaskQueue({ thoughts, onTaskClick }: TaskQueueProps) {
	// 过滤出已批准的任务组
	const approvedTaskGroups = thoughts.filter(
		(thought) => thought.type === "task_group" && thought.status === "approved",
	);

	return (
		<div className="space-y-2">
			<h3 className="font-medium">任务队列</h3>
			<ScrollArea className="h-[400px]">
				<div className="space-y-4">
					{approvedTaskGroups.map((group) => (
						<TaskGroupNode
							key={group.id}
							group={group}
							onTaskClick={onTaskClick}
						/>
					))}
				</div>
			</ScrollArea>
		</div>
	);
}

interface TaskGroupNodeProps {
	group: ThoughtNode;
	onTaskClick: (taskId: string) => void;
}

function TaskGroupNode({ group, onTaskClick }: TaskGroupNodeProps) {
	const [isExpanded, setIsExpanded] = useState(true);
	const approvedTasks = group.children?.filter(
		(task) => task.status === "approved",
	);

	if (!approvedTasks?.length) return null;

	return (
		<div className="space-y-2">
			<div className="flex items-center space-x-2">
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
				<div className="flex flex-1 items-center justify-between">
					<div>
						<h4 className="text-sm font-medium">{group.content}</h4>
						{group.metadata?.estimatedTime && (
							<p className="text-xs text-muted-foreground">
								预计时间: {group.metadata.estimatedTime}
							</p>
						)}
					</div>
					<Badge variant="outline">{approvedTasks.length} 个任务</Badge>
				</div>
			</div>

			{isExpanded && (
				<div className="ml-6 space-y-2">
					{approvedTasks.map((task) => (
						<Card
							key={task.id}
							className="cursor-pointer p-3 hover:bg-accent"
							onClick={() => onTaskClick(task.id)}
						>
							<div className="space-y-1">
								<div className="flex items-start justify-between">
									<div>
										<p className="text-sm">{task.content}</p>
										{task.metadata && (
											<div className="flex space-x-2 text-xs text-muted-foreground">
												{task.metadata.estimatedTime && (
													<span>{task.metadata.estimatedTime}</span>
												)}
												{task.metadata.priority && (
													<span>P{task.metadata.priority}</span>
												)}
											</div>
										)}
									</div>
									<Badge variant="secondary">进行中</Badge>
								</div>
							</div>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
