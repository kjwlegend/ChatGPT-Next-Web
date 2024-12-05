"use client";

import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { TaskGroup } from "../PlanningView";

interface ListViewProps {
	group: TaskGroup;
}

export function ListView({ group }: ListViewProps) {
	return (
		<div className="flex h-full flex-col">
			<div className="mb-4">
				<h3 className="text-lg font-medium">{group.title}</h3>
				<p className="text-sm text-muted-foreground">{group.description}</p>
			</div>

			<Card className="flex-1">
				<ScrollArea className="h-[calc(100vh-250px)]">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>任务</TableHead>
								<TableHead>状态</TableHead>
								<TableHead>优先级</TableHead>
								<TableHead>预计时间</TableHead>
								<TableHead>依赖任务</TableHead>
								<TableHead>操作</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{group.tasks.map((task) => (
								<TableRow key={task.id}>
									<TableCell>
										<div>
											<div className="font-medium">{task.title}</div>
											<div className="text-sm text-muted-foreground">
												{task.content}
											</div>
										</div>
									</TableCell>
									<TableCell>
										<span
											className={`rounded px-2 py-1 text-xs ${getStatusStyle(task.status)}`}
										>
											{getStatusLabel(task.status)}
										</span>
									</TableCell>
									<TableCell>P{task.priority}</TableCell>
									<TableCell>{task.metadata?.estimatedTime || "-"}</TableCell>
									<TableCell>
										{task.dependencies.length > 0 ? (
											<div className="flex flex-wrap gap-1">
												{task.dependencies.map((depId) => {
													const depTask = group.tasks.find(
														(t) => t.id === depId,
													);
													return depTask ? (
														<span
															key={depId}
															className="rounded-full bg-secondary px-2 py-1 text-xs"
														>
															{depTask.title}
														</span>
													) : null;
												})}
											</div>
										) : (
											"-"
										)}
									</TableCell>
									<TableCell>
										<Button variant="outline" size="sm">
											详情
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</ScrollArea>
			</Card>
		</div>
	);
}

function getStatusStyle(status: string) {
	const styles = {
		pending: "bg-yellow-100 text-yellow-800",
		in_progress: "bg-blue-100 text-blue-800",
		completed: "bg-green-100 text-green-800",
		blocked: "bg-red-100 text-red-800",
	};
	return styles[status];
}

function getStatusLabel(status: string) {
	const labels = {
		pending: "待处理",
		in_progress: "进行中",
		completed: "已完成",
		blocked: "已阻塞",
	};
	return labels[status];
}
