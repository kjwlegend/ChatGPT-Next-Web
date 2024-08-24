import { LLMModel } from "../client/api";
import { isMacOS } from "../utils";
import { getClientConfig } from "../config/client";
import { DEFAULT_MODELS, DEFAULT_SIDEBAR_WIDTH, StoreKey } from "../constant";

import { DEFAULT_INPUT_TEMPLATE } from "../chains/base";
import { createPersistStore } from "../utils/store";

export type ModelType =
	(typeof DEFAULT_MODELS)[number]["models"][number]["name"];

export enum SubmitKey {
	Enter = "Enter",
	CtrlEnter = "Ctrl + Enter",
	ShiftEnter = "Shift + Enter",
	AltEnter = "Alt + Enter",
	MetaEnter = "Meta + Enter",
}

export enum Theme {
	Auto = "auto",
	Dark = "dark",
	Light = "light",
}

export const DEFAULT_CONFIG = {
	lastUpdateTime: Date.now(), // timestamp, to merge state
	submitKey: isMacOS() ? SubmitKey.MetaEnter : SubmitKey.CtrlEnter,
	avatar: "1f603",
	fontSize: 14,
	theme: Theme.Light as Theme,
	tightBorder: !!getClientConfig()?.isApp,
	showHeader: true,
	sendPreviewBubble: true,
	enableAutoGenerateTitle: true,
	sidebarWidth: DEFAULT_SIDEBAR_WIDTH,
	// comment
	disablePromptHint: false,
	dontShowMaskSplashScreen: false, // dont show splash screen when create chat
	hideBuiltinMasks: false, // dont add builtin masks

	customModels: "",
	models: DEFAULT_MODELS as any as LLMModel[],

	modelConfig: {
		model: "gpt-4o-mini" as ModelType,
		temperature: 0.5,
		top_p: 1,
		max_tokens: 3000,
		presence_penalty: 0.2,
		frequency_penalty: 0.3,
		sendMemory: true,
		historyMessageCount: 5,
		compressMessageLengthThreshold: 3000,
		template: DEFAULT_INPUT_TEMPLATE,
		enableInjectSystemPrompts: true,
		enableUserInfos: true,
		enableRelatedQuestions: false,
	},

	pluginConfig: {
		enable: true,
		maxIterations: 10,
		returnIntermediateSteps: true,
	},
};

export type ChatConfig = typeof DEFAULT_CONFIG;

export type ChatConfigStore = ChatConfig & {
	reset: () => void;
	update: (updater: (config: ChatConfig) => void) => void;
	mergeModels: (newModels: LLMModel[]) => void;
	allModels: () => LLMModel[];
	showHeader: boolean;
};

export type ModelConfig = ChatConfig["modelConfig"];
export type PluginConfig = ChatConfig["pluginConfig"];

export function limitNumber(
	x: number,
	min: number,
	max: number,
	defaultValue: number,
) {
	if (isNaN(x)) {
		return defaultValue;
	}

	return Math.min(max, Math.max(min, x));
}

export const ModalConfigValidator = {
	model(x: string) {
		return x as ModelType;
	},
	max_tokens(x: number) {
		return limitNumber(x, 0, 100000, 2000);
	},
	presence_penalty(x: number) {
		return limitNumber(x, -2, 2, 0);
	},
	frequency_penalty(x: number) {
		return limitNumber(x, -2, 2, 0);
	},
	temperature(x: number) {
		return limitNumber(x, 0, 1, 1);
	},
	top_p(x: number) {
		return limitNumber(x, 0, 1, 1);
	},
};

export const useAppConfig = createPersistStore(
	{ ...DEFAULT_CONFIG },
	(set, get) => ({
		reset() {
			set(() => ({ ...DEFAULT_CONFIG }));
		},

		mergeModels(newModels: LLMModel[]) {
			if (!newModels || newModels.length === 0) {
				return;
			}

			// Ensure all new models are marked as available
			for (const providerModel of newModels) {
				for (const model of providerModel.models) {
					model.available = true;
				}
			}

			// Directly set new models
			set(() => ({
				models: newModels,
			}));
		},


	}),
	{
		name: StoreKey.Config,
		version: 3.8,
		migrate(persistedState, version) {
			const state = persistedState as ChatConfig;

			if (version < 3.4) {
				state.modelConfig.sendMemory = true;
				state.modelConfig.historyMessageCount = 5;
				state.modelConfig.compressMessageLengthThreshold = 3000;
				state.modelConfig.frequency_penalty = 0;
				state.modelConfig.top_p = 1;
				state.modelConfig.template = DEFAULT_INPUT_TEMPLATE;
				state.dontShowMaskSplashScreen = false;
				state.hideBuiltinMasks = false;
			}

			if (version < 3.5) {
				state.customModels = "claude,claude-100k";
			}

			if (version < 3.6) {
				state.modelConfig.enableInjectSystemPrompts = true;
			}

			if (version < 3.7) {
				state.enableAutoGenerateTitle = true;
			}

			if (version < 3.8) {
				state.lastUpdateTime = Date.now();
			}

			return state as any;
		},
	},
);
