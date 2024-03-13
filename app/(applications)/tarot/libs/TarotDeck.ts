// lib/TarotDeck.ts
import { TarotCard } from "./TarotCard";

import { TAROT_CARDS } from "../constants/tarotCards";

export class TarotDeck {
	cards: TarotCard[];
	initialCards: TarotCard[]; // 用于保存初始牌组的副本

	constructor(
		cards: TarotCard[] = TAROT_CARDS.map(
			(cardData) =>
				new TarotCard(
					cardData.id,
					cardData.name,
					cardData.chineseName,
					cardData.front,
					cardData.meaningPositive,
					cardData.meaningReversed,
					cardData.flipped,
					cardData.isReversed,
				),
		),
	) {
		this.cards = [...cards]; // 创建牌组的一个副本，以保持原始数组不变
		this.initialCards = [...cards]; // 保存初始状态的副本，用于重置牌组
	}

	shuffle(): void {
		// Fisher-Yates shuffle algorithm
		for (let i = this.cards.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
		}
	}

	deal(count: number = 1): TarotCard[] {
		if (count > this.cards.length) {
			throw new Error("Not enough cards in the deck to deal");
		}
		const dealtCards = this.cards.splice(0, count);

		//  发牌前,随机设置每张卡牌的正逆位
		dealtCards.forEach((card) => {
			card.isReversed = Math.random() > 0.5;
		});

		return dealtCards;
	}

	reset(): void {
		// 重置牌组到初始状态
		this.cards = [...this.initialCards];
	}

	getRemainingCardCount(): number {
		// 获取剩余牌数
		return this.cards.length;
	}
}
