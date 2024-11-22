import { getLang, Lang } from "../../locales";
import { ModelConfig, useAppConfig } from "../config";
import { nanoid } from "nanoid";

import { Mask, Tags } from "../../types/mask";

export const DEFAULT_MASK_AVATAR = "gpt-bot";

export const createEmptyMask = () =>
	({
		id: "1",
		avatar: DEFAULT_MASK_AVATAR,
		tags: ["通用"],
		author: "",
		topic: "",
		name: "未命名自定义助手",
		prompt_type: "assistant",
		intro: "欢迎使用自定义助手",
		description: "",
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
