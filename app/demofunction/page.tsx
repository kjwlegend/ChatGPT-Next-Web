"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { useState } from "react";
import { MindMap } from "./components/MindMap";
import { DebugPanel } from "./components/DebugPanel";
import { MindMapData } from "./types";
import styles from "./layout.module.scss";

const initialData: MindMapData = {
	nodes: [
		{
			id: "1",
			type: "mindmap",
			data: {
				id: "1",
				label: "思维导图",
			},
			position: { x: 250, y: 200 },
		},
		{
			id: "2",
			type: "mindmap",
			data: {
				id: "2",
				label: "子节点 1",
			},
			position: { x: 450, y: 100 },
		},
		{
			id: "3",
			type: "mindmap",
			data: {
				id: "3",
				label: "子节点 2",
			},
			position: { x: 450, y: 300 },
		},
	],
	edges: [
		{ id: "e1-2", source: "1", target: "2" },
		{ id: "e1-3", source: "1", target: "3" },
	],
};

export default function MindMapPage() {
	const [mindMapData, setMindMapData] = useState<MindMapData>(initialData);
	const [aiLogs, setAiLogs] = useState<string[]>([]);

	// AI 日志处理函数
	const handleAILog = (log: string) => {
		setAiLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${log}`]);
	};

	return (
		<div className={styles.container}>
			<div className={styles.debugPanel}>
				<DebugPanel data={mindMapData} aiLogs={aiLogs} />
			</div>
			<div className={styles.flowContainer}>
				<ReactFlowProvider>
					<MindMap 
						data={mindMapData} 
						onChange={setMindMapData} 
						onAILog={handleAILog}
					/>
				</ReactFlowProvider>
			</div>
		</div>
	);
}
