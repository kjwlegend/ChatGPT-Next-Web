import { useCallback } from "react";
import { MindMapData } from "../types";
import { exportToJSON } from "../utils/dataConverter";
import { exportToMarkdown } from "../utils/markdownConverter";
import { toPng } from "html-to-image";

export const useExport = (data: MindMapData) => {
	// JSON 导出
	const handleJSONExport = useCallback(() => {
		const jsonString = exportToJSON(data);
		const blob = new Blob([jsonString], { type: "application/json" });
		downloadFile(blob, `mindmap-${new Date().toISOString()}.json`);
	}, [data]);

	// Markdown 导出
	const handleMarkdownExport = useCallback(() => {
		const markdownString = exportToMarkdown(data);
		const blob = new Blob([markdownString], { type: "text/markdown" });
		downloadFile(blob, `mindmap-${new Date().toISOString()}.md`);
	}, [data]);

	// 图片导出
	const handleImageExport = useCallback(async () => {
		const flowElement = document.querySelector(".react-flow") as HTMLElement;
		if (!flowElement) return;

		try {
			const dataUrl = await toPng(flowElement, {
				backgroundColor: "#ffffff",
				width: flowElement.offsetWidth,
				height: flowElement.offsetHeight,
				style: {
					width: "100%",
					height: "100%",
				},
			});

			const link = document.createElement("a");
			link.href = dataUrl;
			link.download = `mindmap-${new Date().toISOString()}.png`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} catch (error) {
			console.error("Error exporting image:", error);
		}
	}, []);

	return {
		handleJSONExport,
		handleMarkdownExport,
		handleImageExport,
	};
};

// 辅助函数：下载文件
const downloadFile = (blob: Blob, filename: string) => {
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
};
