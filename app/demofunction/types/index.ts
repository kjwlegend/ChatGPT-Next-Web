import { Node as ReactFlowNode, Edge as ReactFlowEdge } from '@xyflow/react';

// 节点数据类型
export interface MindMapNodeData {
  content: string;
}

// ReactFlow 节点和边的类型
export type Node = ReactFlowNode<MindMapNodeData>;
export type Edge = ReactFlowEdge;

// 思维导图数据类型
export interface MindMapData {
  nodes: Node[];
  edges: Edge[];
}

// 默认数据
export const DEFAULT_NODE_DATA: MindMapData = {
  nodes: [
    {
      id: 'root',
      type: 'mindmap',
      data: { content: '思维导图' },
      position: { x: 0, y: 0 },
    }
  ],
  edges: []
};