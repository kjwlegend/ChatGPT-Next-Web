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
import { TarotSpread } from "../types/TarotSpread";
import { random } from "nanoid";
import { useMobileScreen } from "@/app/hooks/useMobileScreen";
import { is } from "cheerio/lib/api/traversing";

interface ShuffleAnimationComponentProps {
	onShuffleComplete?: () => void;
	cards: TarotCardType[];
}

const ShuffleAnimationComponent: React.FC<ShuffleAnimationComponentProps> = ({
	onShuffleComplete,
	cards,
}) => {
	const [isShuffling, setIsShuffling] = useState(false);
	const TarotStore = useTarotStore();
	const [countdown, setCountdown] = useState(25);
	const { game, dealCards, currentSpread, remainingCards, setStage, stage } =
		TarotStore;
	const isMobileScreen = useMobileScreen();

	// 生成随机Y轴数组
	function generateRandomYArray(i: number) {
		// 创建一个长度为29的新数组

		return Array.from({ length: 18 }, (_, index) => {
			if (index === 0 || index === 17) {
				// 确保第一个和最后一个元素为0
				return 0;
			}

			// 使用 i 和 index 生成伪随机数，确保每个 i 的随机序列是相同的
			const seed = (i + 1) * (index + 1);
			const random = Math.sin(seed) * 10000 * Date.now();
			//  Y坐标范围是 -30 到 30
			const randomY = (random - Math.floor(random)) * 60 - 100;
			return randomY;
		});
	}

	// 生成随机X数组

	function generateRandomXArray(i: number) {
		// 创建一个长度为29的新数组
		return Array.from({ length: 18 }, (_, index) => {
			if (index === 0 || index === 17) {
				// 确保第一个和最后一个元素为0
				return 0;
			}

			// 使用 i 和 index 生成伪随机数，确保每个 i 的随机序列是相同的
			const seed = (i + 1) * (index + 1) * Date.now();
			const random = Math.sin(seed) * 10000;
			//  X坐标范围是 -150 到 150
			const randomX = (random - Math.floor(random)) * 300 - 150;
			return randomX;
		});
	}

	// 生成随机旋转数组

	function generateRotateArray(i: number) {
		// 创建一个长度为29的新数组，并填充随机旋转值
		return Array.from({ length: 14 }, (_, index) => {
			if (index === 0 || index === 13) {
				// 确保第一个和最后一个元素为0
				return 0;
			}

			// 使用 i 和 index 生成伪随机数，确保每个 i 的随机序列是相同的
			const seed = (i + 1) * (index + 1) * Date.now();
			const random = Math.sin(seed) * 10000;
			const randomRotate = (random - Math.floor(random)) * 360;
			return randomRotate;
		});
	}
	function generateRandomInt(min: number, max: number) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	const shuffleVariants: Variants = {
		start: (i: number) => ({
			x: generateRandomXArray(i),
			y: generateRandomYArray(i),
			rotate: generateRotateArray(i),
			zIndex: generateRandomInt(0, i),
			// zIndex: i % 2 == 1 ? i : i - 1,
			transition: {
				duration: 3,
				repeat: 3,
				repeatType: "reverse", // 确保 repeatType 是 'loop' | 'reverse' | 'mirror' | undefined 中的一个
				ease: "easeInOut",
				delay: i * 0.1, // Stagger the animation of each card
			},
		}),
		stop: (i: number) => ({
			x: 0,
			y: 0,
			zIndex: i,
			rotate: 0,
			transition: {
				duration: 2,
				ease: "easeOut",
			},
		}),
	};

	const fadeInVariants: Variants = {
		hidden: { opacity: 0 },
		visible: { opacity: 1, transition: { duration: 0.5, delay: 0.5 } },
	};

	const fadeOutVariants: Variants = {
		hidden: { opacity: 0, height: 0, transition: { duration: 0.5 } },
		visible: { opacity: 1 },
	};

	const countdownVariants: Variants = {
		// zoom in each number
		hidden: { scale: 0 },
		visible: { scale: 5, opacity: 0.3, transition: { duration: 1 } },
	};

	const cardWidth = isMobileScreen ? "70px" : "";

	const startShuffle = () => {
		setIsShuffling(true);
		setStage(Stages.Shuffling);

		setTimeout(() => {
			setIsShuffling(false);
			if (onShuffleComplete) {
				onShuffleComplete();
				setStage(Stages.Draw);
			}
		}, countdown * 1000); // 5秒后停止洗牌
	};

	useEffect(() => {
		let interval: NodeJS.Timeout;
		if (isShuffling && countdown > 0) {
			interval = setInterval(() => {
				setCountdown((prevCountdown) => prevCountdown - 1);
			}, 1000);
		} else if (countdown === 0) {
			setIsShuffling(false);
			if (onShuffleComplete) {
				onShuffleComplete();
				setStage(Stages.Draw);
			}
		}
		return () => clearInterval(interval);
	}, [isShuffling, countdown, onShuffleComplete, setStage]);

	return (
		<div className={styles.shuffleContainer}>
			<AnimatePresence>
				{
					<div className={styles.shuffleCountdown}>
						{!isShuffling && (
							<motion.button
								initial="visible"
								exit="hidden"
								variants={fadeOutVariants}
								onClick={startShuffle}
								className={styles.tarotButtonPrimary}
							>
								点击洗牌
							</motion.button>
						)}

						{isShuffling && (
							<>
								<motion.p
									initial="hidden"
									animate="visible"
									variants={fadeInVariants}
								>
									请耐心的等待洗牌结束,在洗牌期间默念着你的问题,你的专注度越高,
									答案就愈加准确.
								</motion.p>
								<motion.div
									key={countdown}
									initial="hidden"
									animate="visible"
									exit="hidden"
									variants={countdownVariants}
									className={styles.countdown}
								>
									{countdown}
								</motion.div>
							</>
						)}
					</div>
				}
			</AnimatePresence>

			<div className={styles.shuffleCardsContainer}>
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
							<DeckCard
								key={"shuffling" + index}
								card={card}
								classNameString={styles.tarotCard}
								style={{
									"--var-width": cardWidth,
								}}
							/>
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

	const isMobileScreen = useMobileScreen();
	const totalDegrees = 120; // 卡片总共覆盖的角度，可以根据需要调整
	const angleStep = totalDegrees / (cardsRemaining.length - 1 || 1); // 每张卡片的旋转角度步长

	const cardGap = 150; // 卡片宽度
	const cardWidth = isMobileScreen ? "65px" : "85px";

	const deckRef = useRef<HTMLDivElement>(null);
	const [deckWidth, setDeckWidth] = useState(0);

	const [isShuffling, setIsShuffling] = useState(true);
	const [showText, setShowText] = useState(false);
	const [showDeck, setShowDeck] = useState(false);

	const [spread, setSpread] = useState<TarotSpread | null>(currentSpread);

	useEffect(() => {
		setSpread(currentSpread);
		console.log("currentSpread", spread?.positions);
	}, [currentSpread, setSpread]);

	const handleShuffleComplete = () => {
		setIsShuffling(false);
		setShowText(true);
		setTimeout(() => {
			setShowDeck(true);
		}, 1000); // 2秒后显示tarotDeck，您可以根据需要调整这个时间
		setStage(Stages.Draw);
	};

	// 淡出动画变体
	const fadeOutVariants = {
		stop: { opacity: 0, height: 0, transition: { duration: 1 } },
		start: { opacity: 1 },
	};

	// 渐入动画变体
	const fadeInVariants = {
		start: { opacity: 0 },
		stop: { opacity: 1, transition: { duration: 1, delay: 0.5 } },
	};

	useEffect(() => {
		let timerId: NodeJS.Timeout | null = null;
		if (showText && !showDeck && stage != Stages.Interpretation) {
			timerId = setTimeout(() => {
				setShowDeck(true);
			}, 2000);
		}
		return () => {
			if (timerId) {
				clearTimeout(timerId);
			}
		};
	}, [showText, showDeck]);
	useEffect(() => {
		if (game.remainingDraws === 0) {
			setStage(Stages.Interpretation); // 直接设置stage为Interpretation
			// 不设置延时，因为我们将在动画完成后改变showDeck
			// console.log("game stage", stage);

			const timer = setTimeout(() => {
				setShowDeck(false);
			}, 2000);

			// 返回一个清理函数
			return () => {
				clearTimeout(timer); // 清理计时器
			};
		}
	}, [game.remainingDraws, setStage]);

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
				{(stage == Stages.Shuffle || stage == Stages.Shuffling) && (
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
			{showText && stage == Stages.Draw && (
				<motion.div
					initial="hidden"
					animate="visible"
					variants={fadeInVariants}
				>
					<p className={styles.drawCards}>
						你已经完成洗牌，现在开始点击牌堆抽牌，一共需要抽{" "}
						<span className={styles.totalCards}> {spread?.cardCount}</span>
						张牌, 还剩下
						<span className={styles.remainingCards}>{game.remainingDraws}</span>
						张未抽
					</p>
				</motion.div>
			)}
			<AnimatePresence>
				{showDeck && (
					<motion.div
						key={stage}
						initial="start"
						animate="stop"
						variants={
							stage === Stages.Interpretation ? fadeOutVariants : fadeInVariants
						}
						className={styles.tarotDeck}
					>
						<div className={styles.tarotCards} ref={deckRef}>
							{cardsRemaining.map((card, index: number) => {
								const angle = -totalDegrees / 2 + angleStep * index;
								const spacing =
									(deckWidth - cardGap) / (cardsRemaining.length - 1 || 1); // 计算卡片之间的间距
								const left = spacing * index - 50; // 根据间距动态计算left值
								const style = {
									"--rotate-angle": `${angle}deg`,
									// transform: `rotate(${angle}deg)  `, // 应用旋转角度
									left: `${left}px`,
									transition: "transform 0.5s",
									"--var-width": cardWidth,
								};
								return (
									<DeckCard
										key={"draw" + index}
										card={card}
										style={style}
										classNameString={styles.tarotCard}
										onClick={() => dealCards()}
										index={index}
									/>
								);
							})}
						</div>
						<h2>{currentSpread?.name}</h2>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
};

export { Deck };
