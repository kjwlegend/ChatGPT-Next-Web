import { MindMapData, Node, Edge } from '../types';
import { HORIZONTAL_SPACING, VERTICAL_SPACING } from './layout';

interface TreeNode {
  id: string;
  label: string;
  level: number;
  children: TreeNode[];
}

// 将 Markdown 转换为树形结构
const parseMarkdownToTree = (markdown: string): TreeNode => {
  const lines = markdown.split('\n').filter(line => line.trim());
  const root: TreeNode = {
    id: 'root',
    label: '根节点',
    level: 0,
    children: [],
  };

  let currentParentStack: TreeNode[] = [root];
  let lastIndentLevel = 0;

  lines.forEach(line => {
    // 计算缩进级别（针对列表项）
    const indentMatch = line.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1].length : 0;
    const indentLevel = Math.floor(indent / 2); // 假设每级缩进是2个空格

    // 移除前导空格和列表标记
    let cleanLine = line.trim().replace(/^[-*+]\s+/, '');

    // 检查是否是标题
    const headingMatch = cleanLine.match(/^(#{1,6})\s+(.+)$/);
    
    let level: number;
    let label: string;

    if (headingMatch) {
      // 处理标题
      level = headingMatch[1].length;
      label = headingMatch[2];
    } else {
      // 处理列表项
      level = indentLevel + 1; // 列表项的级别从1开始
      label = cleanLine;
    }

    // 创建新节点
    const node: TreeNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label,
      level,
      children: [],
    };

    // 调整父节点栈
    if (level > lastIndentLevel) {
      // 进入更深层级
      if (currentParentStack.length > 0) {
        const lastNode = currentParentStack[currentParentStack.length - 1].children;
        if (lastNode.length > 0) {
          currentParentStack.push(lastNode[lastNode.length - 1]);
        }
      }
    } else if (level < lastIndentLevel) {
      // 返回上层
      const steps = lastIndentLevel - level + 1;
      for (let i = 0; i < steps && currentParentStack.length > 1; i++) {
        currentParentStack.pop();
      }
    } else if (level === lastIndentLevel && currentParentStack.length > 1) {
      // 同级别，保持当前父节点
      currentParentStack.pop();
      const parent = currentParentStack[currentParentStack.length - 1];
      if (parent.children.length > 0) {
        currentParentStack.push(parent);
      }
    }

    // 添加节点到当前父节点
    const currentParent = currentParentStack[currentParentStack.length - 1];
    currentParent.children.push(node);
    lastIndentLevel = level;
  });

  return root;
};

// 计算节点位置
const calculateNodePositions = (
  node: TreeNode,
  x: number = 0,
  y: number = 0,
  level: number = 0,
  yOffset: { [key: number]: number } = {}
): { nodes: Node[], edges: Edge[] } => {
  const result: { nodes: Node[], edges: Edge[] } = {
    nodes: [],
    edges: [],
  };

  // 确保每一层都有初始偏移量
  if (yOffset[level] === undefined) {
    yOffset[level] = 0;
  }

  // 创建当前节点
  const currentNode: Node = {
    id: node.id,
    type: 'mindmap',
    data: {
      id: node.id,
      label: node.label,
    },
    position: { x, y: y + yOffset[level] },
  };

  result.nodes.push(currentNode);

  // 处理子节点
  node.children.forEach((child, index) => {
    const childResult = calculateNodePositions(
      child,
      x + HORIZONTAL_SPACING,
      y,
      level + 1,
      yOffset
    );

    // 更新下一个节点的垂直偏移
    yOffset[level + 1] = (yOffset[level + 1] || 0) + VERTICAL_SPACING;

    result.nodes.push(...childResult.nodes);
    result.edges.push(...childResult.edges);

    // 添加连接边
    result.edges.push({
      id: `edge-${node.id}-${child.id}`,
      source: node.id,
      target: child.id,
      sourceHandle: 'right',
      targetHandle: 'left',
    });
  });

  return result;
};

// 导出为 Markdown
export const exportToMarkdown = (data: MindMapData): string => {
  const nodeMap = new Map(data.nodes.map(node => [node.id, node]));
  const edgeMap = new Map<string, Edge[]>();
  
  // 构建边的映射
  data.edges.forEach(edge => {
    if (!edgeMap.has(edge.source)) {
      edgeMap.set(edge.source, []);
    }
    edgeMap.get(edge.source)?.push(edge);
  });

  const generateMarkdown = (nodeId: string, level: number = 1, indent: number = 0): string[] => {
    const node = nodeMap.get(nodeId);
    if (!node) return [];

    const indentation = ' '.repeat(indent);
    const result = [`${indentation}- ${node.data.label}`];
    const childEdges = edgeMap.get(nodeId) || [];

    for (const edge of childEdges) {
      result.push(...generateMarkdown(edge.target, level + 1, indent + 2));
    }

    return result;
  };

  // 找到根节点（没有指向它的边的节点）
  const rootNode = data.nodes.find(node => 
    !data.edges.some(edge => edge.target === node.id)
  );

  if (!rootNode) return '';

  return generateMarkdown(rootNode.id).join('\n');
};

// 从 Markdown 导入
export const importFromMarkdown = (markdown: string): MindMapData => {
  try {
    const tree = parseMarkdownToTree(markdown);
    const { nodes, edges } = calculateNodePositions(tree);
    
    // 确保至少有一个节点
    if (nodes.length === 0) {
      throw new Error('No valid nodes found in markdown');
    }

    return {
      nodes,
      edges,
    };
  } catch (error) {
    console.error('Error importing markdown:', error);
    // 返回一个基本的空结构
    return {
      nodes: [{
        id: 'root',
        type: 'mindmap',
        data: {
          id: 'root',
          label: '导入失败',
        },
        position: { x: 0, y: 0 },
      }],
      edges: [],
    };
  }
};
