"use client";
import React, { useState, useEffect } from "react";
import styles from "../products.module.scss";

interface CardData {
	description: string;
	value: string;
}

interface CardComponentProps {
	title: string;
	data: CardData[];
	price: string | React.ReactNode;
	isCurrentPackage: boolean;
	onUpgrade: () => void;
}

const CardComponent: React.FC<CardComponentProps> = ({
	title,
	data,
	price,
	isCurrentPackage,
	onUpgrade,
}) => {
	const cardId = `card-${title.toLowerCase().replace(/\s+/g, "-")}`;

	return (
		<div className={styles.card} id={cardId}>
			<div className={styles.cardHeader}>
				<h3>{title}</h3>
				<button
					className={
						isCurrentPackage ? styles.currentButton : styles.upgradeButton
					}
					onClick={onUpgrade}
				>
					{isCurrentPackage ? "当前" : "升级"}
				</button>
			</div>
			<p className={styles.price}>{price}</p>

			{data.map((item, index) => (
				<div key={`${cardId}-row-${index}`} className={styles.row}>
					<p className={styles.description}>{item.description}</p>
					<p className={styles.value}>{item.value}</p>
				</div>
			))}
		</div>
	);
};

export default CardComponent;
