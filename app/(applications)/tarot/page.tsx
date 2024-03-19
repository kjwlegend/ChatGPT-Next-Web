// pages/index.tsx
"use client";
import React, { useState, useCallback } from "react";
import { TarotCardType } from "./types/TarotCard";
import { Deck } from "./components/Deck";
import { Spread } from "./components/Spread";

import { TAROT_SPREADS } from "./constants/tarotSpreads";
import { TarotSpread } from "./types/TarotSpread";
import { TarotGame } from "./libs/gameLogic";
import QuestionInputComponent from "./components/QuestionInput";
import { useTarotStore } from "./store/tarot";

import styles from "./styles/layout.module.scss";

const Index: React.FC = () => {
	const TarotStore = useTarotStore();
	const { game, resetGame, stage, remainingDraws } = TarotStore;
	const [cardsDealt, setCardsDealt] = useState<TarotCardType[]>([]);

	console.log("state", stage, remainingDraws, game);

	const reset = useCallback(() => {
		resetGame();
	}, []);

	// 定义 stage 变化时的回调函数
	const handleStageChange = useCallback((stage: string) => {
		console.log("Stage changed:", stage);
	}, []);

	return (
		<>
			<div className={styles.stars}></div>
			<div className={styles.stars2}></div>
			<div className={styles.stars3}></div>
			<div className={`${styles.tarotcontainer}`}>
				{<QuestionInputComponent />}
				{game.remainingDraws > 0 && <Deck />}
				<Spread />
			</div>
		</>
	);
};

export default Index;
