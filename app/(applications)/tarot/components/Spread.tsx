// components/Spread.tsx
import React from "react";
import { TarotSpread } from "../libs/TarotSpread";
import { Card } from "./Card";
import { TAROT_BACK_IMAGE } from "../constants/tarotCards";
import styles from "../styles/Spread.module.scss";
import { useTarotStore } from "../store/tarot";
import { TarotCardType } from "../types/TarotCard";
import { TarotPosition } from "../types/TarotPosition";
const Spread: React.FC = () => {
	const TarotStore = useTarotStore();

	const { currentSpread, interpretCard, interpretSpread, interpretation } =
		TarotStore;

	if (!currentSpread) {
		return null;
	}
	const handleCardClick = async (position: TarotPosition) => {
		try {
			const cardInterpretation = await interpretCard(position);
			console.log("卡片解读:", cardInterpretation);
		} catch (error) {
			console.error("解读卡片时出错:", error);
		}
	};
	return (
		<div className={styles.tarotSpread}>
			<h2>{currentSpread.name}</h2>
			<div className={styles.tarotSpreadPositions}>
				{currentSpread.positions.map((position, index) => (
					<div
						key={index}
						className={styles.tarotSpreadPosition}
						style={{
							left: `${position.coordinates.x}px`,
							top: `${position.coordinates.y}px`,
						}}
					>
						{position.card && (
							<Card
								card={position.card}
								onClick={() => handleCardClick(position)}
							/>
						)}
					</div>
				))}
			</div>
			<button onClick={interpretSpread}>Interpret</button>

			{interpretation && (
				<div className={styles.interpretation}>
					<h3>Interpretation</h3>
					<div>{interpretation}</div>
				</div>
			)}
		</div>
	);
};

export { Spread };
