import { useCallback, useState } from "react";
import {
  useNodesState,
  useEdgesState,
  Node,
  useReactFlow,
} from "@xyflow/react";
import { MindMapData, Edge, MindMapNodeData } from "../types";
import { useHistory } from "./useHistory";
import { useClipboard } from "./useClipboard";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts";
import {
  calculateNewChildPosition,
  adjustPositionToAvoidOverlap,
  HORIZONTAL_SPACING,
  VERTICAL_SPACING,
} from "../utils/layout";

export const useMindMapLogic = (data: MindMapData, onChange: (data: MindMapData) => void) => {
  // 状态管理
  const [nodes, setNodes, onNodesChange] = useNodesState(data.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(data.edges);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);

  // ReactFlow hooks
  const { screenToFlowPosition } = useReactFlow();

  // 剪贴板功能
  const { handleCopy, handlePaste } = useClipboard(
    nodes,
    edges,
    setNodes,
    setEdges,
    onChange
  );

  // 节点操作
  const handleNodeLabelChange = useCallback(
    (nodeId: string, newLabel: string) => {
      const newNodes = nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, label: newLabel } }
          : node
      );

      setNodes(newNodes);
      setEditingNodeId(null);
      onChange({ nodes: newNodes, edges });
    },
    [nodes, edges, onChange, setNodes]
  );

  const handleAddChild = useCallback(
    (parentId: string) => {
      const parentNode = nodes.find((node) => node.id === parentId);
      if (!parentNode) return;

      const newNodeId = `node-${Date.now()}`;
      const initialPosition = calculateNewChildPosition(parentNode, nodes, edges);
      const finalPosition = adjustPositionToAvoidOverlap(initialPosition, nodes);

      const newNode: Node<MindMapNodeData> = {
        id: newNodeId,
        type: "mindmap",
        data: {
          id: newNodeId,
          label: "新节点",
        },
        position: finalPosition,
      };

      const newEdge: Edge = {
        id: `edge-${parentId}-${newNodeId}`,
        source: parentId,
        target: newNodeId,
        sourceHandle: "right",
        targetHandle: "left",
      };

      const newNodes = [...nodes, newNode];
      const newEdges = [...edges, newEdge];

      setNodes(newNodes);
      setEdges(newEdges);
      onChange({ nodes: newNodes, edges: newEdges });
    },
    [nodes, edges, setNodes, setEdges, onChange]
  );

  const handleAddParent = useCallback(
    (nodeId: string) => {
      console.log("handleAddParent called with nodeId:", nodeId);
      const currentNode = nodes.find((node) => node.id === nodeId);
      if (!currentNode) return;

      const newNodeId = `node-${Date.now()}`;
      const position = {
        x: currentNode.position.x - HORIZONTAL_SPACING,
        y: currentNode.position.y,
      };

      const finalPosition = adjustPositionToAvoidOverlap(position, nodes);

      const newNode: Node = {
        id: newNodeId,
        type: "mindmap",
        data: {
          id: newNodeId,
          label: "新父节点",
        },
        position: finalPosition,
        draggable: true,
        selectable: true,
      };

      // 找到当前节点的原父节点连接
      const oldParentEdge = edges.find((edge) => edge.target === nodeId);
      let newEdges = [...edges];

      if (oldParentEdge) {
        // 移除原有的父子连接
        newEdges = newEdges.filter((edge) => edge.id !== oldParentEdge.id);
        
        // 原父节点连接到新节点
        newEdges.push({
          id: `edge-${oldParentEdge.source}-${newNodeId}`,
          source: oldParentEdge.source,
          target: newNodeId,
          sourceHandle: "right",
          targetHandle: "left",
        });
      }

      // 新节点连接到当前节点
      newEdges.push({
        id: `edge-${newNodeId}-${nodeId}`,
        source: newNodeId,
        target: nodeId,
        sourceHandle: "right",
        targetHandle: "left",
      });

      const newNodes = [...nodes, newNode];

      setNodes(newNodes);
      setEdges(newEdges);
      onChange({ nodes: newNodes, edges: newEdges });
    },
    [nodes, edges, setNodes, setEdges, onChange]
  );

  const handleAddSibling = useCallback(
    (nodeId: string) => {
      const parentEdge = edges.find((edge) => edge.target === nodeId);
      const parentId = parentEdge?.source;

      if (parentId) {
        const parentNode = nodes.find((node) => node.id === parentId);
        if (!parentNode) return;

        const siblingNodes = nodes.filter((node) =>
          edges.some((edge) => edge.source === parentId && edge.target === node.id)
        );

        const newNodeId = `node-${Date.now()}`;
        const lastSibling = siblingNodes[siblingNodes.length - 1];
        const position = {
          x: lastSibling.position.x,
          y: lastSibling.position.y + VERTICAL_SPACING,
        };

        const finalPosition = adjustPositionToAvoidOverlap(position, nodes);

        const newNode: Node = {
          id: newNodeId,
          type: "mindmap",
          data: {
            id: newNodeId,
            label: "新节点",
          },
          position: finalPosition,
          draggable: true,
          selectable: true,
        };

        const newEdge: Edge = {
          id: `edge-${parentId}-${newNodeId}`,
          source: parentId,
          target: newNodeId,
          sourceHandle: "right",
          targetHandle: "left",
        };

        const newNodes = [...nodes, newNode];
        const newEdges = [...edges, newEdge];

        setNodes(newNodes);
        setEdges(newEdges);
        onChange({ nodes: newNodes, edges: newEdges });
      }
    },
    [nodes, edges, setNodes, setEdges, onChange]
  );

  const handleDeleteNodes = useCallback(
    (nodeIds: string[]) => {
      console.log('Deleting nodes:', nodeIds);

      // 获取要删除的节点及其所有子节点
      const nodesToDelete = new Set<string>();
      
      // 递归获取所有子节点
      const addChildrenToDelete = (parentId: string) => {
        nodesToDelete.add(parentId);
        const childNodes = edges
          .filter(edge => edge.source === parentId)
          .map(edge => edge.target);
        
        childNodes.forEach(childId => {
          if (!nodesToDelete.has(childId)) {
            addChildrenToDelete(childId);
          }
        });
      };

      // 处理所有选中的节点及其子节点
      nodeIds.forEach(nodeId => addChildrenToDelete(nodeId));

      console.log('All nodes to delete:', Array.from(nodesToDelete));

      // 过滤节点和边
      const newNodes = nodes.filter(node => !nodesToDelete.has(node.id));
      const newEdges = edges.filter(
        edge => !nodesToDelete.has(edge.source) && !nodesToDelete.has(edge.target)
      );

      console.log('Remaining nodes:', newNodes.length);
      console.log('Remaining edges:', newEdges.length);

      setNodes(newNodes);
      setEdges(newEdges);
      onChange({ nodes: newNodes, edges: newEdges });
    },
    [nodes, edges, setNodes, setEdges, onChange]
  );

  // 编辑状态管理
  const handleStartEditing = useCallback((nodeId: string) => {
    setEditingNodeId(nodeId);
  }, []);

  const handleStopEditing = useCallback(() => {
    setEditingNodeId(null);
  }, []);

  // 选择处理
  const onSelectionChange = useCallback(({ nodes }: { nodes: Node[] }) => {
    setSelectedNodes(nodes);
  }, []);

  // 连接处理
  const onConnectStart = useCallback(
    (
      event: React.MouseEvent | React.TouchEvent,
      { nodeId, handleId }: { nodeId: string | null; handleId: string | null }
    ) => {
      if (nodeId) {
        setConnectingNodeId(nodeId);
      }
    },
    []
  );

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!connectingNodeId) return;

      const targetIsPane = (event.target as Element).classList.contains(
        "react-flow__pane"
      );

      if (targetIsPane) {
        const { clientX, clientY } =
          event instanceof MouseEvent ? event : event.touches[0];

        const position = screenToFlowPosition({
          x: clientX,
          y: clientY,
        });

        const newNodeId = `node-${Date.now()}`;
        const newNode: Node<MindMapNodeData> = {
          id: newNodeId,
          type: "mindmap",
          data: {
            id: newNodeId,
            label: "新节点",
          },
          position,
          draggable: true,
          selectable: true,
        };

        const newEdge: Edge = {
          id: `edge-${connectingNodeId}-${newNodeId}`,
          source: connectingNodeId,
          target: newNodeId,
          sourceHandle: "right",
          targetHandle: "left",
        };

        const newNodes = [...nodes, newNode];
        const newEdges = [...edges, newEdge];

        setNodes(newNodes);
        setEdges(newEdges);
        onChange({ nodes: newNodes, edges: newEdges });
      }

      setConnectingNodeId(null);
    },
    [connectingNodeId, nodes, edges, setNodes, setEdges, onChange, screenToFlowPosition]
  );

  const onConnect = useCallback(
    (params: any) => {
      const newEdge: Edge = {
        ...params,
        targetHandle: "left",
      };
      setEdges((eds) => [...eds, newEdge]);
    },
    [setEdges]
  );

  // 历史记录
  const {
    state: historyState,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory(data);

  // 快捷键处理
  useKeyboardShortcuts(selectedNodes, editingNodeId, {
    handleAddParent,
    handleAddChild,
    handleAddSibling,
    handleDeleteNodes,
    handleCopy,
    handlePaste,
  });

  return {
    // 状态
    nodes,
    edges,
    editingNodeId,
    selectedNodes,
    
    // 事件处理器
    onNodesChange,
    onEdgesChange,
    onConnectStart,
    onConnectEnd,
    onConnect,
    onSelectionChange,
    
    // 节点操作
    handleNodeLabelChange,
    handleStartEditing,
    handleStopEditing,
    handleAddChild,
    handleDeleteNodes,
    handleAddParent,
    handleAddSibling,
    
    // 数据导入
    handleDataImport: (importedData: MindMapData) => {
      setNodes(importedData.nodes);
      setEdges(importedData.edges);
      onChange(importedData);
    },
  };
}; 