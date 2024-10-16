import { Mask } from "@/app/types/mask";

export function featureMaskGroup(masks: Mask[]) {
  return masks.filter(
    (mask) => mask.featureMask === true && mask.type !== "roleplay",
  );
}
