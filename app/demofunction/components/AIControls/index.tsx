'use client'

import { useState, useCallback } from 'react';
import { MindMapData, Node } from '../../types';
import { PromptAction } from '../../utils/aiPrompts';
import { useAI } from '../../hooks/useAI';
import styles from './styles.module.scss';

interface AIControlsProps {
  data: MindMapData;
  selectedNodes: Node[];
  onUpdate: (data: MindMapData) => void;
  onLog?: (log: string) => void;
}

export const AIControls = ({ data, selectedNodes, onUpdate, onLog }: AIControlsProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [response, setResponse] = useState<string>('');

  const {
    analyzeMap,
    optimizeNode,
    generateChildNodes,
    error,
  } = useAI(data, onUpdate, onLog);

  const handleAction = useCallback(async (action: PromptAction) => {
    setIsProcessing(true);
    setResponse('');
    try {
      const result = await analyzeMap(action);
      if (result) {
        setResponse(result.explanation);
      }
    } catch (error) {
      console.error('AI action failed:', error);
      setResponse('操作失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  }, [analyzeMap]);

  const handleOptimize = useCallback(async () => {
    if (selectedNodes.length !== 1) {
      setResponse('请选择一个节点进行优化');
      return;
    }

    setIsProcessing(true);
    setResponse('');
    try {
      await optimizeNode(selectedNodes[0].id);
      setResponse('节点优化完成');
    } catch (error) {
      console.error('Node optimization failed:', error);
      setResponse('优化失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedNodes, optimizeNode]);

  const handleGenerate = useCallback(async () => {
    if (selectedNodes.length !== 1) {
      setResponse('请选择一个节点生成子节点');
      return;
    }

    setIsProcessing(true);
    setResponse('');
    try {
      await generateChildNodes(selectedNodes[0].id);
      setResponse('子节点生成完成');
    } catch (error) {
      console.error('Child nodes generation failed:', error);
      setResponse('生成失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedNodes, generateChildNodes]);

  return (
    <div className={styles.aiControls}>
      <button 
        className={styles.mainButton}
        onClick={() => setShowActions(!showActions)}
      >
        AI 助手
      </button>

      {showActions && (
        <div className={styles.actionPanel}>
          <div className={styles.actions}>
            <button
              onClick={() => handleAction('analyze')}
              disabled={isProcessing}
            >
              分析结构
            </button>
            <button
              onClick={() => handleAction('suggest')}
              disabled={isProcessing}
            >
              优化建议
            </button>
            <button
              onClick={handleOptimize}
              disabled={isProcessing || selectedNodes.length !== 1}
            >
              优化节点
            </button>
            <button
              onClick={handleGenerate}
              disabled={isProcessing || selectedNodes.length !== 1}
            >
              生成子节点
            </button>
          </div>

          {(isProcessing || response) && (
            <div className={styles.responsePanel}>
              {isProcessing ? (
                <div className={styles.loading}>处理中...</div>
              ) : (
                <div className={styles.response}>{response}</div>
              )}
            </div>
          )}

          {error && (
            <div className={styles.error}>{error}</div>
          )}
        </div>
      )}
    </div>
  );
}; 