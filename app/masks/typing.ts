import { ModelConfig } from "../store";
import { type Mask } from "../store/mask";

export type BuiltinMask = Omit<Mask, "id"> & {
	builtin: Boolean;
	modelConfig: Partial<ModelConfig>;
	[key: string]: any;
};
