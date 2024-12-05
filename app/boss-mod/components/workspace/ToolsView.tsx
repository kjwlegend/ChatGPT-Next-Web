"use client";

import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Code, Database, FileText, Settings } from "lucide-react";

interface Tool {
	id: string;
	name: string;
	description: string;
	icon: React.ReactNode;
	status: "available" | "busy" | "disabled";
	category: "search" | "code" | "data" | "document" | "system";
}

const mockTools: Tool[] = [
	{
		id: "1",
		name: "网络搜索",
		description: "搜索互联网获取相关信息",
		icon: <Search className="h-6 w-6" />,
		status: "available",
		category: "search",
	},
	{
		id: "2",
		name: "代码分析",
		description: "分析和优化代码结构",
		icon: <Code className="h-6 w-6" />,
		status: "busy",
		category: "code",
	},
	{
		id: "3",
		name: "数据处理",
		description: "处理和分析数据集",
		icon: <Database className="h-6 w-6" />,
		status: "available",
		category: "data",
	},
	{
		id: "4",
		name: "文档生成",
		description: "自动生成技术文档",
		icon: <FileText className="h-6 w-6" />,
		status: "available",
		category: "document",
	},
];

export function ToolsView() {
	return (
		<ScrollArea className="h-full">
			<div className="space-y-6 p-6">
				{/* Search and Filter */}
				<div className="flex space-x-4">
					<Input placeholder="搜索工具..." className="flex-1" />
					<Button variant="outline">
						<Settings className="mr-2 h-4 w-4" />
						配置
					</Button>
				</div>

				{/* Tools Grid */}
				<div className="grid grid-cols-2 gap-4">
					{mockTools.map((tool) => (
						<Card key={tool.id} className="p-4">
							<div className="flex space-x-4">
								<div className="rounded-lg bg-secondary p-2">{tool.icon}</div>
								<div className="flex-1">
									<div className="flex items-start justify-between">
										<div>
											<h4 className="font-medium">{tool.name}</h4>
											<p className="text-sm text-muted-foreground">
												{tool.description}
											</p>
										</div>
										<span
											className={`rounded px-2 py-1 text-xs ${getStatusStyle(tool.status)}`}
										>
											{getStatusLabel(tool.status)}
										</span>
									</div>
									<Button
										className="mt-4"
										disabled={tool.status !== "available"}
									>
										使用工具
									</Button>
								</div>
							</div>
						</Card>
					))}
				</div>
			</div>
		</ScrollArea>
	);
}

function getStatusStyle(status: Tool["status"]) {
	const styles = {
		available: "bg-green-100 text-green-800",
		busy: "bg-yellow-100 text-yellow-800",
		disabled: "bg-gray-100 text-gray-800",
	};
	return styles[status];
}

function getStatusLabel(status: Tool["status"]) {
	const labels = {
		available: "可用",
		busy: "使用中",
		disabled: "禁用",
	};
	return labels[status];
}
