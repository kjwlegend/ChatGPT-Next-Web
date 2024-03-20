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
	let fullInterpretations = [];
	const handleCardClick = async (position: TarotPosition) => {
		try {
			const cardInterpretation = await interpretCard(position);
			console.log("卡片解读:", cardInterpretation);
		} catch (error) {
			console.error("解读卡片时出错:", error);
		}
	};

	const handleInterpretationClick = async () => {
		const spreadInterpretation = await interpretSpread();
	};

	return (
		<div className={styles.tarotSpread}>
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
							<>
								<Card
									card={position.card}
									onClick={() => handleCardClick(position)}
									positionMeaning={position.meaning}
									style={{
										"--var-width": "75px",
									}}
								/>
							</>
						)}
					</div>
				))}
			</div>

			{
				<div className={styles.interpretation}>
					<h3 className={styles.interpretationTitle}>解牌</h3>
					<button onClick={handleInterpretationClick}>全牌阵解读</button>

					<div className={styles.interpretationText}>{interpretation}</div>
				</div>
			}
		</div>
	);
};

export { Spread };
