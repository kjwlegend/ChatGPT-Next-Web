import { useCallback } from 'react';
import { Node, Edge, MindMapNodeData } from '../types';
import { calculateNewChildPosition, adjustPositionToAvoidOverlap, HORIZONTAL_SPACING, VERTICAL_SPACING } from '../utils/layout';

export const useNodeOperations = (
  nodes: Node[],
  edges: Edge[],
  setNodes: (nodes: Node[]) => void,
  setEdges: (edges: Edge[]) => void,
  onChange: (data: { nodes: Node[]; edges: Edge[] }) => void
) => {
  const handleNodeLabelChange = useCallback(
    (nodeId: string, newLabel: string) => {
      const newNodes = nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              label: newLabel,
            },
          };
        }
        return node;
      });

      setNodes(newNodes);
      onChange({ nodes: newNodes, edges });
    },
    [nodes, edges, setNodes, onChange]
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
        type: 'mindmap',
        data: {
          id: newNodeId,
          label: '新节点',
        },
        position: finalPosition,
      };

      const newEdge: Edge = {
        id: `edge-${parentId}-${newNodeId}`,
        source: parentId,
        target: newNodeId,
        sourceHandle: 'right',
        targetHandle: 'left',
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
      const currentNode = nodes.find((node) => node.id === nodeId);
      if (!currentNode) return;

      const newNodeId = `node-${Date.now()}`;
      const position = {
        x: currentNode.position.x - HORIZONTAL_SPACING,
        y: currentNode.position.y,
      };

      const finalPosition = adjustPositionToAvoidOverlap(position, nodes);

      const newNode: Node<MindMapNodeData> = {
        id: newNodeId,
        type: 'mindmap',
        data: {
          id: newNodeId,
          label: '新父节点',
        },
        position: finalPosition,
      };

      const oldParentEdge = edges.find((edge) => edge.target === nodeId);
      let newEdges = [...edges];

      if (oldParentEdge) {
        newEdges = newEdges.filter((edge) => edge.id !== oldParentEdge.id);
        newEdges.push({
          id: `edge-${oldParentEdge.source}-${newNodeId}`,
          source: oldParentEdge.source,
          target: newNodeId,
          sourceHandle: 'right',
          targetHandle: 'left',
        });
      }

      newEdges.push({
        id: `edge-${newNodeId}-${nodeId}`,
        source: newNodeId,
        target: nodeId,
        sourceHandle: 'right',
        targetHandle: 'left',
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

        const newNode: Node<MindMapNodeData> = {
          id: newNodeId,
          type: 'mindmap',
          data: {
            id: newNodeId,
            label: '新节点',
          },
          position: finalPosition,
        };

        const newEdge: Edge = {
          id: `edge-${parentId}-${newNodeId}`,
          source: parentId,
          target: newNodeId,
          sourceHandle: 'right',
          targetHandle: 'left',
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
      const newNodes = nodes.filter((node) => !nodeIds.includes(node.id));
      const newEdges = edges.filter(
        (edge) => !nodeIds.includes(edge.source) && !nodeIds.includes(edge.target)
      );

      setNodes(newNodes);
      setEdges(newEdges);
      onChange({ nodes: newNodes, edges: newEdges });
    },
    [nodes, edges, setNodes, setEdges, onChange]
  );

  return {
    handleNodeLabelChange,
    handleAddChild,
    handleAddParent,
    handleAddSibling,
    handleDeleteNodes,
  };
}; 