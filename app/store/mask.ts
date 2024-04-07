import { BUILTIN_MASKS } from "../masks";
import { getLang, Lang } from "../locales";
import { DEFAULT_TOPIC } from "./chat";
import { ModelConfig, useAppConfig } from "./config";
import { StoreKey, MaskCategory, MaskCategoryType } from "../constant";
import { nanoid } from "nanoid";
import { createPersistStore } from "../utils/store";
import { type } from "os";
import { Plugin } from "./plugin";

import { ChatMessage } from "../types/chat";
import { Mask } from "../types/mask";
import { useMasks } from "../masks/useMasks";
import { createPrompt, deletePrompt, updatePrompt } from "../masks/service";

export const DEFAULT_MASK_STATE = {
	masks: {} as Record<string, Mask>,
	maskslist: [] as Mask[],
	updateStates: (updatedMasksList: Mask[]) => {
		// 将数组转换为对象
		const updatedMasks = updatedMasksList.reduce(
			(acc, mask) => {
				acc[mask.id] = mask; // 假设每个 mask 对象都有一个唯一的 id 属性
				return acc;
			},
			{} as Record<string, Mask>,
		);

		// 同时更新 masks 和 maskslist
		({ masks: updatedMasks, maskslist: updatedMasksList });
	},
};

export type MaskState = typeof DEFAULT_MASK_STATE;

export const DEFAULT_MASK_AVATAR = "gpt-bot";
export const createEmptyMask = () =>
	({
		id: nanoid(),
		avatar: DEFAULT_MASK_AVATAR,
		category: "通用",
		author: "",
		topic: "",
		name: "未命名自定义助手",
		prompt_type: "assistant",
		intro: "欢迎使用自定义助手",
		context: [],
		syncGlobalConfig: true, // use global config as default
		modelConfig: { ...useAppConfig.getState().modelConfig },
		lang: getLang(),
		builtin: false,
		featureMask: false,
		updatedAt: Date.now(),
		createdAt: Date.now(),
		usePlugins: /^gpt(?!.*03\d{2}$).*$/.test(
			useAppConfig.getState().modelConfig.model,
		),
		plugins: ["web-search"],
	}) as Mask;

export const useMaskStore = createPersistStore(
	{
		...DEFAULT_MASK_STATE,
	},

	(set, get) => ({
		async create(mask?: Partial<Mask>, user: number = 2) {
			const masks = get().masks;
			let id, res;
			let newmask: Partial<Mask> = { ...mask, id: id, prompt_id: 0 };

			try {
				res = await createPrompt({
					...createEmptyMask(),
					...newmask,
					user,
				});
				id = res.id;
				console.log(res);
			} catch (error) {
				console.error(error);
			}
			if (!id) {
				id = nanoid();
			}

			masks[id] = {
				...createEmptyMask(),
				...res,
				builtin: false,
			};

			set(() => ({ masks }));
			get().markUpdate();
			return masks[id];
		},
		add(mask: Mask) {
			const existingMasks = get().masks;
			const newMask = { ...mask };

			// 如果传入的 mask 包含 id，则更新对应的 mask；
			// 否则，生成一个新的 id 并添加到 masks 对象中。
			if (newMask.id) {
				existingMasks[newMask.id] = newMask;
			} else {
				const id = nanoid(); // 生成一个新的唯一标识符
				newMask.id = id;
				newMask.builtin = false; // 假设添加的 mask 不是内置的
				existingMasks[id] = newMask;
			}

			set(() => ({ masks: existingMasks }));
			return existingMasks[newMask.id];
		},
		updateMask(id: string, updater: (mask: Mask) => void) {
			const masks = get().masks;
			const mask = masks[id];
			if (!mask) return;

			const updateMask = { ...mask };

			updater(updateMask);
			masks[id] = updateMask;

			set(() => ({ masks }));
			get().markUpdate();
		},
		async saveMask(id: string) {
			const masks = get().masks;
			const mask = masks[id];
			if (!mask) return;
			try {
				const res = await updatePrompt(id, mask);
			} catch (error) {
				console.error(error);
			}
		},

		async delete(id: string) {
			const masks = get().masks;
			await deletePrompt(id);
			delete masks[id];
			set(() => ({ masks }));
			get().markUpdate();
		},

		get(id?: string) {
			return get().masks[id ?? 1145141919810];
		},
		getAll() {
			const allMasks = Object.values(get().masks).sort((a, b) => {
				return b.createdAt - a.createdAt;
			});
			return allMasks;
		},
		filter: (
			filterOptions: {
				lang?: string;
				builtin?: boolean;
				tags?: string[];
				type?: string;
				searchTerm?: string;
			},
			prevmasks?: Mask[],
		) => {
			const maskslist = prevmasks ?? Object.values(get().masks);
			let filteredMasks = maskslist;
			console.log(filterOptions);

			// 根据语言过滤
			if (filterOptions.lang) {
				filteredMasks = filteredMasks.filter(
					(mask) => mask.lang === filterOptions.lang,
				);
			}

			// 根据是否内置过滤
			if (filterOptions.builtin == false) {
				filteredMasks = filteredMasks.filter(
					(mask) => mask.builtin === filterOptions.builtin,
				);
			}

			if (
				filterOptions.tags !== undefined &&
				!filterOptions.tags.includes("全部") &&
				!filterOptions.tags.includes("default")
			) {
				filteredMasks = filteredMasks.filter(
					(mask) => filterOptions.tags?.includes(mask.category),
				);
			}

			if (filterOptions.type) {
				filteredMasks = filteredMasks.filter(
					(mask) => mask.prompt_type === filterOptions.type,
				);
			}

			if (filterOptions.searchTerm) {
				filteredMasks = filteredMasks.filter(
					(mask) =>
						mask.name.includes(filterOptions.searchTerm) ||
						mask.description?.includes(filterOptions.searchTerm) ||
						mask.tags?.includes(filterOptions.searchTerm),
				);
			}

			// ...可以添加更多的过滤条件

			// 使用 updateMasks 函数来更新状态
			console.log("filteredMasks", filteredMasks);
			return filteredMasks;
		},
		sort: (sortMethods: string, prevmasks?: Mask[]) => {
			let masks = prevmasks ?? Object.values(get().masks);
			console.log("sort masks", prevmasks);
			masks.sort((a, b) => {
				switch (sortMethods) {
					case "hotness":
						return sortMasksByHotness(a, b);
					case "createdAt":
						return b.createdAt - a.createdAt;
					case "updatedAt":
						return b.updatedAt - a.updatedAt;
					// ...其他排序方法
					default:
						return 0;
				}
			});
			console.log("sorted masks", masks);
			return masks;
		},
	}),
	{
		name: StoreKey.Mask,
		version: 3.1,

		migrate(state, version) {
			const newState = JSON.parse(JSON.stringify(state)) as MaskState;

			// migrate mask id to nanoid
			if (version < 3) {
				Object.values(newState.masks).forEach((m) => (m.id = nanoid()));
			}

			if (version < 3.1) {
				const updatedMasks: Record<string, Mask> = {};
				Object.values(newState.masks).forEach((m) => {
					updatedMasks[m.id] = m;
				});
				newState.masks = updatedMasks;
			}

			return newState as any;
		},
	},
);

function sortMasksByHotness(a: Mask, b: Mask): number {
	const hotnessA = isNaN(Number(a.hotness)) ? 0 : Number(a.hotness);
	const hotnessB = isNaN(Number(b.hotness)) ? 0 : Number(b.hotness);
	return hotnessB - hotnessA;
}
