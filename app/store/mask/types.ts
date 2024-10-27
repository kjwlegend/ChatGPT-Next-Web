import { Mask, Tags } from "../../types/mask";

export interface MaskState {
	masks: Record<string, Mask>;
	tags: Record<string, Tags>;
	total: number;
}

export interface FilterOptions {
	tags?: string[];
	searchTerm?: string;
	author?: string;
}

export interface MaskActions {
	create: (mask?: Partial<Mask>, user?: number) => Promise<Mask>;
	updateState: (state: Partial<MaskState>) => void;
	add: (mask: Mask) => Record<string, Mask>;
	updateMask: (id: string, updater: (mask: Mask) => void) => void;
	addTags: (tags: Tags) => Record<string, Tags>;
	saveMask: (id: string) => Promise<void>;
	delete: (id: string) => Promise<void>;
	markUpdate: () => void;
}

export interface MaskSelectors {
	selectMasks: () => Record<string, Mask>;
	selectMaskById: (id: string) => Mask | undefined;
	selectAllMasks: () => Mask[];
	selectFilteredMasks: (filterOptions: FilterOptions) => Mask[];
	selectSortedMasks: (sortMethod: string, masks?: Mask[]) => Mask[];
}

export type MaskStore = MaskState & MaskActions & MaskSelectors;
