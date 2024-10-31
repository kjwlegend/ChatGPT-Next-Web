"use client";

import { useCallback } from "react";
import {
	ReactFlow,
	Background,
	Controls,
	Connection,
	useNodesState,
	useEdgesState,
	addEdge,
	NodeTypes,
	Panel,
} from "@xyflow/react";
import { MindMapNode } from "./MindMapNode";
import { MindMapData, Node, Edge } from "../../types";
import styles from "./styles.module.scss";
import "@xyflow/react/dist/style.css";

const nodeTypes: NodeTypes = {
	mindmap: MindMapNode,
};

interface Props {
	data: MindMapData;
	onChange: (data: MindMapData) => void;
}

export const MindMap = ({ data, onChange }: Props) => {
	const [nodes, setNodes, onNodesChange] = useNodesState(data.nodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(data.edges);

	const onConnect = useCallback(
		(params: Connection) => {
			setEdges((eds) => addEdge(params, eds));
		},
		[setEdges],
	);

	// 添加测试节点的函数
	const addTestNode = useCallback(() => {
		const newNode: Node = {
			id: `node-${Date.now()}`,
			type: "mindmap",
			data: { content: "新节点" },
			position: { x: Math.random() * 500, y: Math.random() * 500 },
		};

		setNodes((nds) => [...nds, newNode]);
	}, [setNodes]);

	return (
		<div className={styles.mindMapContainer}>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				nodeTypes={nodeTypes}
				fitView
				proOptions={{ hideAttribution: true }}
			>
				<Background />
				<Controls />
				<Panel position="top-right">
					<button onClick={addTestNode}>添加测试节点</button>
				</Panel>
			</ReactFlow>
		</div>
	);
};
