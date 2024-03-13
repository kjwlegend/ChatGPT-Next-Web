// components/Card.tsx
import React, { useState } from "react";
import { TarotCardType } from "../types/TarotCard";
import { TAROT_BACK_IMAGE } from "../constants/tarotCards";

import styles from "../styles/Card.module.scss";

interface CardProps {
	card: TarotCardType;
}

const Card: React.FC<CardProps> = ({ card }) => {
	const [flipped, setFlipped] = useState<boolean>(true); // 默认为背面状态

	const handleFlip = () => {
		if (flipped) {
			setFlipped(false); // 从背面翻到正面
		}
		// 正面状态下不允许再次翻转
	};

	return (
		<div className={styles["tarot-card"]}>
			<div
				className={`${styles["tarot-card-face"]} ${
					flipped ? "" : styles.flipped
				}`}
				onClick={handleFlip}
			>
				<img
					src={flipped ? TAROT_BACK_IMAGE : card.front}
					alt={card.name}
					className={card.isReversed ? styles.reversed : ""}
				/>
			</div>
			<div className={styles["tarot-card-content"]}>
				<div className={styles["tarot-card-name"]}>{card.name}</div>
				<div className={styles["tarot-card-chinese-name"]}>
					{card.chineseName}
				</div>
				<div className={styles["tarot-card-meaning"]}>
					{card.isReversed ? card.meaningReversed : card.meaningPositive}
					<span className={styles["tarot-card-orientation"]}>
						{card.isReversed ? "reversed" : "upright"}
					</span>
				</div>
				{flipped && (
					<button
						onClick={handleFlip}
						className={styles["tarot-card-flip-button"]}
					>
						Flip
					</button>
				)}
			</div>
		</div>
	);
};

export { Card };
