import { useCallback, useState } from 'react';
import { Node, Edge, MindMapNodeData } from '../types';
import { useReactFlow } from '@xyflow/react';

export const useConnectionHandlers = (
  nodes: Node[],
  edges: Edge[],
  setNodes: (nodes: Node[]) => void,
  setEdges: (edges: Edge[]) => void,
  onChange: (data: { nodes: Node[]; edges: Edge[] }) => void
) => {
  const { screenToFlowPosition } = useReactFlow();
  const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);

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
        'react-flow__pane'
      );

      if (targetIsPane) {
        const { clientX, clientY } = event instanceof MouseEvent ? event : event.touches[0];
        const position = screenToFlowPosition({
          x: clientX,
          y: clientY,
        });

        const newNodeId = `node-${Date.now()}`;
        const newNode: Node<MindMapNodeData> = {
          id: newNodeId,
          type: 'mindmap',
          data: {
            id: newNodeId,
            label: '新节点',
          },
          position,
          draggable: true,
          selectable: true,
        };

        const newEdge: Edge = {
          id: `edge-${connectingNodeId}-${newNodeId}`,
          source: connectingNodeId,
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

      setConnectingNodeId(null);
    },
    [connectingNodeId, nodes, edges, setNodes, setEdges, onChange, screenToFlowPosition]
  );

  const onConnect = useCallback(
    (params: any) => {
      const newEdge: Edge = {
        ...params,
        targetHandle: 'left',
      };
      setEdges((eds) => [...eds, newEdge]);
    },
    [setEdges]
  );

  return {
    onConnectStart,
    onConnectEnd,
    onConnect,
  };
}; 