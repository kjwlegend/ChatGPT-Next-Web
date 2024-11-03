import { useCallback, useRef } from 'react';
import { MindMapData } from '../types';
import { importFromJSON } from '../utils/dataConverter';
import { importFromMarkdown } from '../utils/markdownConverter';

export const useImport = (onDataImport: (data: MindMapData) => void) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mdFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>, isMarkdown: boolean) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      let importedData: MindMapData | null = null;

      try {
        importedData = isMarkdown 
          ? importFromMarkdown(content)
          : importFromJSON(content);

        if (importedData) {
          onDataImport(importedData);
        } else {
          throw new Error('Invalid data format');
        }
      } catch (error) {
        console.error('Import error:', error);
        alert('导入失败：无效的文件格式');
      }
    };

    reader.readAsText(file);
    event.target.value = ''; // 重置文件输入
  }, [onDataImport]);

  const triggerJSONImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const triggerMarkdownImport = useCallback(() => {
    mdFileInputRef.current?.click();
  }, []);

  return {
    fileInputRef,
    mdFileInputRef,
    handleFileChange,
    triggerJSONImport,
    triggerMarkdownImport,
  };
}; 