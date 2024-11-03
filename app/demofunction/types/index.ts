import { Node as ReactFlowNode, Edge as ReactFlowEdge } from "@xyflow/react";

// 思维导图节点数据
export interface MindMapNodeData {
	id: string;
	label: string;
}

// 扩展 ReactFlow 的节点和边类型
export type Node = ReactFlowNode<MindMapNodeData>;
export type Edge = ReactFlowEdge;

// 思维导图数据结构
export interface MindMapData {
	nodes: Node[];
	edges: Edge[];
}

// 操作历史记录
export interface HistoryState {
	past: MindMapData[];
	present: MindMapData;
	future: MindMapData[];
}

// 节点选择类型
export interface NodeSelection {
	nodes: Node[];
	edges: Edge[];
}
