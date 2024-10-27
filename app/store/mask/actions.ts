import { nanoid } from "nanoid";
import { Mask, Tags } from "../../types/mask";
import { createEmptyMask } from "./utils";
import { createPrompt, deletePrompt, updatePrompt } from "../../masks/service";
import { MaskActions, MaskState, FilterOptions } from "./types";

export const createMaskActions = (
	set: (
		partial: Partial<MaskState> | ((state: MaskState) => Partial<MaskState>),
	) => void,
	get: () => MaskState,
): MaskActions => ({
	create: async (mask?: Partial<Mask>, user = 2) => {
		const masks = get().masks;
		let id: string;
		let res: Partial<Mask> | undefined;
		const newMask: Partial<Mask> = { ...mask, id: undefined, prompt_id: 0 };
		try {
			res = await createPrompt({
				...createEmptyMask(),
				...newMask,
				user,
			});
			id = res?.id ?? nanoid();
		} catch (error) {
			console.error(error);
			id = nanoid();
		}

		const createdMask: Mask = {
			...createEmptyMask(),
			...res,
			builtin: false,
			id,
		};

		masks[id] = createdMask;
		set({ masks });
		return createdMask;
	},

	updateState: (state: Partial<MaskState>) => set(state),

	add: (mask: Mask) => {
		const { masks } = get();
		masks[mask.id] = { ...mask };
		set({ masks });
		return masks;
	},

	updateMask: (id: string, updater: (mask: Mask) => void) => {
		const masks = get().masks;
		const mask = masks[id];
		if (!mask) return;

		const updatedMask = { ...mask };
		updater(updatedMask);
		masks[id] = updatedMask;

		set({ masks });
	},

	addTags: (tags: Tags) => {
		const { tags: currentTags } = get();
		const updatedTags = { ...currentTags };
		if (tags.tag_id) {
			updatedTags[tags.tag_id] = tags;
		}
		set({ tags: updatedTags });
		return updatedTags;
	},

	saveMask: async (id: string) => {
		const masks = get().masks;
		const mask = masks[id];
		if (!mask) return;
		try {
			await updatePrompt(id, mask);
		} catch (error) {
			console.error(error);
		}
	},

	delete: async (id: string) => {
		const masks = get().masks;
		await deletePrompt(id);
		delete masks[id];
		set({ masks });
	},

	markUpdate: () => {
		set((state) => ({ ...state, total: state.total + 1 }));
	},
});
