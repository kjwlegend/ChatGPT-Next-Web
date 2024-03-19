// components/Deck.tsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import { TarotDeck } from "../libs/TarotDeck";
import { TarotCardType } from "../types/TarotCard";
import { Card, DeckCard } from "./Card";
import { TarotGame } from "../libs/gameLogic";
import { motion, AnimatePresence, Variants } from "framer-motion";
import styles from "../styles/Deck.module.scss";
import { useTarotStore } from "../store/tarot";

import { Stages } from "../store/tarot";

interface ShuffleAnimationComponentProps {
	onShuffleComplete?: () => void;
	cards: TarotCardType[];
}

const ShuffleAnimationComponent: React.FC<ShuffleAnimationComponentProps> = ({
	onShuffleComplete,
	cards,
}) => {
	const [isShuffling, setIsShuffling] = useState(false);

	const shuffleVariants: Variants = {
		start: (i: number) => ({
			x: [0, 90, -110, 120, -100, 35, -50, 5, 0, 0],
			y: [0, 5, -5, 5, -5, 0, 0],
			transition: {
				duration: 2,
				repeat: Infinity,
				repeatType: "loop", // 确保 repeatType 是 'loop' | 'reverse' | 'mirror' | undefined 中的一个
				ease: "linear",
				delay: i * 0.1, // Stagger the animation of each card
			},
		}),
		stop: {
			x: 0,
			y: 0,
			transition: {
				duration: 2,
				ease: "easeOut",
			},
		},
	};

	const startShuffle = () => {
		setIsShuffling(true);
		setTimeout(() => {
			setIsShuffling(false);
			if (onShuffleComplete) {
				onShuffleComplete();
			}
		}, 5000);
	};

	return (
		<div>
			<button onClick={startShuffle}>Shuffle Cards</button>
			<div className={styles.shuffleContainer}>
				<AnimatePresence>
					{cards.map((card, index) => (
						<motion.div
							key={card.id}
							custom={index}
							variants={shuffleVariants}
							animate={isShuffling ? "start" : "stop"}
							className={styles.shuffleCard}
						>
							{/* Render tarot card image here */}
							<DeckCard key={index} card={card} className={styles.tarotCard} />
						</motion.div>
					))}
				</AnimatePresence>
			</div>
		</div>
	);
};

const Deck: React.FC = () => {
	const TarotStore = useTarotStore();

	const { game, dealCards, currentSpread, remainingCards, setStage, stage } =
		TarotStore;
	const cardsRemaining = remainingCards;
	console.log("cardsRemaining", cardsRemaining);

	const totalDegrees = 120; // 卡片总共覆盖的角度，可以根据需要调整
	const angleStep = totalDegrees / (cardsRemaining.length - 1 || 1); // 每张卡片的旋转角度步长
	const cardWidth = 150; // 卡片宽度

	const deckRef = useRef<HTMLDivElement>(null);
	const [deckWidth, setDeckWidth] = useState(0);

	const [isShuffling, setIsShuffling] = useState(true);
	const [showText, setShowText] = useState(false);
	const [showDeck, setShowDeck] = useState(false);

	const handleShuffleComplete = () => {
		setIsShuffling(false);
		setShowText(true);
		setTimeout(() => {
			setShowDeck(true);
		}, 1000); // 2秒后显示tarotDeck，您可以根据需要调整这个时间
		setStage(Stages.Shuffle);
	};

	// 淡出动画变体
	const fadeOutVariants = {
		hidden: { opacity: 0, transition: { duration: 0.5 } },
		visible: { opacity: 1 },
	};

	// 渐入动画变体
	const fadeInVariants = {
		hidden: { opacity: 0 },
		visible: { opacity: 1, transition: { duration: 0.5, delay: 0.5 } },
	};

	useEffect(() => {
		let timerId: NodeJS.Timeout | null = null;
		if (showText && !showDeck) {
			timerId = setTimeout(() => {
				setShowDeck(true);
			}, 1000);
		}
		return () => {
			if (timerId) {
				clearTimeout(timerId);
			}
		};
	}, [showText, showDeck]);

	useEffect(() => {
		// 获取卡片堆的宽度
		const updateDeckWidth = () => {
			if (deckRef.current) {
				setDeckWidth(deckRef.current.offsetWidth);
			}
		};
		updateDeckWidth();
		window.addEventListener("resize", updateDeckWidth);
		return () => {
			window.removeEventListener("resize", updateDeckWidth);
		};
	}, [showDeck]);

	return (
		<>
			<AnimatePresence>
				{isShuffling && (
					<motion.div
						initial="visible"
						animate="visible"
						exit="hidden"
						variants={fadeOutVariants}
					>
						<ShuffleAnimationComponent
							cards={remainingCards}
							onShuffleComplete={handleShuffleComplete}
						/>
					</motion.div>
				)}
			</AnimatePresence>
			{showText && (
				<motion.div
					initial="hidden"
					animate="visible"
					variants={fadeInVariants}
				>
					<p>你已经完成洗牌，现在开始点击牌堆抽牌，每次只抽一张。</p>
				</motion.div>
			)}
			<AnimatePresence>
				{showDeck && (
					<motion.div
						initial="hidden"
						animate="visible"
						variants={fadeInVariants}
						className={styles.tarotDeck}
					>
						<div className={styles.tarotCards} ref={deckRef}>
							{cardsRemaining.map((card, index: number) => {
								const angle = -totalDegrees / 2 + angleStep * index;
								const spacing =
									(deckWidth - cardWidth) / (cardsRemaining.length - 1 || 1); // 计算卡片之间的间距
								const left = spacing * index - 50; // 根据间距动态计算left值
								const style = {
									"--rotate-angle": `${angle}deg`,
									// transform: `rotate(${angle}deg)  `, // 应用旋转角度
									left: `${left}px`,
									transition: "transform 0.5s",
								};
								return (
									<>
										<DeckCard
											key={index}
											card={card}
											style={style}
											className={styles.tarotCard}
											onClick={() => dealCards()}
										/>
									</>
								);
							})}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
};

export { Deck };
