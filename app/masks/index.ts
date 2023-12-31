import { Mask } from "../store/mask";
import { CN_MASKS } from "./cn";
import { EN_MASKS } from "./en";

import { type BuiltinMask } from "./typing";
export { type BuiltinMask } from "./typing";
import { getPromptHotness, getPromptCategory } from "../api/backend/prompts";

export const BUILTIN_MASK_ID = 100000;

export const BUILTIN_MASK_STORE = {
	buildinId: BUILTIN_MASK_ID,
	masks: {} as Record<string, BuiltinMask>,
	get(id?: string) {
		if (!id) return undefined;
		return this.masks[id] as Mask | undefined;
	},
	getByname(name: string) {
		// search by name
		return Object.values(this.masks).find((m) => m.name === name);
	},
	add(m: BuiltinMask) {
		const mask = { ...m, id: this.buildinId++, builtin: true };
		this.masks[mask.id] = mask;
		return mask;
	},
};

// 调用接口获取hotness数据
async function fetchHotnessData() {
	try {
		const response = await getPromptHotness();
		const hotnessData = response.data;

		hotnessData.forEach((item: any) => {
			const maskName = item.prompt.toString();
			const mask = BUILTIN_MASK_STORE.getByname(maskName);
			if (mask) {
				mask.hotness = item.hotness;
			}
		});
		// buildBuiltinMasks(); // 在获取hotness数据后构建BUILTIN_MASKS
	} catch (error) {
		console.error("Failed to fetch hotness data:", error);
	}
}

// use api to get prompt category
//
import { MaskCategory, MaskCategoryType, maskCategories } from "../constant";

// export let MaskCategory: MaskCategoryType[] = [];

async function fetchPromptCategory() {
	try {
		const response = await getPromptCategory();
		const categoryData = response.data;

		categoryData.forEach((item: any) => {
			const category = {
				key: item.category_key,
				value: item.category_name,
				scene: item.category_scene,
				tags: item.category_tags,
			};
			const existingCategory = MaskCategory.find((c) => c.key === item.key);
			if (existingCategory) {
				if (existingCategory.value !== item.value) {
					existingCategory.value = item.value;
				}
			} else {
				MaskCategory.push(category);
			}
		});

		// 输出添加完成后的MaskCategory枚举
		console.log(MaskCategory);
	} catch (error) {
		console.error("Failed to fetch prompt category:", error);
	}
}

// 将接口所获得的分类数据 添加到 export enum MaskCategory

// async function buildBuiltinMasks() {
//   BUILTIN_MASKS.forEach((m) => BUILTIN_MASK_STORE.add(m));
// }

export const BUILTIN_MASKS: BuiltinMask[] = [...CN_MASKS, ...EN_MASKS].map(
	(m) => BUILTIN_MASK_STORE.add(m),
);

fetchHotnessData(); // 在最开始调用fetchHotnessData来获取hotness数据
fetchPromptCategory();
