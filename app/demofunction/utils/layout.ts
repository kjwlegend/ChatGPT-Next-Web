import { Node, Edge, MindMapNodeData } from '../types';

const NODE_WIDTH = 150;  // 节点默认宽度
const NODE_HEIGHT = 50;  // 节点默认高度
export const HORIZONTAL_SPACING = 200;  // 水平间距
export const VERTICAL_SPACING = 100;  // 垂直间距

// 获取节点的所有子节点
export const getChildNodes = (nodeId: string, nodes: Node[], edges: Edge[]): Node[] => {
  const childEdges = edges.filter(edge => edge.source === nodeId);
  return nodes.filter(node => childEdges.some(edge => edge.target === node.id));
};

// 计算新子节点的位置
export const calculateNewChildPosition = (
  parentNode: Node<MindMapNodeData>,
  nodes: Node[],
  edges: Edge[],
): { x: number; y: number } => {
  const childNodes = getChildNodes(parentNode.id, nodes, edges);
  
  if (childNodes.length === 0) {
    // 第一个子节点，直接放在右侧
    return {
      x: parentNode.position.x + HORIZONTAL_SPACING,
      y: parentNode.position.y,
    };
  }

  // 获取现有子节点的垂直范围
  const childYPositions = childNodes.map(node => node.position.y);
  const minY = Math.min(...childYPositions);
  const maxY = Math.max(...childYPositions);

  // 检查是否有足够的空间放置新节点
  const existingPositions = new Set(childYPositions);
  let newY = minY;
  const step = VERTICAL_SPACING;

  // 寻找可用的垂直位置
  while (newY <= maxY + step) {
    if (!existingPositions.has(newY)) {
      return {
        x: parentNode.position.x + HORIZONTAL_SPACING,
        y: newY,
      };
    }
    newY += step;
  }

  // 如果没有找到合适的位置，就放在最下方
  return {
    x: parentNode.position.x + HORIZONTAL_SPACING,
    y: maxY + VERTICAL_SPACING,
  };
};

// 检查位置是否有重叠
export const hasOverlap = (
  position: { x: number; y: number },
  nodes: Node[],
): boolean => {
  return nodes.some(node => {
    const dx = Math.abs(node.position.x - position.x);
    const dy = Math.abs(node.position.y - position.y);
    return dx < NODE_WIDTH && dy < NODE_HEIGHT;
  });
};

// 调整位置避免重叠
export const adjustPositionToAvoidOverlap = (
  initialPosition: { x: number; y: number },
  nodes: Node[],
): { x: number; y: number } => {
  let position = { ...initialPosition };
  let attempts = 0;
  const maxAttempts = 10;

  while (hasOverlap(position, nodes) && attempts < maxAttempts) {
    position.y += VERTICAL_SPACING;
    attempts += 1;
  }

  return position;
}; 