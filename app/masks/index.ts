import { Mask } from "../store/mask";
import { CN_MASKS } from "./cn";
import { EN_MASKS } from "./en";
import { type BuiltinMask } from "./typing";
import {
	getPromptHotness,
	getPromptCategory,
	getPrompt,
} from "../api/backend/prompts";
import { MaskCategory } from "../constant";
import { Console } from "console";

export const BUILTIN_MASK_ID = 100000;

const BUILTIN_MASK_STORE = {
	buildinId: BUILTIN_MASK_ID,
	masks: {} as Record<string, BuiltinMask>,
	get(id?: string) {
		if (!id) return undefined;
		return this.masks[id];
	},
	getByName(name: string) {
		return Object.values(this.masks).find((m) => m.name === name);
	},
	add(m: BuiltinMask) {
		const mask = { ...m };
		this.masks[mask.id] = mask;
		return mask;
	},
};

async function fetchPromptData() {
	try {
		const response = await getPrompt({ page: 1, limit: 50 });
		return response.data;
	} catch (error) {
		console.error("Failed to fetch prompts", error);
		return [];
	}
}

async function fetchHotnessData() {
	try {
		const response = await getPromptHotness();
		const hotnessData = response.data;

		hotnessData.forEach((item: any) => {
			const maskName = item.prompt.toString();
			const mask = BUILTIN_MASK_STORE.getByName(maskName);
			if (mask) {
				mask.hotness = item.hotness;
			}
		});
	} catch (error) {
		console.error("Failed to fetch hotness data:", error);
	}
}

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
				existingCategory.value = item.value;
			} else {
				MaskCategory.push(category);
			}
		});
	} catch (error) {
		console.error("Failed to fetch prompt category:", error);
	}
}

async function setupBuiltins(): Promise<void> {
	const serverMasks = await fetchPromptData();
	console.log("serverMasks", serverMasks);
	const allMasks: BuiltinMask[] = [...EN_MASKS];

	allMasks.forEach((mask) => {
		BUILTIN_MASK_STORE.add(mask);
	});
}

async function initializeMasks(): Promise<void> {
	await setupBuiltins();
	// ...其他可能的初始化函数
	await fetchHotnessData();
	await fetchPromptCategory();
}

// 导出一个Promise，它将在所有masks初始化后解决
const BUILTIN_MASKS: Promise<BuiltinMask[]> = initializeMasks().then(() => {
	const data = Object.values(BUILTIN_MASK_STORE.masks);
	// console.log("Built-in masks initialized", data);
	return data;
});

export { BuiltinMask, BUILTIN_MASK_STORE, BUILTIN_MASKS };
