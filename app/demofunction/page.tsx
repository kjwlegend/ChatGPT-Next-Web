'use client'

import { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { MindMap } from './components/MindMap';
import { MarkdownPreview } from './components/MarkdownPreview';
import { MindMapData } from './types';
import styles from './styles/layout.module.scss';

const DEFAULT_DATA: MindMapData = {
  nodes: [
    {
      id: 'root',
      content: '思维导图',
      children: [],
      position: { x: 0, y: 0 },
    }
  ],
  edges: []
};

export default function MindMapPage() {
  const [mindMapData, setMindMapData] = useState<MindMapData>(DEFAULT_DATA);

  const handleMindMapChange = (newData: MindMapData) => {
    setMindMapData(newData);
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <MarkdownPreview data={mindMapData} />
      </div>
      <div className={styles.rightPanel}>
        <ReactFlowProvider>
          <MindMap 
            data={mindMapData}
            onChange={handleMindMapChange}
          />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
