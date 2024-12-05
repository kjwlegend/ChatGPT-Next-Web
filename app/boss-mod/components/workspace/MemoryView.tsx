"use client";

import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MemoryNode {
	id: string;
	type: "knowledge" | "decision" | "feedback";
	title: string;
	content: string;
	timestamp: string;
	tags: string[];
}

const mockMemoryData: MemoryNode[] = [
	{
		id: "1",
		type: "knowledge",
		title: "技术栈选型依据",
		content:
			"基于项目需求，选择 Next.js + TypeScript + Tailwind CSS 作为主要技术栈...",
		timestamp: "2024-03-15 14:30",
		tags: ["技术", "决策记录", "重要"],
	},
	{
		id: "2",
		type: "decision",
		title: "采用微服务架构",
		content: "考虑到系统的扩展性和维护性，决定采用微服务架构...",
		timestamp: "2024-03-15 15:45",
		tags: ["架构", "决策记录"],
	},
	{
		id: "3",
		type: "feedback",
		title: "用户界面反馈",
		content: "用户反馈界面响应速度需要优化...",
		timestamp: "2024-03-15 16:20",
		tags: ["用户反馈", "优化"],
	},
];

export function MemoryView() {
	return (
		<ScrollArea className="h-full">
			<div className="space-y-6 p-6">
				{/* Search Section */}
				<div className="flex space-x-4">
					<Input placeholder="搜索记忆..." className="flex-1" />
					<Button variant="outline">过滤</Button>
					<Button>新建记忆</Button>
				</div>

				{/* Memory Cards */}
				<div className="grid grid-cols-2 gap-4">
					{mockMemoryData.map((memory) => (
						<Card key={memory.id} className="p-4">
							<div className="space-y-2">
								<div className="flex items-start justify-between">
									<div>
										<h4 className="font-medium">{memory.title}</h4>
										<p className="text-sm text-muted-foreground">
											{memory.timestamp}
										</p>
									</div>
									<div
										className={`rounded px-2 py-1 text-xs ${getTypeStyle(memory.type)}`}
									>
										{getTypeLabel(memory.type)}
									</div>
								</div>

								<p className="line-clamp-3 text-sm">{memory.content}</p>

								<div className="flex flex-wrap gap-2">
									{memory.tags.map((tag) => (
										<span
											key={tag}
											className="rounded-full bg-secondary px-2 py-1 text-xs"
										>
											{tag}
										</span>
									))}
								</div>
							</div>
						</Card>
					))}
				</div>
			</div>
		</ScrollArea>
	);
}

function getTypeStyle(type: MemoryNode["type"]) {
	const styles = {
		knowledge: "bg-blue-100 text-blue-800",
		decision: "bg-purple-100 text-purple-800",
		feedback: "bg-orange-100 text-orange-800",
	};
	return styles[type];
}

function getTypeLabel(type: MemoryNode["type"]) {
	const labels = {
		knowledge: "知识",
		decision: "决策",
		feedback: "反馈",
	};
	return labels[type];
}
