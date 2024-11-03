import { MindMapData } from '../types';
import { PromptAction, PromptConfig, generatePrompt } from '../utils/aiPrompts';
import { AISuggestion } from '../utils/aiResponseHandler';
import { AIApi } from '../utils/aiApi';
import { AIConfig, AIMessage } from '../types/ai';

export interface AIResponse {
  suggestions: AISuggestion[];
  explanation: string;
}

export class AIService {
  private api: AIApi;
  private abortController: AbortController | null = null;

  constructor(config: AIConfig) {
    this.api = new AIApi(config);
  }

  async analyze(
    data: MindMapData, 
    action: PromptAction, 
    config?: PromptConfig,
    onStream?: (chunk: string) => void
  ): Promise<AIResponse> {
    const prompt = generatePrompt(data, action, config);
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: '你是一个专业的思维导图分析助手，帮助用户分析和优化思维导图的结构和内容。',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    try {
      if (onStream) {
        this.abortController = new AbortController();
        await this.api.streamChat(messages, onStream, this.abortController.signal);
        return { suggestions: [], explanation: '' }; // 流式响应不返回具体内容
      } else {
        const response = await this.api.chat(messages);
        return {
          suggestions: [], // 需要实现解析逻辑
          explanation: response,
        };
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
      throw new Error('AI 分析失败');
    }
  }

  async generateNodes(parentNode: string, count: number = 3): Promise<string[]> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: '你是一个专业的思维导图节点生成助手。',
      },
      {
        role: 'user',
        content: `请为主题"${parentNode}"生成 ${count} 个相关的子主题，每个子主题用换行分隔。`,
      },
    ];

    try {
      const response = await this.api.chat(messages);
      return response.split('\n').filter(line => line.trim());
    } catch (error) {
      console.error('Node generation failed:', error);
      throw new Error('节点生成失败');
    }
  }

  async optimizeContent(content: string): Promise<string> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: '你是一个专业的文本优化助手。',
      },
      {
        role: 'user',
        content: `请优化以下内容，使其更加清晰简洁：${content}`,
      },
    ];

    try {
      return await this.api.chat(messages);
    } catch (error) {
      console.error('Content optimization failed:', error);
      throw new Error('内容优化失败');
    }
  }

  cancelRequest() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}