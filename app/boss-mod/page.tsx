"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlanningView } from "./components/workspace/PlanningView";
import { MemoryView } from "./components/workspace/MemoryView";
import { ToolsView } from "./components/workspace/ToolsView";
import { ActionsView } from "./components/workspace/ActionsView";

export default function BossModPage() {
	return (
		<div className="flex h-full flex-col">
			<Tabs defaultValue="planning" className="flex-1">
				<div className="border-b px-4">
					<TabsList>
						<TabsTrigger value="planning">规划</TabsTrigger>
						<TabsTrigger value="memory">记忆</TabsTrigger>
						<TabsTrigger value="tools">工具</TabsTrigger>
						<TabsTrigger value="actions">行动</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent value="planning" className="flex-1">
					<PlanningView />
				</TabsContent>

				<TabsContent value="memory" className="flex-1">
					<MemoryView />
				</TabsContent>

				<TabsContent value="tools" className="flex-1">
					<ToolsView />
				</TabsContent>

				<TabsContent value="actions" className="flex-1">
					<ActionsView />
				</TabsContent>
			</Tabs>
		</div>
	);
}
