import { useState, useEffect, useCallback } from "react";

import { getPromptHotness, getPromptCategory, getPrompt } from "./service";
import { BuiltinMask } from "../types/mask";
import { useMaskStore } from "../store/mask";

// 定义 setMasksCallback 类型
type SetMasksCallback = (masks: BuiltinMask[]) => void;

// 将 fetchPrompts 方法提取到外部，并添加参数以使其更通用
const fetchPrompts = async (page = 1 as number, limit = 25 as number) => {
	try {
		const response = await getPrompt({ page, limit });
		const { data, total, is_next, pageNum } = response;
		return {
			data: (data as BuiltinMask[]) || ([] as BuiltinMask[]),
			total: total,
			is_next: is_next,
			page: pageNum,
		};
	} catch (error) {
		console.error("Failed to fetch prompts", error);
		return { data: [], total: 0, is_next: false };
	}
};

export function useMasks() {
	const [masks, setMasks] = useState<BuiltinMask[]>([]);
	const maskStore = useMaskStore();

	const fetchPromptsCallback = useCallback(
		async (page: number, limit: number) => {
			const { data, total, is_next } = await fetchPrompts(page, limit);
			setMasks((prevMasks) => [...prevMasks, ...data]);
			// 将新获取的 masks 添加到 maskStore
			data.forEach((mask) => {
				maskStore.add(mask);
				// console.log("add", mask);
			});
			// 如果需要处理 total 和 isNext，可以在这里进行
			// ...

			return { data, total, is_next };
		},
		[],
	);

	// useEffect(() => {
	// 	// 使用 fetchPromptsCallback 而不是直接调用 fetchPrompts
	// 	fetchPromptsCallback(1, 50);
	// }, [fetchPromptsCallback]);

	// 返回 masks 和 fetchPromptsCallback 以便可以单独调用
	return { masks, fetchPrompts: fetchPromptsCallback };
}
