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
import { Mask, Tags } from "../types/mask";
import { useMasks } from "../hooks/useMasks";
import { createPrompt, deletePrompt, updatePrompt } from "../masks/service";

export const DEFAULT_MASK_STATE = {
	masks: {} as Record<string, Mask>,
	tags: {} as Record<string, Tags>,
	total: 0,
};

export type MaskState = typeof DEFAULT_MASK_STATE;

export const DEFAULT_MASK_AVATAR = "gpt-bot";
export const createEmptyMask = () =>
	({
		id: nanoid(),
		avatar: DEFAULT_MASK_AVATAR,
		tags: ["通用"],
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
			console.log("create stage");
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
		updatestate(any: any) {
			set((state) => ({ ...state, ...any }));
		},
		add(mask: Mask) {
			const { masks } = get(); // 从 store 获取当前的 masks 对象
			let newMask; // 声明 newMask 变量以便后续使用

			// 如果传入的 mask 包含 id，则更新对应的 mask；
			// 否则，生成一个新的 id 并添加到 masks 对象中。
			if (mask.id) {
				// console.log("Updating existing mask with id:", mask.id); // 输出正在更新的 mask id
				newMask = { ...mask }; // 更新已有的 mask
				masks[mask.id] = newMask; // 更新 masks 对象中的对应 mask
			}

			set({ masks }); // 更新 store 中的 masks 对象

			return masks; // 返回更新后的 masks 对象
		},
		addTags(tags: Tags) {
			const { tags: currentTags } = get();

			let currentTagsCopy = { ...currentTags };

			if (tags.tag_id) {
				currentTagsCopy[tags.tag_id] = tags;
			}

			set({ tags: currentTagsCopy });
			return currentTagsCopy;
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
				tags?: string[];
				searchTerm?: string;
				author?: string;
			},
			prevmasks?: Mask[],
		) => {
			const maskslist = prevmasks ?? Object.values(get().masks);
			let filteredMasks = maskslist;
			console.log(filterOptions);

			// 将tags 中的空字符串剔除
			const tags = filterOptions.tags?.filter((tag) => tag.trim() !== "") || [];

			if (tags.length >= 1) {
				filteredMasks = filteredMasks.filter((mask) =>
					mask.tags?.some((tag: string) => filterOptions.tags?.includes(tag)),
				);
			}

			if (filterOptions.searchTerm) {
				filteredMasks = filteredMasks.filter(
					(mask) =>
						mask.name.includes(filterOptions.searchTerm!) ||
						mask.description?.includes(filterOptions.searchTerm!) ||
						mask.tags?.includes(filterOptions.searchTerm!),
				);
			}

			if (filterOptions.author) {
				filteredMasks = filteredMasks.filter(
					(mask) => mask.author === filterOptions.author,
				);
			}

			// ...可以添加更多的过滤条件

			// 使用 updateMasks 函数来更新状态
			console.log("filteredMasks", filteredMasks.length);
			return filteredMasks;
		},
		sort: (sortMethods: string, prevmasks?: Mask[]) => {
			let masks = prevmasks ?? Object.values(get().masks);
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
			// console.log("sorted masks", masks);
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
