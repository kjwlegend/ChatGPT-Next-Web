import { MindMapData, Node, Edge } from '../types';

export interface AISuggestion {
  type: 'add' | 'modify' | 'delete' | 'move';
  nodeId?: string;
  content?: string;
  position?: { x: number; y: number };
  explanation?: string;
}

// 解析 AI 响应
export const parseAIResponse = (response: string): {
  suggestions: AISuggestion[];
  explanation: string;
} => {
  try {
    // 这里需要根据实际的 AI 响应格式来实现解析逻辑
    return {
      suggestions: [],
      explanation: response,
    };
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return {
      suggestions: [],
      explanation: '解析响应失败',
    };
  }
};

// 应用 AI 建议
export const applyAISuggestions = (
  data: MindMapData,
  suggestions: AISuggestion[]
): MindMapData => {
  let newNodes = [...data.nodes];
  let newEdges = [...data.edges];

  suggestions.forEach(suggestion => {
    switch (suggestion.type) {
      case 'add':
        if (suggestion.content && suggestion.position) {
          const newNode: Node = {
            id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'mindmap',
            data: {
              id: suggestion.nodeId || '',
              label: suggestion.content,
            },
            position: suggestion.position,
          };
          newNodes.push(newNode);
        }
        break;

      case 'modify':
        if (suggestion.nodeId && suggestion.content) {
          newNodes = newNodes.map(node =>
            node.id === suggestion.nodeId
              ? { ...node, data: { ...node.data, label: suggestion.content } }
              : node
          );
        }
        break;

      case 'delete':
        if (suggestion.nodeId) {
          newNodes = newNodes.filter(node => node.id !== suggestion.nodeId);
          newEdges = newEdges.filter(
            edge => edge.source !== suggestion.nodeId && edge.target !== suggestion.nodeId
          );
        }
        break;

      case 'move':
        if (suggestion.nodeId && suggestion.position) {
          newNodes = newNodes.map(node =>
            node.id === suggestion.nodeId
              ? { ...node, position: suggestion.position! }
              : node
          );
        }
        break;
    }
  });

  return { nodes: newNodes, edges: newEdges };
};

// 验证 AI 建议
export const validateAISuggestions = (
  suggestions: AISuggestion[],
  data: MindMapData
): boolean => {
  // 实现验证逻辑
  return true;
}; 