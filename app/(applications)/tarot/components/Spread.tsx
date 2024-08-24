// components/Spread.tsx
import React, { useState } from "react";
import { TarotSpread } from "../libs/TarotSpread";
import { Card } from "./Card";
import { TAROT_BACK_IMAGE } from "../constants/tarotCards";
import styles from "../styles/Spread.module.scss";
import { useTarotStore } from "../store/tarot";
import { TarotPosition } from "../libs/TarotPosition";
import { Collapse, Switch } from "antd";
import { CollapseProps } from "antd/lib/collapse";
import { LoadingIcon2 } from "@/app/icons";
import GetMoreDrawsModal from "./GetDraws";
import { useMobileScreen } from "@/app/hooks/useMobileScreen";

const Spread: React.FC = () => {
	const TarotStore = useTarotStore();
	const isMobileScreen = useMobileScreen();

	const {
		currentSpread,
		interpretCard,
		interpretSpread,
		interpretation,
		resetGame,
	} = TarotStore;

	const [fullInterpretations, setFullInterpretations] = useState({
		cards: [] as CollapseProps["items"],
		spreads: "" as string | undefined,
	});

	const [isSingleInterpreting, setIsSingleInterpreting] = useState(false);
	const [isSpreadInterpreting, setIsSpreadInterpreting] = useState(false);

	const [interpretationType, setInterpretationType] = useState<
		"single" | "spread"
	>("single");

	const mobileSpaceReduce = 30;

	const [isOpen, setIsOpen] = useState(false);

	const toggleDrawer = () => {
		setIsOpen(!isOpen);
	};

	const resetHandler = () => {
		resetGame();
		// reload
		window.location.reload();
	};

	const handleInterpretationSwitch = (checked: boolean) => {
		setInterpretationType(checked ? "spread" : "single");
	};
	const [isGetMoreDrawsVisible, setIsGetMoreDrawsVisible] = useState(false);

	const handleOpenGetMoreDraws = () => {
		setIsGetMoreDrawsVisible(true);
	};

	const handleCloseGetMoreDraws = () => {
		setIsGetMoreDrawsVisible(false);
	};

	const handleCardClick = async (position: TarotPosition, index: number) => {
		try {
			setIsSingleInterpreting(true);
			const cardInterpretation = await interpretCard(position);
			console.log("卡片解读:", cardInterpretation);
			// push interpretation to fullInterpretations.cards

			const cardData = {
				key: index.toString(),
				label: `${position.card?.name} + ${
					position.card?.isReversed ? "逆位" : "正位"
				}`,
				children: (
					<p className={styles.interpretationText}>{cardInterpretation}</p>
				),
			};
			// 使用函数式更新，以便于访问最新的状态
			setFullInterpretations((prevInterpretations) => ({
				...prevInterpretations,
				cards: [...(prevInterpretations.cards || []), cardData],
			}));
			setIsSingleInterpreting(false);
		} catch (error) {
			console.error("解读卡片时出错:", error);
		}
	};

	const handleInterpretationClick = async () => {
		// interpret spread
		setIsSpreadInterpreting(true);
		const spreadInterpretation = await interpretSpread();

		setFullInterpretations((prevInterpretations) => ({
			...prevInterpretations,
			spreads: spreadInterpretation,
		}));

		setIsSpreadInterpreting(false);
	};

	if (!currentSpread) {
		return null;
	}

	return (
		<>
			<div className={styles.spreadHeader}>
				请依次点击每张卡, 来获取单卡解读, 或者直接点击
				<button
					className={styles.tarotButtonPrimary}
					onClick={handleInterpretationClick}
				>
					全牌阵解读
				</button>
				{isMobileScreen && (
					<button onClick={toggleDrawer} className={styles.tarotButtonPrimary}>
						{isOpen ? "关闭" : "开启"}解读
					</button>
				)}
			</div>

			<div className={styles.tarotSpreadContainer}>
				<div className={styles.tarotSpreadPositions}>
					{currentSpread.positions.map((position, index) => (
						<div
							key={index}
							className={styles.tarotSpreadPosition}
							style={{
								left: `${position.coordinates.x - mobileSpaceReduce}px`,
								top: `${position.coordinates.y}px`,
							}}
						>
							{position.card && (
								<>
									<Card
										card={position.card}
										onClick={() => handleCardClick(position, index)}
										positionMeaning={position.meaning}
										style={{
											"--var-width": "80px",
										}}
									/>
								</>
							)}
						</div>
					))}
				</div>

				<div
					className={`${styles.interpretation} ${
						isOpen ? styles.drawer + " " + styles.open : styles.close
					}`}
				>
					<div className={styles.interpretationHeader}>
						<p className={styles.interpretationTitle}>解牌</p>

						<p>
							<span className={styles.interpretationSwitchText}>单牌</span>
							<Switch
								// defaultChecked
								className={styles.interpretationSwitch}
								size="small"
								onChange={handleInterpretationSwitch}
							/>
							<span className={styles.interpretationSwitchText}>牌阵</span>
						</p>
					</div>
					<div className={styles.interpretationText}>
						{interpretationType === "single" && (
							<>
								<Collapse
									items={fullInterpretations.cards}
									ghost={false}
									className={styles.interpretationCollapse}
								/>
								{isSingleInterpreting && (
									<div style={{ textAlign: "center", margin: "5px" }}>
										<p>
											单牌解读正在生成, 为了给您更完整的解答, 大约需要30秒,
											请耐心等待
										</p>
										<LoadingIcon2 />
									</div>
								)}
							</>
						)}
						{interpretationType === "spread" &&
							(!fullInterpretations.spreads ? (
								<div>
									<p>
										您还没有生成全牌阵解读, 请点击下方按钮获取,
										全牌阵解读耗费时间较长, 请勿重复点击或离开页面
									</p>
									<button
										className={styles.tarotButtonPrimary}
										onClick={handleInterpretationClick}
									>
										全牌阵解读
									</button>

									{isSpreadInterpreting && (
										<div style={{ textAlign: "center", margin: "5px" }}>
											<p>
												牌阵解读正在生成, 为了给您更完整的解答, 大约需要30秒,
												请耐心等待
											</p>
											<LoadingIcon2 />
										</div>
									)}
								</div>
							) : (
								<p>{fullInterpretations.spreads}</p>
							))}
					</div>
				</div>
			</div>
			<div className="flex-container">
				<button className={styles.tarotButtonPrimary} onClick={resetHandler}>
					重新开始
				</button>
				<button
					className={`${styles.tarotButtonPrimary} `}
					onClick={() => handleOpenGetMoreDraws()}
				>
					获取占卜次数
				</button>
				<GetMoreDrawsModal
					visible={isGetMoreDrawsVisible}
					onClose={handleCloseGetMoreDraws}
					onConfirm={handleCloseGetMoreDraws}
				/>
			</div>
		</>
	);
};

