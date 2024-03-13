// lib/TarotSpread.ts
import { TarotPosition } from "./TarotPosition";

export class TarotSpread {
	name: string; // 牌阵的名称
	positions: TarotPosition[]; // 牌阵中所有位置的数组
	cardCount: number; // 牌阵中的卡片数量
	labels: string[]; // 牌阵适应的场景标签
	constructor(
		positions: TarotPosition[],
		name: string,
		cardCount: number,
		labels: string[],
	) {
		this.positions = positions;
		this.name = name;
		this.cardCount = cardCount;
		this.labels = labels;
	}
	// 这里可以添加方法来解释牌阵或者处理牌阵的逻辑
}
