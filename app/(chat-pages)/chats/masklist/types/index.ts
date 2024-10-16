import { Mask } from "@/app/types/mask";

export interface MaskListPageProps {
  onItemClick: (mask: Mask) => void;
  onDelete: (mask: Mask) => void;
}

// ... (其他需要的类型定义)
