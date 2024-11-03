'use client'

import { useState } from 'react';
import { MindMapData } from '../../types';
import styles from './styles.module.scss';

interface DebugPanelProps {
  data: MindMapData;
  aiLogs?: string[];
}

type TabType = 'data' | 'ai';

export const DebugPanel = ({ data, aiLogs = [] }: DebugPanelProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('data');

  return (
    <div className={styles.debugPanel}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'data' ? styles.active : ''}`}
          onClick={() => setActiveTab('data')}
        >
          数据
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'ai' ? styles.active : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          AI 日志
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'data' ? (
          <pre>{JSON.stringify(data, null, 2)}</pre>
        ) : (
          <div className={styles.aiLogs}>
            {aiLogs.map((log, index) => (
              <div key={index} className={styles.logEntry}>
                {log}
              </div>
            ))}
            {aiLogs.length === 0 && (
              <div className={styles.emptyState}>
                暂无 AI 操作日志
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 