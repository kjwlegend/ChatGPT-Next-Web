import { MindMapData, Node } from '../types';

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

// 将文本转换回思维导图数据
export const textToMindMap = (text: string): MindMapData => {
  // 这里可以实现文本到思维导图的转换逻辑
  // 暂时返回空结构
  return {
    nodes: [],
    edges: []
  };
}; 