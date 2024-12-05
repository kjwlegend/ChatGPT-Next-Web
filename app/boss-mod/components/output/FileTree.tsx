"use client";

import { ChevronRight, File, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileNode {
	id: string;
	name: string;
	type: "file" | "folder";
	children?: FileNode[];
}

const mockFiles: FileNode[] = [
	{
		id: "1",
		name: "技术方案概述.md",
		type: "file",
	},
	{
		id: "2",
		name: "架构设计",
		type: "folder",
		children: [
			{ id: "3", name: "系统架构图.md", type: "file" },
			{ id: "4", name: "技术栈选型.md", type: "file" },
		],
	},
	{
		id: "5",
		name: "实施计划.md",
		type: "file",
	},
];

interface FileTreeProps {
	onSelect: (fileId: string) => void;
}

export function FileTree({ onSelect }: FileTreeProps) {
	return (
		<div className="p-2">
			{mockFiles.map((node) => (
				<FileTreeNode key={node.id} node={node} onSelect={onSelect} />
			))}
		</div>
	);
}

interface FileTreeNodeProps {
	node: FileNode;
	onSelect: (fileId: string) => void;
	level?: number;
}

function FileTreeNode({ node, onSelect, level = 0 }: FileTreeNodeProps) {
	const Icon = node.type === "folder" ? Folder : File;

	return (
		<div>
			<Button
				variant="ghost"
				className="w-full justify-start"
				style={{ paddingLeft: `${level * 16 + 8}px` }}
				onClick={() => onSelect(node.id)}
			>
				{node.type === "folder" && <ChevronRight className="mr-2 h-4 w-4" />}
				<Icon className="mr-2 h-4 w-4" />
				{node.name}
			</Button>
			{node.children?.map((child) => (
				<FileTreeNode
					key={child.id}
					node={child}
					onSelect={onSelect}
					level={level + 1}
				/>
			))}
		</div>
	);
}
