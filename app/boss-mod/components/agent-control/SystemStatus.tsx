"use client";

import { Progress } from "@/components/ui/progress";

export function SystemStatus() {
	return (
		<div className="space-y-2">
			<h3 className="font-medium">系统状态</h3>
			<div className="space-y-4">
				<div className="space-y-1">
					<div className="flex justify-between text-sm">
						<span>内存使用</span>
						<span>45%</span>
					</div>
					<Progress value={45} />
				</div>
				<div className="space-y-1">
					<div className="flex justify-between text-sm">
						<span>任务进度</span>
						<span>30%</span>
					</div>
					<Progress value={30} />
				</div>
			</div>
		</div>
	);
}
