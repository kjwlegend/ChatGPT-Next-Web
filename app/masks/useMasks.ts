import { useState, useEffect, useCallback } from "react";

import { getPromptHotness, getPromptCategory, getPrompt } from "./service";
import { BuiltinMask } from "../types/mask";
import { useMaskStore } from "../store/mask";

// 定义 setMasksCallback 类型
type SetMasksCallback = (masks: BuiltinMask[]) => void;

// 将 fetchPrompts 方法提取到外部，并添加参数以使其更通用
export const fetchPrompts = async (
	setMasksCallback: SetMasksCallback,
	page = 1 as number,
	limit = 25 as number,
) => {
	try {
		const response = await getPrompt({ page, limit });

		if (response.data) {
			setMasksCallback(response.data);
		}

		return response.data;
	} catch (error) {
		console.error("Failed to fetch prompts", error);
		return [];
	}
};

export function useMasks() {
	const [masks, setMasks] = useState<BuiltinMask[]>([]);
	const maskStore = useMaskStore();

	// 使用 useCallback 钩子来确保 fetchPromptsCallback 的引用不变
	const fetchPromptsCallback = useCallback(
		(page: number, limit: number) => fetchPrompts(setMasks, page, limit),
		[],
	);

	useEffect(() => {
		// 使用 fetchPromptsCallback 而不是直接调用 fetchPrompts
		fetchPromptsCallback(1, 100);
		masks.forEach((mask) => {
			maskStore.add(mask);
			console.log("add", mask);
		});
	}, [fetchPromptsCallback]);

	// 返回 masks 和 fetchPromptsCallback 以便可以单独调用
	return { masks, fetchPrompts: fetchPromptsCallback };
}
