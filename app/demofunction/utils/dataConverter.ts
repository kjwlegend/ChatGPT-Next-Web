import { MindMapData } from '../types';

export const exportToJSON = (data: MindMapData): string => {
  return JSON.stringify(data, null, 2);
};

export const importFromJSON = (jsonString: string): MindMapData | null => {
  try {
    const data = JSON.parse(jsonString);
    // 验证数据结构
    if (
      data &&
      Array.isArray(data.nodes) &&
      Array.isArray(data.edges) &&
      data.nodes.every((node: any) => 
        node.id && 
        node.type === 'mindmap' && 
        node.data && 
        node.data.id &&
        node.data.label &&
        node.position &&
        typeof node.position.x === 'number' &&
        typeof node.position.y === 'number'
      )
    ) {
      return data as MindMapData;
    }
    return null;
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return null;
  }
}; 