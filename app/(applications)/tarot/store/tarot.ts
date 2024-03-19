// 文件路径: src/stores/gameStore.js
import { create } from "zustand";
import { TarotGame } from "../libs/gameLogic";
import { TarotSpread } from "../libs/TarotSpread";
import { TarotCardType } from "../types/TarotCard";
import { TarotPosition } from "../types/TarotPosition";

// 这是questions对象的类型声明
interface QuestionsState {
	question: string;
	questionType: string;
	complexity: string;
	language: string; // 确保包括此属性
	response: string;
	spreadUsage: string;
}

export enum Stages {
	UserInput,
	Question,
	Shuffle,
	Draw,
	Interpretation,
	Restart,
}

export type TarotState = {
	game: TarotGame;
	stage: Stages;
	spreadIndex: number;
	cards: any[];
	interpretation: string | null;
	remainingDraws: number | null;
	currentSpread: TarotSpread | null;
	remainingCards: any[];
	questions: QuestionsState;
	getRemainingCards: () => void;
	selectSpread: (index: number) => void;
	shuffle: () => void;
	dealCards: () => void;
	resetSpread: () => void;
	resetGame: () => void;
	interpretCard: (position: TarotPosition) => Promise<string>;
	interpretSpread: () => void;
	setStage: (stage: Stages) => void;
	setQuestions: (questions: object) => void;
};
export const useTarotStore = create<TarotState>((set, get) => ({
	game: new TarotGame(),
	spreadIndex: 0, // 用于存储当前选择的牌阵索引
	cards: [], // 用于存储抽到的牌
	interpretation: null, // 用于存储牌阵解释
	stage: Stages.UserInput, // 游戏阶段，'question', 'shuffle', 'draw', 'interpretation', 'restart'
	// 获取当前游戏状态
	remainingDraws: null,
	remainingCards: [],
	currentSpread: null,
	questions: {
		question: "",
		questionType: "",
		complexity: "",
		language: "",
		response: "",
		spreadUsage: "",
	},
	setQuestions: (info) => {
		set((state) => ({
			questions: {
				...state.questions,
				...info,
			},
		}));
	},
	// 选择牌阵
	selectSpread: (index) => {
		set((state) => {
			state.game.selectSpread(index);
			return {
				game: state.game,
				spreadIndex: index,
				remainingDraws: state.game.remainingDraws,
				currentSpread: state.game.currentSpread,
				remainingCards: state.game.getRemainingCards(),
			};
		});
	},
	// 洗牌
	shuffle: () => {
		set((state) => {
			state.game.deck.shuffle();
			return { game: state.game };
		});
	},
	// 抽牌
	dealCards: () => {
		set((state) => {
			const cards = state.game.dealCards();
			console.log(cards);

			return {
				game: state.game,
				remainingDraws: state.game.remainingDraws,
				remainingCards: state.game.getRemainingCards(),
				cards,
			};
		});
	},
	// 获取剩余卡牌数
	getRemainingCards: () => {
		set((state) => {
			const remainingCards = state.game.getRemainingCards();
			return { game: state.game, remainingCards: remainingCards };
		});
	},
	// 重置牌阵
	resetSpread: () => {
		set((state) => {
			state.game.resetSpread();
			return { game: state.game };
		});
	},
	// 重置游戏
	resetGame: () => {
		set(() => {
			const newGame = new TarotGame();
			return {
				game: newGame,
				stage: Stages.UserInput,
				spreadIndex: 0,
				interpretation: null,
				remainingDraws: null,
				currentSpread: null,
				remainingCards: [],
				questions: {
					question: "",
					questionType: "",
					complexity: "",
					language: "",
					response: "",
					spreadUsage: "",
				},
			};
		});
	},
	// 解释单张牌
	interpretCard: async (position: TarotPosition) => {
		const interpretation = await get().game.interpretCard(
			get().game.currentSpread.name,
			position,
			get().questions.question,
			get().questions.language,
		);
		return interpretation;
	},
	// 解释牌阵
	interpretSpread: () => {
		const { currentSpread, game, questions } = get(); // 获取当前状态

		// 如果当前没有牌阵，则不执行任何操作
		if (!currentSpread) {
			console.error("currentSpread is null, cannot interpret the spread.");
			return;
		}

		// 定义一个异步函数来执行解释操作
		const doInterpretSpread = async () => {
			try {
				const interpretation = await game.interpretSpread(
					currentSpread,
					questions.question,
					questions.language,
				);
				// 异步操作完成后，同步更新状态
				set({ game, interpretation });
			} catch (error) {
				console.error("Error interpreting the spread:", error);
				// 如果发生错误，也同步更新状态，可能是清除解释或保留原有状态
				set({ game });
			}
		};

		// 调用异步函数
		doInterpretSpread();
		console.log("store outpu", get().interpretation);
	},
	// 设置游戏阶段
	setStage: (stage: Stages) => {
		set({ stage });
	},
}));
