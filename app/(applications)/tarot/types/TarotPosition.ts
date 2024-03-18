// TarotPosition.ts
// TarotDeck.ts
import { TarotCardType } from "./TarotCard";

export type TarotPosition = {
	id: number; // 位置的唯一标识符
	name: string; // 位置的名称
	meaning: string; // 位置的解读意义
	coordinates: { x: number; y: number }; // 位置的坐标（用于在页面上显示）
	card?: TarotCardType | null;
};
