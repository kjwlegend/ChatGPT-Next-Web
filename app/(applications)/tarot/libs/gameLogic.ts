// lib/gameLogic.ts

import { TarotCard } from "./TarotCard";
import { TarotDeck } from "./TarotDeck";
import { TarotSpread } from "./TarotSpread";
import { TarotPosition } from "./TarotPosition";
import { TarotCardType } from "../types/TarotCard";

import { TAROT_SPREADS } from "../constants/tarotSpreads";
import {
	interpretTarotCard,
	interpretTarotSpread,
} from "../services/InterpretService";

export class TarotGame {
	deck: TarotDeck;
	spreads: TarotSpread[];
	currentSpread: TarotSpread;
	remainingDraws: number;

	constructor() {
		this.deck = new TarotDeck();
		this.spreads = TAROT_SPREADS; // 假设 TAROT_SPREADS 已经是 TarotSpread 实例的数组
		this.currentSpread = this.spreads[1];
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
				this.remainingDraws = 0;
				break; // 如果没有足够的牌或达到牌阵限制，停止发牌
			}
		}
		return dealtCards;
	}

	addCardToNextEmptyPosition(card: TarotCard): void {
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

	resetGame(): void {
		this.deck.reset(); // 重置牌组
		this.resetSpread(); // 重置牌阵
	}

	// 修改后的interpretCard方法
	async interpretCard(
		spreadName: string,
		position: TarotPosition,
		userQuestion: string,
		language: string,
	) {
		if (!position.card) {
			return "No card found in this position.";
		}
		// 使用LLM服务获取解释

		const interpretation = await interpretTarotCard(
			spreadName,
			position.meaning,
			position.card,
			userQuestion,
			language,
		);
		return (
			interpretation ||
			"No interpretation found for this card in the given context."
		);
	}
	// 修改后的interpretSpread方法
	async interpretSpread(
		tarotSpread: TarotSpread,
		userQuestion: string,
		language: string = "zh",
	) {
		if (!tarotSpread) {
			return "No spread found.";
		}
		// 调用interpretTarotSpread函数获取整个牌阵的解释
		const spreadInterpretation = await interpretTarotSpread(
			tarotSpread,
			userQuestion,
			language,
		);
		// console.log("class part", spreadInterpretation);
		return spreadInterpretation;
	}
}
