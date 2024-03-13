// components/Spread.tsx
import React from "react";
import { TarotSpread } from "../libs/TarotSpread";
import { Card } from "./Card";
import { TAROT_BACK_IMAGE } from "../constants/tarotCards";
import styles from "../styles/Spread.module.scss";

interface SpreadProps {
	spread: TarotSpread;
}

const Spread: React.FC<SpreadProps> = ({ spread }) => {
	return (
	  <div className={styles.tarotSpread}>
		<h2>{spread.name}</h2>
		<div className={styles.tarotSpreadPositions}>
		  {spread.positions.map((position, index) => (
			<div
			  key={index}
			  className={styles.tarotSpreadPosition}
			  style={{
				left: `${position.coordinates.x}%`,
				top: `${position.coordinates.y}%`,
			  }}
			>
			  {position.card && <Card card={position.card} />}
			</div>
		  ))}
		</div>
	  </div>
	);
  };
  
  export { Spread };