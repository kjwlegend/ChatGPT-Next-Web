import { MindMapData } from "../types";
import { mindMapToText } from "./aiProcessor";

export type PromptAction =
	| "analyze" // 分析结构
	| "suggest" // 提供建议
	| "extend" // 扩展内容
	| "optimize" // 优化结构
	| "summarize"; // 总结内容

export interface PromptConfig {
	temperature?: number; // AI 创造性程度
	maxTokens?: number; // 最大 token 数
	language?: string; // 输出语言
}

// 生成 AI 提示词
export const generatePrompt = (
	data: MindMapData,
	action: PromptAction,
	config: PromptConfig = {},
): string => {
	const { language = "zh-CN" } = config;
	const context = mindMapToText(data);

	const prompts = {
		analyze: `
      请分析以下思维导图的结构和内容：
      
      ${context}
      
      请提供：
      1. 主题概述
      2. 层级结构分析
      3. 逻辑关系评估
      4. 内容完整性建议
      5. 可能的扩展方向
    `,

		suggest: `
      基于以下思维导图：
      
      ${context}
      
      请为选中的节点提供建议：
      1. 内容优化建议
      2. 子节点补充建议
      3. 相关概念建议
      4. 结构调整建议
    `,

		extend: `
      基于以下思维导图：
      
      ${context}
      
      请为选中的节点生成扩展内容：
      1. 自动生成3-5个相关的子节点
      2. 为每个子节点提供简要说明
      3. 确保生成的内容与当前主题相关
      4. 保持层级结构的合理性
    `,

		optimize: `
      请优化以下思维导图的结构：
      
      ${context}
      
      优化要求：
      1. 调整节点层级关系
      2. 合并相似概念
      3. 拆分过于复杂的节点
      4. 优化节点命名
    `,

		summarize: `
      请总结以下思维导图的主要内容：
      
      ${context}
      
      要求：
      1. 提供整体概述
      2. 突出关键概念
      3. 说明主要关系
      4. 指出特色亮点
    `,
	};

	return prompts[action] || prompts.analyze;
};

// 提示词模板
export const promptTemplates = {
	nodeOptimize: (label: string) =>
		`请优化以下节点的描述，使其更加清晰简洁：${label}`,

	childrenGenerate: (label: string, count: number = 3) =>
		`请为主题"${label}"生成 ${count} 个相关的子主题，每个子主题简要说明。`,

	relationAnalyze: (source: string, target: string) =>
		`请分析节点"${source}"和"${target}"之间的关系，并提供优化建议。`,
};
