"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileTree } from "./FileTree";
import { FilePreview } from "./FilePreview";
import { useState } from "react";

export function OutputFilesPanel() {
	const [selectedFile, setSelectedFile] = useState<string | null>(null);

	return (
		<div className="flex h-full flex-col">
			{/* Header */}
			<div className="border-b p-4">
				<Input placeholder="搜索文件..." className="mb-2" />
				<div className="flex space-x-2">
					<Button variant="outline" size="sm">
						视图
					</Button>
					<Button variant="outline" size="sm">
						排序
					</Button>
					<Button variant="outline" size="sm">
						刷新
					</Button>
				</div>
			</div>

			{/* Content */}
			<div className="flex flex-1">
				{/* File Tree */}
				<div className="w-1/2 border-r">
					<FileTree onSelect={setSelectedFile} />
				</div>

				{/* Preview */}
				<div className="w-1/2">
					<FilePreview fileId={selectedFile} />
				</div>
			</div>
		</div>
	);
}
