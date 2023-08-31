import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  Fragment,
} from "react";

export interface ChatContextType {
  hitBottom: boolean;
  setHitBottom: React.Dispatch<React.SetStateAction<boolean>>;
  autoScroll: boolean;
  setAutoScroll: React.Dispatch<React.SetStateAction<boolean>>;
  showPromptModal: boolean;
  setShowPromptModal: React.Dispatch<React.SetStateAction<boolean>>;
  userInput: string;
  setUserInput: React.Dispatch<React.SetStateAction<string>>;
}

// 创建 ChatContext 上下文对象
export const ChatContext = React.createContext<any>({
  hitBottom: true,
  setHitBottom: () => void 0,
  autoScroll: true,
  setAutoScroll: () => void 0,
  showPromptModal: false,
  setShowPromptModal: () => void 0,
  userInput: "",
  setUserInput: () => void 0,
});
