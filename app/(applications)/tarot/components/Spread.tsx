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
	let fullInterpretations = {
		cards: [] as string[],
		spreads: "" as string | undefined,
	};
	const handleCardClick = async (position: TarotPosition) => {
		try {
			const cardInterpretation = await interpretCard(position);
			console.log("卡片解读:", cardInterpretation);
			// push interpretation to fullInterpretations.cards
			fullInterpretations.cards.push(cardInterpretation);
		} catch (error) {
			console.error("解读卡片时出错:", error);
		}
	};

	const handleInterpretationClick = async () => {
		const spreadInterpretation = await interpretSpread();

		fullInterpretations.spreads = spreadInterpretation;
	};

	return (
		<>
			<div>
				请依次点击每张卡, 来获取单卡解读, 或者直接点击
				<button onClick={handleInterpretationClick}>全牌阵解读</button>
			</div>

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

						<div className={styles.interpretationText}>
							{fullInterpretations.cards.map((cardInterpretation, index) => (
								<p key={index}>{cardInterpretation}</p>
							))}
						</div>
					</div>
				}
			</div>
		</>
	);
};

export { Spread };
