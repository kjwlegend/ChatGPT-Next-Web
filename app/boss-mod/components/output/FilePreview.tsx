"use client";

import { ScrollArea } from "@/components/ui/scroll-area";

interface FilePreviewProps {
	fileId: string | null;
}

const mockFileContents: Record<string, string> = {
	"1": "# 技术方案概述\n\n这是一个示例文档...",
	"3": "## 系统架构图\n\n这里是系统架构的详细说明...",
	"4": "## 技术栈选型\n\n- Next.js\n- TypeScript\n- Tailwind CSS",
	"5": "# 实施计划\n\n1. 第一阶段\n2. 第二阶段",
};

export function FilePreview({ fileId }: FilePreviewProps) {
	if (!fileId) {
		return (
			<div className="flex h-full items-center justify-center text-muted-foreground">
				选择文件以预览
			</div>
		);
	}

	const content = mockFileContents[fileId] || "文件内容未找到";

	return (
		<ScrollArea className="h-full p-4">
			<pre className="whitespace-pre-wrap">{content}</pre>
		</ScrollArea>
	);
}
