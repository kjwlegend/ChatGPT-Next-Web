"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Clock, PlayCircle, PauseCircle, CheckCircle } from "lucide-react";
import type { TaskGroup } from "../PlanningView";

interface TaskGroupCardProps {
	group: TaskGroup;
	isSelected: boolean;
	onClick: () => void;
}

export function TaskGroupCard({
	group,
	isSelected,
	onClick,
}: TaskGroupCardProps) {
	return (
		<Card
			className={cn(
				"cursor-pointer p-4 transition-colors hover:bg-accent",
				isSelected && "border-primary",
			)}
			onClick={onClick}
		>
			<div className="space-y-3">
				<div className="flex items-start justify-between">
					<div>
						<h4 className="font-medium">{group.title}</h4>
						<p className="text-sm text-muted-foreground">{group.description}</p>
					</div>
					{getStatusIcon(group.status)}
				</div>

				<div className="space-y-1">
					<div className="flex justify-between text-sm">
						<span>进度</span>
						<span>{group.progress}%</span>
					</div>
					<Progress value={group.progress} />
				</div>

				<div className="flex justify-between text-xs text-muted-foreground">
					<div className="flex items-center">
						<Clock className="mr-1 h-3 w-3" />
						{group.updatedAt}
					</div>
					<span>{group.tasks.length} 个任务</span>
				</div>
			</div>
		</Card>
	);
}

function getStatusIcon(status: TaskGroup["status"]) {
	const icons = {
		active: <PlayCircle className="h-5 w-5 text-green-500" />,
		paused: <PauseCircle className="h-5 w-5 text-yellow-500" />,
		completed: <CheckCircle className="h-5 w-5 text-blue-500" />,
	};
	return icons[status];
}
