// TarotSpread.ts
import { TarotPosition } from "./TarotPosition";

export type TarotSpread = {
	name: string; // 牌阵的名称
	positions: TarotPosition[]; // 牌阵中所有位置的数组
	cardCount: number;
	labels: string[];
};
