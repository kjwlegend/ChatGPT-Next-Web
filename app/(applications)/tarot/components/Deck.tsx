// components/Deck.tsx
import React, { useState, useCallback } from "react";
import { TarotDeck } from "../libs/TarotDeck";
import { TarotCardType } from "../types/TarotCard";
import { Card } from "./Card";
import { TarotGame } from "../libs/gameLogic";

import styles from "../styles/Deck.module.scss";

interface DeckProps {
	cardsRemaining: TarotCardType[];
	onDrawCards: (count: number) => void; // 新增抽牌函数
}

const Deck: React.FC<DeckProps> = ({ cardsRemaining, onDrawCards }) => {
	return (
		<div className={styles.tarotDeck}>
			<div className={styles.tarotCards}>
				{cardsRemaining.map((card, index) => (
					<Card key={index} card={card} />
				))}
			</div>
			<button onClick={() => onDrawCards(1)}>Draw 1 Card</button>
			<button onClick={() => onDrawCards(3)}>Draw 3 Cards</button>
		</div>
	);
};

export { Deck };
