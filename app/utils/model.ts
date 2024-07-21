import { LLMModel } from "../client/api";

export function collectModelTable(
	models: readonly LLMModel[],
	customModels: string,
) {
	const modelTable: Record<string, boolean> = {};

	// default models
	models.forEach((provider) => {
		// 将provider 的 models 中availabe为true 的放入modelTable中
		provider.models
			.filter((model) => model.available)
			.forEach((model) => {
				modelTable[model.name] = true;
			});
	});

	// server custom models
	customModels
		.split(",")
		.filter((v) => !!v && v.length > 0)
		.map((m) => {
			if (m.startsWith("+")) {
				modelTable[m.slice(1)] = true;
			} else if (m.startsWith("-")) {
				modelTable[m.slice(1)] = false;
			} else modelTable[m] = true;
		});
	return modelTable;
}

/**
 * Generate full model table.
 */
export function collectModels(
	models: readonly LLMModel[],
	customModels: string,
) {
	const modelTable = collectModelTable(models, customModels);

	// 构建模型查找表
	const modelLookup = models.reduce(
		(acc, provider) => {
			provider.models.forEach((model) => {
				acc[model.name] = model;
			});
			return acc;
		},
		{} as Record<string, LLMModel["models"][0]>,
	);

	const allModels = Object.keys(modelTable).map((modelName) => {
		const model = modelLookup[modelName];
		return {
			name: modelName,
			available: modelTable[modelName],
			displayName: model?.displayName,
		};
	});

	// console.log("all available models", allModels);

	return allModels;
}
