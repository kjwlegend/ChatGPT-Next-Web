// lib/gameLogic.ts

import { TarotCard } from "./TarotCard";
import { TarotDeck } from "./TarotDeck";
import { TarotSpread } from "./TarotSpread";
import { TarotPosition } from "./TarotPosition";
import { TarotCardType } from "../types/TarotCard";

import { TAROT_SPREADS } from "../constants/tarotSpreads";

export class TarotGame {
	deck: TarotDeck;
	spreads: TarotSpread[];
	currentSpread: TarotSpread;
	remainingDraws: number;

	constructor() {
		this.deck = new TarotDeck();
		this.spreads = TAROT_SPREADS; // 假设 TAROT_SPREADS 已经是 TarotSpread 实例的数组
		this.currentSpread = this.spreads[0];
		this.deck.shuffle();
		this.remainingDraws = this.currentSpread.cardCount;
	}

	selectSpread(index: number): void {
		if (index < 0 || index >= this.spreads.length) {
			throw new Error("Invalid spread index");
		}
		this.currentSpread = this.spreads[index];
		this.remainingDraws = this.currentSpread.cardCount; // 更新剩余抽牌数
	}

	dealCards(count: number = 1): TarotCardType[] {
		const dealtCards: TarotCardType[] = [];
		for (let i = 0; i < count; i++) {
			if (this.deck.getRemainingCardCount() > 0 && this.remainingDraws > 0) {
				const card = this.deck.deal(1)[0];
				this.addCardToNextEmptyPosition(card); // 添加卡片到下一个空位置
				dealtCards.push(card);
				this.remainingDraws--;
			} else {
				break; // 如果没有足够的牌或达到牌阵限制，停止发牌
			}
		}
		return dealtCards;
	}

	addCardToNextEmptyPosition(card: TarotCardType): void {
		for (const position of this.currentSpread.positions) {
			if (!position.card) {
				position.card = card;
				break;
			}
		}
	}

	getRemainingCards(): TarotCardType[] {
		const dealtCards = new Set(
			this.currentSpread.positions.map((position) => position.card),
		);
		return this.deck.cards.filter((card) => !dealtCards.has(card));
	}

	resetSpread(): void {
		for (const position of this.currentSpread.positions) {
			position.card = undefined;
		}
		this.remainingDraws = this.currentSpread.cardCount; // 重置剩余抽牌数
	}

	interpretSpread(): string {
		// 这里可以添加逻辑来解释牌阵
		// 例如，根据每个位置的牌和其含义来生成解释
		return "Your tarot spread interpretation goes here...";
	}
}
