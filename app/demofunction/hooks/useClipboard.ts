import { useCallback } from 'react';
import { Node, Edge, MindMapData } from '../types';
import { adjustPositionToAvoidOverlap } from '../utils/layout';

const PASTE_OFFSET = 50; // 粘贴时的位置偏移量

export const useClipboard = (
  nodes: Node[],
  edges: Edge[],
  setNodes: (nodes: Node[]) => void,
  setEdges: (edges: Edge[]) => void,
  onChange: (data: MindMapData) => void
) => {
  // 复制选中的节点
  const handleCopy = useCallback((selectedNodes: Node[]) => {
    if (selectedNodes.length === 0) return;

    // 获取选中节点之间的边
    const selectedNodeIds = new Set(selectedNodes.map(node => node.id));
    const selectedEdges = edges.filter(
      edge => selectedNodeIds.has(edge.source) && selectedNodeIds.has(edge.target)
    );

    // 创建剪贴板数据
    const clipboardData = {
      nodes: selectedNodes,
      edges: selectedEdges,
    };

    // 将数据存储到剪贴板
    localStorage.setItem('mindmap-clipboard', JSON.stringify(clipboardData));
  }, [edges]);

  // 粘贴节点
  const handlePaste = useCallback(() => {
    const clipboardString = localStorage.getItem('mindmap-clipboard');
    if (!clipboardString) return;

    try {
      const clipboardData = JSON.parse(clipboardString) as MindMapData;
      const idMap = new Map<string, string>();

      // 创建新节点，使用新的ID
      const newNodes = clipboardData.nodes.map(node => {
        const newId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        idMap.set(node.id, newId);

        const position = adjustPositionToAvoidOverlap(
          {
            x: node.position.x + PASTE_OFFSET,
            y: node.position.y + PASTE_OFFSET,
          },
          nodes
        );

        return {
          ...node,
          id: newId,
          data: {
            ...node.data,
            id: newId,
          },
          position,
        };
      });

      // 创建新边，使用新的ID
      const newEdges = clipboardData.edges.map(edge => ({
        ...edge,
        id: `edge-${idMap.get(edge.source)}-${idMap.get(edge.target)}`,
        source: idMap.get(edge.source)!,
        target: idMap.get(edge.target)!,
      }));

      // 更新状态
      const updatedNodes = [...nodes, ...newNodes];
      const updatedEdges = [...edges, ...newEdges];
      setNodes(updatedNodes);
      setEdges(updatedEdges);
      onChange({ nodes: updatedNodes, edges: updatedEdges });
    } catch (error) {
      console.error('Failed to paste nodes:', error);
    }
  }, [nodes, edges, setNodes, setEdges, onChange]);

  return {
    handleCopy,
    handlePaste,
  };
}; 