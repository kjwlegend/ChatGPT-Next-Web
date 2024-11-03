import { MindMapData, Node, Edge } from '../types';

// 将思维导图数据转换为文本描述
export const mindMapToText = (data: MindMapData): string => {
  const nodeMap = new Map(data.nodes.map(node => [node.id, node]));
  const edgeMap = new Map<string, Edge[]>();
  
  // 构建边的映射
  data.edges.forEach(edge => {
    if (!edgeMap.has(edge.source)) {
      edgeMap.set(edge.source, []);
    }
    edgeMap.get(edge.source)?.push(edge);
  });

  // 找到根节点
  const rootNode = data.nodes.find(node => 
    !data.edges.some(edge => edge.target === node.id)
  );
  if (!rootNode) return '';

  // 递归生成文本描述
  const generateDescription = (nodeId: string, level: number = 0): string[] => {
    const node = nodeMap.get(nodeId);
    if (!node) return [];

    const indent = '  '.repeat(level);
    const childEdges = edgeMap.get(nodeId) || [];
    const childDescriptions = childEdges
      .map(edge => generateDescription(edge.target, level + 1))
      .flat();

    return [
      `${indent}节点: ${node.data.label}`,
      ...childDescriptions
    ];
  };

  return generateDescription(rootNode.id).join('\n');
};

// 生成 AI 提示词
export const generatePrompt = (data: MindMapData, action: string): string => {
  const context = mindMapToText(data);
  
  const prompts = {
    analyze: `
      请分析以下思维导图的结构和内容：
      
      ${context}
      
      请提供：
      1. 主题概述
      2. 层级结构分析
      3. 逻辑关系评估
      4. 内容完整性建议
      5. 可能的扩展方向
    `,
    
    suggest: `
      基于以下思维导图：
      
      ${context}
      
      请为选中的节点提供建议：
      1. 内容优化建议
      2. 子节点补充建议
      3. 相关概念建议
      4. 结构调整建议
    `,
    
    extend: `
      基于以下思维导图：
      
      ${context}
      
      请为选中的节点生成扩展内容：
      1. 自动生成3-5个相关的子节点
      2. 为每个子节点提供简要说明
      3. 确保生成的内容与当前主题相关
      4. 保持层级结构的合理性
    `,
  };

  return prompts[action as keyof typeof prompts] || prompts.analyze;
};

// 解析 AI 响应
export const parseAIResponse = (response: string): {
  suggestions: Array<{
    type: 'add' | 'modify' | 'delete' | 'move';
    nodeId?: string;
    content?: string;
    position?: { x: number; y: number };
  }>;
  explanation: string;
} => {
  // 这里需要根据实际的 AI 响应格式来实现解析逻辑
  // 暂时返回一个示例结构
  return {
    suggestions: [],
    explanation: response,
  };
};

// 应用 AI 建议
export const applyAISuggestions = (
  data: MindMapData,
  suggestions: ReturnType<typeof parseAIResponse>['suggestions']
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
      // 可以添加更多操作类型
    }
  });

  return { nodes: newNodes, edges: newEdges };
}; 