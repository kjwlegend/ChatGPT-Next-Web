import { MaskState } from "./types";
import { Mask } from "../../types/mask";

export const selectMasks = (state: MaskState) => state.masks;

export const selectMaskById = (state: MaskState, id: string) => state.masks[id];

export const selectAllMasks = (state: MaskState) =>
	Object.values(state.masks).sort((a, b) => b.createdAt - a.createdAt);

export const selectFilteredMasks = (
	state: MaskState,
	filterOptions: {
		tags?: string[];
		searchTerm?: string;
		author?: string;
	},
) => {
	let filteredMasks = Object.values(state.masks);

	const tags = filterOptions.tags?.filter((tag) => tag.trim() !== "") || [];

	if (tags.length >= 1) {
		filteredMasks = filteredMasks.filter((mask) =>
			mask.tags?.some((tag: string) => tags.includes(tag)),
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

	return filteredMasks;
};

export const selectSortedMasks = (
	state: MaskState,
	sortMethod: string,
	masks?: Mask[],
) => {
	const masksToSort = masks || Object.values(state.masks);
	return masksToSort.sort((a, b) => {
		switch (sortMethod) {
			case "hotness":
				return sortMasksByHotness(a, b);
			case "createdAt":
				return b.createdAt - a.createdAt;
			case "updatedAt":
				return b.updatedAt - a.updatedAt;
			default:
				return 0;
		}
	});
};

function sortMasksByHotness(a: Mask, b: Mask): number {
	const hotnessA = isNaN(Number(a.hotness)) ? 0 : Number(a.hotness);
	const hotnessB = isNaN(Number(b.hotness)) ? 0 : Number(b.hotness);
	return hotnessB - hotnessA;
}
