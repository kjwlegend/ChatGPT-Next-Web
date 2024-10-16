import { Mask } from "@/app/types/mask";

export const featureMaskGroup = (masks: Mask[]): Mask[] => {
  return masks.filter(
    (mask) => mask.featureMask === true && mask.type !== "roleplay"
  );
};

// ... (其他辅助函数)
