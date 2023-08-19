import { Mask } from "../store/mask";
import { CN_MASKS } from "./cn";
import { EN_MASKS } from "./en";

import { type BuiltinMask } from "./typing";
export { type BuiltinMask } from "./typing";
import { getPromptHotness } from "../api/chat";

export const BUILTIN_MASK_ID = 100000;

export const BUILTIN_MASK_STORE = {
  buildinId: BUILTIN_MASK_ID,
  masks: {} as Record<string, BuiltinMask>,
  get(id?: string) {
    if (!id) return undefined;
    return this.masks[id] as Mask | undefined;
  },
  add(m: BuiltinMask) {
    const mask = { ...m, id: this.buildinId++, builtin: true };
    this.masks[mask.id] = mask;
    return mask;
  },
};

// 调用接口获取hotness数据
async function fetchHotnessData() {
  try {
    const response = await getPromptHotness();
    const hotnessData = response.data;
    hotnessData.forEach((item: any) => {
      const maskId = item.prompt.toString();
      const mask = BUILTIN_MASK_STORE.get(maskId);
      if (mask) {
        mask.hotness = item.hotness;
      }
    });
    // buildBuiltinMasks(); // 在获取hotness数据后构建BUILTIN_MASKS
  } catch (error) {
    console.error("Failed to fetch hotness data:", error);
  }
}

// async function buildBuiltinMasks() {
//   BUILTIN_MASKS.forEach((m) => BUILTIN_MASK_STORE.add(m));
// }

export const BUILTIN_MASKS: BuiltinMask[] = [...CN_MASKS, ...EN_MASKS].map(
  (m) => BUILTIN_MASK_STORE.add(m),
);

fetchHotnessData(); // 在最开始调用fetchHotnessData来获取hotness数据
