import { memo, useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { MindMapNodeData } from '../../types';
import styles from './MindMapNode.module.scss';

export const MindMapNode = memo(({ 
  id, 
  data,
  isConnectable 
}: NodeProps<MindMapNodeData>) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(data.content);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation(); // 阻止事件冒泡
    
    if (e.key === 'Enter') {
      e.preventDefault();
      finishEditing();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditing();
    }
  };

  const finishEditing = () => {
    setIsEditing(false);
  };

  const cancelEditing = () => {
    setContent(data.content);
    setIsEditing(false);
  };

  return (
    <div className={styles.mindMapNode} onDoubleClick={handleDoubleClick}>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
      />
      {isEditing ? (
        <input
          ref={inputRef}
          className={styles.nodeInput}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={finishEditing}
        />
      ) : (
        <div className={styles.label}>
          {data.content}
        </div>
      )}
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
      />
    </div>
  );
});

MindMapNode.displayName = 'MindMapNode';