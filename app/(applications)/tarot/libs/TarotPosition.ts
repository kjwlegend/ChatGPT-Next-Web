import { TarotCard } from "./TarotCard";
import { TarotPosition as TarotPositionType } from "../types/TarotPosition";
// lib/TarotPosition.ts
export class TarotPosition implements TarotPositionType {
	id: number;
	name: string;
	meaning: string;
	coordinates: { x: number; y: number };
	card?: TarotCard;

	constructor(
		id: number,
		name: string,
		meaning: string,
		coordinates: { x: number; y: number },
		card?: TarotCard,
	) {
		this.id = id;
		this.name = name;
		this.meaning = meaning;
		this.coordinates = coordinates;
		this.card = card;
	}

	// 这里可以添加方法来解释牌阵位置或者处理牌阵位置的逻辑
}