//  牌阵测试:
interface TestSpreadProps {
	spread: TarotSpread | null;
}

const TestSpread: React.FC<TestSpreadProps> = ({ spread }) => {
	let currentSpread = spread;

	const [isOpen, setIsOpen] = useState(false);

	const toggleDrawer = () => {
		setIsOpen(!isOpen);
	};

	const defaultcard = {
		id: "0",
		name: "The Fool",
		chineseName: "愚者",
		front: "fool.jpg",
		meaningPositive: "新的开始，无限可能",
		meaningReversed: "不成熟，冒险",
		flipped: false,
		isReversed: false,
		flip: () => {},
	};

	if (!currentSpread) {
		return null;
	}
	return (
		<>
			<div className={styles.tarotSpreadContainer}>
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
							<>
								<Card
									card={defaultcard}
									positionMeaning={position.meaning}
									style={{
										"--var-width": "80px",
									}}
								/>
							</>
						</div>
					))}
				</div>

				{
					<div
						className={`${styles.interpretation} ${styles.drawer} ${styles.open}`}
					>
						<div className={styles.interpretationHeader}>
							<p className={styles.interpretationTitle}>{currentSpread.name}</p>
							<p>
								<span className={styles.interpretationSwitchText}>单牌</span>
								<Switch
									// defaultChecked
									className={styles.interpretationSwitch}
									size="small"
								/>
								<span className={styles.interpretationSwitchText}>牌阵</span>
							</p>
						</div>
						<div className={styles.interpretationText}>abcdefg</div>
					</div>
				}
			</div>
		</>
	);
};

export { Spread, TestSpread };
