import { MindMapData, Node, Edge } from '../types';
import { AISuggestion } from './aiResponseHandler';
import { adjustPositionToAvoidOverlap, HORIZONTAL_SPACING, VERTICAL_SPACING } from './layout';

interface ParsedResponse {
  suggestions: AISuggestion[];
  explanation: string;
}

// 解析 AI 生成的节点建议
export const parseNodeSuggestions = (response: string): ParsedResponse => {
  try {
    // 尝试解析 JSON 格式的响应
    if (response.trim().startsWith('{')) {
      return JSON.parse(response);
    }

    // 解析文本格式的响应
    const lines = response.split('\n').filter(line => line.trim());
    const suggestions: AISuggestion[] = [];
    let explanation = '';

    lines.forEach(line => {
      // 检查是否是节点建议（以 - 或 * 开头）
      if (line.trim().match(/^[-*]\s/)) {
        const content = line.trim().replace(/^[-*]\s/, '');
        suggestions.push({
          type: 'add',
          content,
        });
      } else if (!explanation) {
        // 第一个非节点行作为解释
        explanation = line.trim();
      }
    });

    return {
      suggestions,
      explanation: explanation || '解析完成',
    };
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return {
      suggestions: [],
      explanation: '解析响应失败',
    };
  }
};

// 生成新节点的位置
export const calculateNewNodePositions = (
  suggestions: AISuggestion[],
  parentNode: Node,
  existingNodes: Node[],
): AISuggestion[] => {
  return suggestions.map((suggestion, index) => {
    if (suggestion.type === 'add') {
      const position = {
        x: parentNode.position.x + HORIZONTAL_SPACING,
        y: parentNode.position.y + (index * VERTICAL_SPACING),
      };

      return {
        ...suggestion,
        position: adjustPositionToAvoidOverlap(position, existingNodes),
      };
    }
    return suggestion;
  });
};

// 应用 AI 建议到思维导图
export const applyAISuggestionsToMindMap = (
  data: MindMapData,
  suggestions: AISuggestion[],
  parentNodeId?: string,
): MindMapData => {
  let newNodes = [...data.nodes];
  let newEdges = [...data.edges];

  suggestions.forEach(suggestion => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);

    switch (suggestion.type) {
      case 'add': {
        if (suggestion.content) {
          const newNodeId = `node-${timestamp}-${randomId}`;
          const newNode: Node = {
            id: newNodeId,
            type: 'mindmap',
            data: {
              id: newNodeId,
              label: suggestion.content,
            },
            position: suggestion.position || { x: 0, y: 0 },
          };

          newNodes.push(newNode);

          // 如果指定了父节点，创建连接
          if (parentNodeId) {
            const newEdge: Edge = {
              id: `edge-${parentNodeId}-${newNodeId}`,
              source: parentNodeId,
              target: newNodeId,
              sourceHandle: 'right',
              targetHandle: 'left',
            };
            newEdges.push(newEdge);
          }
        }
        break;
      }

      case 'modify': {
        if (suggestion.nodeId && suggestion.content) {
          newNodes = newNodes.map(node =>
            node.id === suggestion.nodeId
              ? { ...node, data: { ...node.data, label: suggestion.content! } }
              : node
          );
        }
        break;
      }

      case 'delete': {
        if (suggestion.nodeId) {
          newNodes = newNodes.filter(node => node.id !== suggestion.nodeId);
          newEdges = newEdges.filter(
            edge => edge.source !== suggestion.nodeId && edge.target !== suggestion.nodeId
          );
        }
        break;
      }

      case 'move': {
        if (suggestion.nodeId && suggestion.position) {
          newNodes = newNodes.map(node =>
            node.id === suggestion.nodeId
              ? { ...node, position: suggestion.position! }
              : node
          );
        }
        break;
      }
    }
  });

  return { nodes: newNodes, edges: newEdges };
}; 