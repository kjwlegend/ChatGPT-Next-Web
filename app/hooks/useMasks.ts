import { useState, useEffect, useCallback } from "react";

import {
	getPromptHotness,
	getPromptCategory,
	getPrompt,
} from "../masks/service";
import { BuiltinMask, Mask, Tags } from "../types/mask";
import { useMaskStore } from "../store/mask";
import { getAgents, getTags } from "../services/api/agents";

// 定义 setMasksCallback 类型
type SetMasksCallback = (masks: BuiltinMask[]) => void;

// 将 fetchPrompts 方法提取到外部，并添加参数以使其更通用
const fetchPrompts = async (page = 1 as number, limit = 25 as number) => {
	try {
		const response = await getAgents({ page, limit });
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

const fetchTags = async (page = 1 as number, limit = 50 as number) => {
	try {
		const response = await getTags({ page, limit });
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
	const [masks, setMasks] = useState<Mask[]>([]);
	const [tags, setTags] = useState<Tags[]>([]);
	const maskStore = useMaskStore();

	const fetchPromptsCallback = useCallback(
		async (page: number, limit: number) => {
			const { data, total, is_next } = await fetchPrompts(page, limit);

			// 将接口返回的数据映射到 Mask 类型
			const mappedMasks = data.map((item) => ({
				id: item.agent_id.toString(), // 将 agent_id 转换为字符串
				name: item.agent_name,
				tags: item.tags, // 假设这里用 language 作为 category
				author: item.creator ? item.creator.toString() : undefined,
				prompt_type: undefined, // 如果有对应字段可以填入
				topic: undefined, // 如果有对应字段可以填入
				avatar: item.image || "", // 使用默认值处理可能的 null
				featureMask: item.is_feature_agent,
				zodiac: undefined, // 如果有对应字段可以填入
				img: item.image || "", // 使用 image 字段作为 img
				description: item.description,
				intro: item.chat_intro,
				hideContext: true, // 默认值，视具体需求而定
				version: undefined, // 如果有对应字段可以填入
				context: item.prompts_data || [],
				modelConfig: item.modelconfig || {}, // 处理 modelconfig 字段，确保符合类型
				lang: item.language || "zh-CN", // 默认语言
				builtin: false, // 默认值，视具体需求而定
				syncGlobalConfig: undefined, // 如果有对应字段可以填入
				usePlugins: false, // 默认值，视具体需求而定
				plugins: [], // 默认值，视具体需求而定
				hotness: item.use_count || 0, // 使用 use_count 作为 hotness 值
				updatedAt: new Date(item.updated_at).getTime(), // 转换为时间戳
				createdAt: new Date(item.created_at).getTime(), // 转换为时间戳
				roleSetting: undefined, // 如果有对应字段可以填入
			}));

			// 更新本地状态
			setMasks((prevMasks) => {
				const newMasks = [...prevMasks];
				mappedMasks.forEach((newMask) => {
					const existingIndex = newMasks.findIndex(
						(mask) => mask.id === newMask.id,
					);
					if (existingIndex !== -1) {
						// 如果 mask 已存在，更新它
						newMasks[existingIndex] = newMask;
					} else {
						// 如果是新的 mask，添加它
						newMasks.push(newMask);
					}
				});
				return newMasks;
			});

			// 更新 maskStore
			mappedMasks.forEach((mask) => {
				maskStore.add(mask); // 使用 add 方法，它会处理更新和添加
			});

			return { data: mappedMasks, total, is_next };
		},
		[maskStore], // 添加依赖项 maskStore 确保更新时使用最新值
	);

	const fetchTagsCallback = useCallback(
		async (page: number, limit: number) => {
			const { data, total, is_next } = await fetchTags(page, limit);

			const mappedTags = data.map((item) => ({
				tag_id: item.tag_id.toString(), // 将 tag_id 转换为字符串
				tag_key: item.tag_key,
				tag_name: item.tag_name,
				tag_type: item.tag_type,
				description: item.description,
			}));

			setTags((prevTags) => [...prevTags, ...mappedTags]);

			mappedTags.forEach((tag) => {
				maskStore.addTags(tag);
			});

			return { data: mappedTags, total, is_next };
		},
		[maskStore], // 添加依赖项 maskStore 确保更新时使用最新值
	);

	return { masks, fetchPromptsCallback, fetchTagsCallback }; // 返回 masks 和 fetch 函数以供使用
}
