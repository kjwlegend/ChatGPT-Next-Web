import { Lang } from "../locales";
import { ModelConfig } from "../store";
import { ChatMessage } from "./chat";

export interface roleSettingType {
	// 语气, 年龄, 血型, 星座, 性格,爱好,特征
	tone?: string;
	age?: string;
	bloodType?: string;
	zodiac?: string;
	personality?: string;
	hobby?: string;
	feature?: string;
}

export type Mask = {
	id: string;
	prompt_id?: number;
	name: string;
	category: string;
	author?: string;
	prompt_type?: string;
	topic?: string;
	avatar: string;
	featureMask?: boolean;
	zodiac?: string;
	img?: string;
	description?: string;
	intro?: string;
	hideContext?: boolean;
	version?: string;
	context: ChatMessage[];
	modelConfig: ModelConfig;
	lang: Lang;
	builtin: boolean;
	syncGlobalConfig?: boolean;
	usePlugins?: boolean;
	plugins?: string[];
	hotness?: number;
	updatedAt: number;
	createdAt: number;
	roleSetting?: roleSettingType;
	[key: string]: any;
};

export type BuiltinMask = Mask & {
	builtin: Boolean;
	modelConfig: Partial<ModelConfig>;
	[key: string]: any;
};

export type LightMask = Omit<Mask, "context" | "modelConfig" | "lang"> & {
	modelConfig: Partial<ModelConfig>;
	[key: string]: any;
};
