// TarotDeck.ts
import { TarotCardType } from "./TarotCard";

export type TarotDeck = {
	cards: TarotCardType[]; // 包含所有塔罗牌的数组
	shuffle(): void; // 洗牌方法
	deal(): TarotCardType | null; // 发牌方法，返回一张卡牌或null（如果牌堆为空）
};
