import { MindMapData, MindMapNode } from '../types';

export const convertMarkdownToMindMap = (markdown: string): MindMapData => {
  const lines = markdown.split('\n');
  const mindData: MindMapData = {
    meta: {
      name: 'mindmap',
      author: 'user',
      version: '1.0',
    },
    format: 'node_tree',
    data: {
      id: 'root',
      topic: 'Root',
      children: [],
    },
  };

  let currentLevel = 0;
  let currentNode = mindData.data;
  const nodeStack = [currentNode];

  lines.forEach((line) => {
    const match = line.match(/^(#{1,6})\s+(.+)/);
    if (match) {
      const level = match[1].length;
      const text = match[2];
      const node = {
        id: `node_${Math.random().toString(36).substr(2, 9)}`,
        topic: text,
        children: [],
      };

      if (level > currentLevel) {
        nodeStack.push(currentNode);
        currentNode.children.push(node);
      } else if (level === currentLevel) {
        nodeStack[nodeStack.length - 2].children.push(node);
      } else {
        while (nodeStack.length > level) {
          nodeStack.pop();
        }
        nodeStack[nodeStack.length - 1].children.push(node);
      }

      currentNode = node;
      currentLevel = level;
    }
  });

  return mindData;
};

export const convertMindMapToMarkdown = (data: MindMapData): string => {
  const result: string[] = [];
  
  const processNode = (node: MindMapNode, level: number = 1) => {
    // 跳过根节点
    if (level > 0) {
      result.push('#'.repeat(level) + ' ' + node.topic);
    }
    
    if (node.children) {
      node.children.forEach(child => processNode(child, level + 1));
    }
  };

  processNode(data.data, 0);
  return result.join('\n');
}; 