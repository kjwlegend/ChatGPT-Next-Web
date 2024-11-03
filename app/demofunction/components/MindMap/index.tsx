"use client";

import {
	ReactFlow,
	Background,
	Controls,
	NodeProps,
	SelectionMode,
} from "@xyflow/react";
import { MindMapNode } from "../Nodes/MindMapNode";
import { MindMapData, MindMapNodeData } from "../../types";
import { useMindMapLogic } from "../../hooks/useMindMapLogic";
import { DataControls } from "../DataControls";
import { AIControls } from "../AIControls";
import "@xyflow/react/dist/style.css";
import styles from "./styles.module.scss";

interface MindMapProps {
	data: MindMapData;
	onChange: (data: MindMapData) => void;
	onAILog?: (log: string) => void;
}

export const MindMap = ({ data, onChange, onAILog }: MindMapProps) => {
	const {
		nodes,
		edges,
		editingNodeId,
		selectedNodes,
		onNodesChange,
		onEdgesChange,
		onConnectStart,
		onConnectEnd,
		onConnect,
		onSelectionChange,
		handleNodeLabelChange,
		handleStartEditing,
		handleStopEditing,
		handleAddChild,
		handleDeleteNodes,
		handleDataImport,
	} = useMindMapLogic(data, onChange);

	// 节点包装器
	const MindMapNodeWrapper = (props: NodeProps<MindMapNodeData>) => (
		<MindMapNode
			{...props}
			isEditing={props.id === editingNodeId}
			onStartEditing={handleStartEditing}
			onStopEditing={handleStopEditing}
			onLabelChange={handleNodeLabelChange}
			onAddChild={handleAddChild}
			onDelete={(nodeId) => handleDeleteNodes([nodeId])}
		/>
	);

	const nodeTypes = {
		mindmap: MindMapNodeWrapper,
	};

	return (
		<div className={styles.mindMapWrapper}>
			<DataControls data={{ nodes, edges }} onDataImport={handleDataImport} />
			<AIControls
				data={{ nodes, edges }}
				selectedNodes={selectedNodes}
				onUpdate={onChange}
				onLog={onAILog}
			/>

			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnectStart={onConnectStart}
				onConnectEnd={onConnectEnd}
				onConnect={onConnect}
				onSelectionChange={onSelectionChange}
				nodeTypes={nodeTypes}
				fitView
				nodesDraggable
				elementsSelectable
				selectionMode={SelectionMode.Partial}
				selectionOnDrag
				selectNodesOnDrag
				connectOnClick={false}
				proOptions={{ hideAttribution: true }}
			>
				<Background />
				<Controls />
			</ReactFlow>
		</div>
	);
};
