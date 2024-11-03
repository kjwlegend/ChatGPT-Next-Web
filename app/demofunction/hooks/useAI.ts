import { useState, useCallback } from "react";
import { MindMapData, Node } from "../types";
import { PromptAction, generatePrompt } from "../utils/aiPrompts";
import { strictLLMResult } from "@/app/chains/basic";
import { AIMessage } from "../types/ai";

export const useAI = (
	data: MindMapData,
	onChange: (data: MindMapData) => void,
	onLog?: (log: string) => void,
) => {
	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// 分析思维导图
	const analyzeMap = useCallback(
		async (action: PromptAction) => {
			setIsProcessing(true);
			setError(null);
			onLog?.(`开始${action}分析...`);

			try {
				const prompt = generatePrompt(data, action);
				const messages: AIMessage[] = [
					{
						role: "system",
						content: "你是一个专业的思维导图分析助手，帮助用户分析和优化思维导图的结构和内容。",
					},
					{
						role: "user",
						content: prompt,
					},
				];

				const response = await strictLLMResult(messages);
				onLog?.(`分析完成: ${response.slice(0, 100)}...`);
				return {
					suggestions: [],
					explanation: response,
				};
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : "未知错误";
				setError(errorMessage);
				onLog?.(`分析失败: ${errorMessage}`);
				return null;
			} finally {
				setIsProcessing(false);
			}
		},
		[data, onLog]
	);

	// 优化节点内容
	const optimizeNode = useCallback(
		async (nodeId: string) => {
			const node = data.nodes.find((n) => n.id === nodeId);
			if (!node) return;

			setIsProcessing(true);
			setError(null);
			onLog?.(`开始优化节点: ${node.data.label}`);

			try {
				const messages: AIMessage[] = [
					{
						role: "system",
						content: "你是一个专业的文本优化助手。",
					},
					{
						role: "user",
						content: `请优化以下内容，使其更加清晰简洁：${node.data.label}`,
					},
				];

				const optimizedContent = await strictLLMResult(messages);
				onLog?.(`节点优化完成: ${optimizedContent}`);

				const newNodes = data.nodes.map((n) =>
					n.id === nodeId
						? { ...n, data: { ...n.data, label: optimizedContent } }
						: n
				);
				onChange({ ...data, nodes: newNodes });
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : "未知错误";
				setError(errorMessage);
				onLog?.(`优化失败: ${errorMessage}`);
			} finally {
				setIsProcessing(false);
			}
		},
		[data, onChange, onLog]
	);

	// 生成子节点
	const generateChildNodes = useCallback(
		async (parentId: string, count: number = 3) => {
			const parentNode = data.nodes.find((n) => n.id === parentId);
			if (!parentNode) return;

			setIsProcessing(true);
			setError(null);
			onLog?.(`开始为节点生成子节点: ${parentNode.data.label}`);

			try {
				const messages: AIMessage[] = [
					{
						role: "system",
						content: "你是一个专业的思维导图节点生成助手。",
					},
					{
						role: "user",
						content: `请为主题"${parentNode.data.label}"生成 ${count} 个相关的子主题，每个子主题用换行分隔。`,
					},
				];

				const response = await strictLLMResult(messages);
				const labels = response.split('\n').filter(line => line.trim());
				onLog?.(`生成完成: ${labels.join(', ')}`);

				// TODO: 实现节点创建和布局逻辑
				// 可以调用之前实现的节点创建函数
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : "未知错误";
				setError(errorMessage);
				onLog?.(`生成失败: ${errorMessage}`);
			} finally {
				setIsProcessing(false);
			}
		},
		[data, onLog]
	);

	return {
		isProcessing,
		error,
		analyzeMap,
		optimizeNode,
		generateChildNodes,
	};
};
