import React from 'react';
import { MindMapData, MindMapNodeWithPosition } from '../../types';
import styles from './styles.module.scss';

interface Props {
  data: MindMapData;
}

export const MarkdownPreview: React.FC<Props> = ({ data }) => {
  const generateMarkdown = (nodes: MindMapNodeWithPosition[], level = 0): string[] => {
    return nodes.reduce((acc: string[], node) => {
      const prefix = '#'.repeat(level + 1);
      acc.push(`${prefix} ${node.content}`);
      if (node.children && node.children.length > 0) {
        const childrenWithPosition = node.children.map(child => ({
          ...child,
          position: { x: 0, y: 0 },
        }));
        acc.push(...generateMarkdown(childrenWithPosition, level + 1));
      }
      return acc;
    }, []);
  };

  const markdown = generateMarkdown(data.nodes);

  return (
    <div className={styles.preview}>
      {markdown.map((line, index) => (
        <div key={index} className={styles.line}>
          {line}
        </div>
      ))}
    </div>
  );
}; 