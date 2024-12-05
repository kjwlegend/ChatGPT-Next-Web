"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskQueue } from "./TaskQueue";
import { SystemStatus } from "./SystemStatus";
import { useState } from "react";
import type { ThoughtNode } from "@/app/boss-mod/types";

// Mock 数据
const mockThoughts: ThoughtNode[] = [
	{
		id: "group-1",
		type: "task_group",
		content: "用户认证系统",
		timestamp: "2024-03-15 14:30",
		status: "approved",
		metadata: {
			estimatedTime: "5d",
			priority: 1,
		},
		children: [
			{
				id: "task-1",
				type: "task",
				content: "实现用户注册功能",
				timestamp: "2024-03-15 14:35",
				status: "approved",
				metadata: {
					estimatedTime: "2d",
					priority: 1,
				},
			},
			{
				id: "task-2",
				type: "task",
				content: "实现登录功能",
				timestamp: "2024-03-15 14:36",
				status: "approved",
				metadata: {
					estimatedTime: "1d",
					priority: 1,
				},
			},
			{
				id: "task-3",
				type: "task",
				content: "实现密码重置功能",
				timestamp: "2024-03-15 14:37",
				status: "pending",
				metadata: {
					estimatedTime: "1d",
					priority: 2,
				},
			},
		],
	},
	{
		id: "group-2",
		type: "task_group",
		content: "数据库设计",
		timestamp: "2024-03-15 15:00",
		status: "approved",
		metadata: {
			estimatedTime: "3d",
			priority: 1,
		},
		children: [
			{
				id: "task-4",
				type: "task",
				content: "设计用户表结构",
				timestamp: "2024-03-15 15:05",
				status: "approved",
				metadata: {
					estimatedTime: "1d",
					priority: 1,
				},
			},
			{
				id: "task-5",
				type: "task",
				content: "设计权限表结构",
				timestamp: "2024-03-15 15:06",
				status: "approved",
				metadata: {
					estimatedTime: "1d",
					priority: 1,
				},
			},
		],
	},
];

export function AgentControlPanel() {
	const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
	// 使用 mock 数据
	const [thoughts] = useState<ThoughtNode[]>(mockThoughts);

	const handleTaskClick = (taskId: string) => {
		setSelectedTaskId(taskId);
		// 这里可以打开任务详情 drawer
	};

	return (
		<div className="flex h-full flex-col space-y-4 p-4">
			{/* Goal Input */}
			<div className="space-y-2">
				<h2 className="text-lg font-semibold">目标设定</h2>
				<div className="flex space-x-2">
					<Input placeholder="输入你的目标..." />
					<Button>开始</Button>
				</div>
			</div>

			{/* System Status */}
			<SystemStatus />

			{/* Task Queue */}
			<div className="flex-1 overflow-auto">
				<TaskQueue thoughts={thoughts} onTaskClick={handleTaskClick} />
			</div>

			{/* Agent Config */}
			<div className="border-t pt-4">
				<Button variant="outline" className="w-full">
					Agent 配置
				</Button>
			</div>
		</div>
	);
}
