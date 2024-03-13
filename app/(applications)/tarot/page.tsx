// pages/index.tsx
"use client";
import React, { useState, useCallback } from "react";
import { TarotDeck } from "./libs/TarotDeck";
import { TarotCardType } from "./types/TarotCard";
import { Card } from "./components/Card";
import { Deck } from "./components/Deck";
import { Spread } from "./components/Spread";

import { TAROT_SPREADS } from "./constants/tarotSpreads";
import { TarotSpread } from "./types/TarotSpread";
import { TarotGame } from "./libs/gameLogic";

const Index: React.FC = () => {
	const [game, setGame] = useState<TarotGame>(new TarotGame());
	const [cardsDealt, setCardsDealt] = useState<TarotCardType[]>([]);

	const shuffleDeck = useCallback(() => {
		const newGame = new TarotGame(); // 创建新游戏实例
		newGame.deck.shuffle(); // 洗牌
		setGame(newGame); // 更新游戏状态
	}, []);
	const drawCards = useCallback(
		(count: number) => {
			const newCards = game.dealCards(count);
			setCardsDealt((prevCardsDealt) => [...prevCardsDealt, ...newCards]);
			setGame((prevGame) => {
				// 这里可以添加逻辑来更新 prevGame 的状态
				// 确保返回的对象是 TarotGame 类型
				const updatedGame = {
					...prevGame,
					remainingDraws: prevGame.remainingDraws - count,
				};
				return Object.assign(new TarotGame(), updatedGame);
			});
		},
		[setCardsDealt, setGame],
	);

	return (
		<div className="tarot-game">
			<button onClick={shuffleDeck}>Shuffle Deck</button>
            
			{game.remainingDraws > 0 && (
				<Deck
					cardsRemaining={game.getRemainingCards()} // 显示剩余的牌
					onDrawCards={drawCards} // 抽牌函数
				/>
			)}
			<Spread spread={game.currentSpread} />
		</div>
	);
};

export default Index;
