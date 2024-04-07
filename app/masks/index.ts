import { CN_MASKS } from "./cn";
import { EN_MASKS } from "./en";
import { getPromptHotness, getPromptCategory, getPrompt } from "./service";
import { MaskCategory } from "../constant";
import { Console } from "console";

import { BuiltinMask } from "../types/mask";
import { featureMask } from "./featureMask_cn";

import fs from "fs/promises";
import path from "path";

export const BUILTIN_MASK_ID = 100000;
export const SERVER_MASKS = {} as Record<string, BuiltinMask>;

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

function setupBuiltins() {
	const allMasks: BuiltinMask[] = [...featureMask, ...CN_MASKS, ...EN_MASKS];
	// console.log(allMasks);
	allMasks.forEach((mask) => {
		BUILTIN_MASK_STORE.add(mask);
		//  add to servermask
		// console.log(mask);
	});
}

async function initializeMasks(): Promise<void> {
	setupBuiltins();
	// ...其他可能的初始化函数
	await fetchPromptCategory();
}
initializeMasks();
const allMasks: BuiltinMask[] = [...CN_MASKS, ...EN_MASKS];

const BUILTIN_MASKS = Object.values(allMasks);

export { BUILTIN_MASK_STORE, BUILTIN_MASKS };
