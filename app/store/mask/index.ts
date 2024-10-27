import { createPersistStore } from "../../utils/store";
import { DEFAULT_MASK_STATE } from "./initialState";
import { MaskState, MaskStore, MaskSelectors } from "./types";
import { createMaskActions } from "./actions";
import * as selectorsModule from "./selectors";
import { StoreKey } from "../../constant";
import { nanoid } from "nanoid";
import { Mask } from "../../types/mask";

type Selectors = typeof selectorsModule;

export const useMaskStore = createPersistStore<MaskState, MaskStore>(
	DEFAULT_MASK_STATE,
	(set, get) => {
		const actions = createMaskActions(set, get);
		const selectors: MaskSelectors = Object.keys(selectorsModule).reduce(
			(acc, key) => {
				acc[key as keyof MaskSelectors] = (...args: any[]) =>
					(selectorsModule[key as keyof Selectors] as any)(get(), ...args);
				return acc;
			},
			{} as MaskSelectors,
		);

		return {
			...DEFAULT_MASK_STATE,
			...actions,
			...selectors,
		};
	},
	{
		name: StoreKey.Mask,
		version: 3.1,
		migrate: (persistedState: unknown, version: number) => {
			const newState = JSON.parse(JSON.stringify(persistedState)) as MaskState;

			if (version < 3) {
				Object.values(newState.masks).forEach((m) => {
					if (m) {
						m.id = nanoid();
					}
				});
			}

			if (version < 3.1) {
				const updatedMasks: Record<string, Mask> = {};
				Object.values(newState.masks).forEach((m) => {
					if (m && m.id) {
						updatedMasks[m.id] = m;
					}
				});
				newState.masks = updatedMasks;
			}

			const actions = createMaskActions(
				(state) => {
					Object.assign(newState, state);
				},
				() => newState,
			);

			const selectors: MaskSelectors = Object.keys(selectorsModule).reduce(
				(acc, key) => {
					acc[key as keyof MaskSelectors] = (...args: any[]) =>
						(selectorsModule[key as keyof Selectors] as any)(newState, ...args);
					return acc;
				},
				{} as MaskSelectors,
			);

			return {
				...newState,
				...actions,
				...selectors,
				lastUpdateTime: Date.now(),
				update: (updater: (state: MaskState) => void) => {
					updater(newState);
				},
			};
		},
	},
);

export * from "./types";
export { selectorsModule as selectors };
