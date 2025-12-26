import { useState, useCallback } from "react";

interface ImageHistoryState {
  history: string[];
  currentIndex: number;
}

interface UseImageHistoryReturn {
  current: string | null;
  canUndo: boolean;
  canRedo: boolean;
  push: (state: string) => void;
  undo: () => void;
  redo: () => void;
  reset: (initialState?: string) => void;
  historyLength: number;
}

const MAX_HISTORY_SIZE = 20;

export function useImageHistory(initialState?: string): UseImageHistoryReturn {
  const [state, setState] = useState<ImageHistoryState>({
    history: initialState ? [initialState] : [],
    currentIndex: initialState ? 0 : -1,
  });

  const current = state.currentIndex >= 0 ? state.history[state.currentIndex] : null;
  const canUndo = state.currentIndex > 0;
  const canRedo = state.currentIndex < state.history.length - 1;

  const push = useCallback((newState: string) => {
    setState((prev) => {
      // Remove any future states (redo history) when pushing new state
      const newHistory = prev.history.slice(0, prev.currentIndex + 1);
      newHistory.push(newState);

      // Limit history size
      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift();
        return {
          history: newHistory,
          currentIndex: newHistory.length - 1,
        };
      }

      return {
        history: newHistory,
        currentIndex: newHistory.length - 1,
      };
    });
  }, []);

  const undo = useCallback(() => {
    setState((prev) => {
      if (prev.currentIndex <= 0) return prev;
      return {
        ...prev,
        currentIndex: prev.currentIndex - 1,
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((prev) => {
      if (prev.currentIndex >= prev.history.length - 1) return prev;
      return {
        ...prev,
        currentIndex: prev.currentIndex + 1,
      };
    });
  }, []);

  const reset = useCallback((initialState?: string) => {
    setState({
      history: initialState ? [initialState] : [],
      currentIndex: initialState ? 0 : -1,
    });
  }, []);

  return {
    current,
    canUndo,
    canRedo,
    push,
    undo,
    redo,
    reset,
    historyLength: state.history.length,
  };
}
