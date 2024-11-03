import { createContext, useContext, ReactNode } from 'react';
import { AIService, AIServiceConfig } from '../services/aiService';

interface AIContextValue {
  service: AIService;
  config: AIServiceConfig;
}

const AIContext = createContext<AIContextValue | null>(null);

export const AIProvider = ({
  children,
  config,
}: {
  children: ReactNode;
  config?: AIServiceConfig;
}) => {
  const service = new AIService(config);

  return (
    <AIContext.Provider value={{ service, config: config || {} }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAIContext = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAIContext must be used within an AIProvider');
  }
  return context;
}; 