import { ModelConfig } from "../store";
import { type Mask } from "../store/mask";

export type BuiltinMask = Mask & {
	builtin: Boolean;
	modelConfig: Partial<ModelConfig>;
	[key: string]: any;
};
