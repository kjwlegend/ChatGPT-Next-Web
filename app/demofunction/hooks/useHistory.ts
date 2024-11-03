import { useState, useCallback } from 'react';
import { MindMapData, HistoryState } from '../types';

const MAX_HISTORY_LENGTH = 50;

export const useHistory = (initialState: MindMapData) => {
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: initialState,
    future: [],
  });

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const pushState = useCallback((newState: MindMapData) => {
    setHistory(prev => ({
      past: [...prev.past.slice(-MAX_HISTORY_LENGTH), prev.present],
      present: newState,
      future: [],
    }));
  }, []);

  const undo = useCallback(() => {
    setHistory(prev => {
      if (prev.past.length === 0) return prev;

      const newPast = prev.past.slice(0, -1);
      const newPresent = prev.past[prev.past.length - 1];

      return {
        past: newPast,
        present: newPresent,
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory(prev => {
      if (prev.future.length === 0) return prev;

      const [newPresent, ...newFuture] = prev.future;

      return {
        past: [...prev.past, prev.present],
        present: newPresent,
        future: newFuture,
      };
    });
  }, []);

  return {
    state: history.present,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}; 