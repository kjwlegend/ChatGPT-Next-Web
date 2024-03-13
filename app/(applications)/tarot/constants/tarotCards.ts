// constants/tarotCards.ts
import { TarotCardType } from "../types/TarotCard";
export const TAROT_BACK_IMAGE = "/tarots/back.webp"; // 所有卡牌背面的图片路径

// 设定一个default state 状态, 用于TAROT_CARDS 的初始化
// flipped: boolean;
// isReversed: boolean; // 卡牌的位置，正位或逆位
// flip(): void; // 翻转卡牌的方法

const defaultState = {
	flipped: false,
	isReversed: false,
	flip(): void {
		this.flipped = !this.flipped;
	},
};

// 工厂函数，用于创建塔罗牌对象
function createTarotCard(
	cardData: Omit<TarotCardType, keyof typeof defaultState>,
): TarotCardType {
	return { ...cardData, ...defaultState };
}
// 所有的塔罗牌
export const TAROT_CARDS: TarotCardType[] = [
	createTarotCard({
		id: 1,
		name: "The Fool",
		front: "fool-front.png",
		meaningPositive: "新的开始，冒险，天真，无限的可能性。",
		meaningReversed: "失误，轻率，不负责任，浪费时间。",
		chineseName: "愚者",
	}),
	createTarotCard({
		id: 2,
		name: "The Magician",
		front: "magician-front.png",
		meaningPositive: "技能，才能，控制，创造。",
		meaningReversed: "操纵，欺骗，自负，无能。",
		chineseName: "魔术师",
	}),
	createTarotCard({
		id: 3,
		name: "The High Priestess",
		front: "high-priestess-front.png",
		meaningPositive: "直觉，智慧，神秘，女性力量。",
		meaningReversed: "神秘，操纵，隐藏，失去联系。",
		chineseName: "女祭司",
	}),
	createTarotCard({
		id: 4,
		name: "The Empress",
		front: "empress-front.png",
		meaningPositive: "繁荣，丰盛，创造，母性。",
		meaningReversed: "过度，依赖，停滞，缺乏关爱。",
		chineseName: "皇后",
	}),
	createTarotCard({
		id: 5,
		name: "The Emperor",
		front: "emperor-front.png",
		meaningPositive: "权威，秩序，控制，领导。",
		meaningReversed: "专制，僵化，缺乏同情，过度控制。",
		chineseName: "皇帝",
	}),
	createTarotCard({
		id: 6,
		name: "The Lovers",
		front: "lovers-front.png",
		meaningPositive: "关系，选择，和谐，爱情。",
		meaningReversed: "不和，不诚实，犹豫不决，牺牲。",
		chineseName: "恋人",
	}),
	createTarotCard({
		id: 7,
		name: "The Chariot",
		front: "chariot-front.png",
		meaningPositive: "胜利，意志力，自律，旅程。",
		meaningReversed: "失败，缺乏方向，逃避，过度自信。",
		chineseName: "战车",
	}),
	createTarotCard({
		id: 8,
		name: "Strength",
		front: "strength-front.png",
		meaningPositive: "勇气，内在力量，耐心，治愈。",
		meaningReversed: "虚弱，情绪化，缺乏控制，挫败。",
		chineseName: "力量",
	}),
	createTarotCard({
		id: 9,
		name: "The Hermit",
		front: "hermit-front.png",
		meaningPositive: "内省，寻求知识，孤独，智慧。",
		meaningReversed: "孤独，困惑，害怕改变，无知。",
		chineseName: "隐士",
	}),
	createTarotCard({
		id: 10,
		name: "Wheel of Fortune",
		front: "wheel-of-fortune-front.png",
		meaningPositive: "命运，机遇，变化，循环。",
		meaningReversed: "坏运气，意外，不可预测，失去控制。",
		chineseName: "命运之轮",
	}),
	createTarotCard({
		id: 11,
		name: "Justice",
		front: "justice-front.png",
		meaningPositive: "公正，真理，法律，平衡。",
		meaningReversed: "不公正，失衡，偏袒，冲突。",
		chineseName: "正义",
	}),
	createTarotCard({
		id: 12,
		name: "The Hanged Man",
		front: "hanged-man-front.png",
		meaningPositive: "牺牲，新视角，耐心，等待。",
		meaningReversed: "停滞，抗拒改变，自我毁灭，固执。",
		chineseName: "倒吊人",
	}),
	createTarotCard({
		id: 13,
		name: "Death",
		front: "death-front.png",
		meaningPositive: "转变，结束，新的开始，重生。",
		meaningReversed: "恐惧，拒绝改变，停滞不前，失去。",
		chineseName: "死神",
	}),
	createTarotCard({
		id: 14,
		name: "Temperance",
		front: "temperance-front.png",
		meaningPositive: "平衡，和谐，耐心，适度。",
		meaningReversed: "失衡，极端，过度，冲突。",
		chineseName: "节制",
	}),
	createTarotCard({
		id: 15,
		name: "The Devil",
		front: "devil-front.png",
		meaningPositive: "束缚，诱惑，物质主义，控制。",
		meaningReversed: "释放，摆脱束缚，自我反省，转变。",
		chineseName: "恶魔",
	}),
	createTarotCard({
		id: 16,
		name: "The Tower",
		front: "tower-front.png",
		meaningPositive: "破坏，启示，混乱，改变。",
		meaningReversed: "灾难，拒绝接受，固执，分离。",
		chineseName: "塔",
	}),
	createTarotCard({
		id: 17,
		name: "The Star",
		front: "star-front.png",
		meaningPositive: "希望，灵感，宁静，恢复。",
		meaningReversed: "失望，缺乏信仰，绝望，混乱。",
		chineseName: "星星",
	}),
	createTarotCard({
		id: 18,
		name: "The Moon",
		front: "moon-front.png",
		meaningPositive: "幻想，不确定性，潜意识，直觉。",
		meaningReversed: "困惑，恐惧，误解，幻觉。",
		chineseName: "月亮",
	}),
	createTarotCard({
		id: 19,
		name: "The Sun",
		front: "sun-front.png",
		meaningPositive: "成功，活力，清晰，幸福。",
		meaningReversed: "失败，抑郁，困惑，空虚。",
		chineseName: "太阳",
	}),
	createTarotCard({
		id: 20,
		name: "Judgement",
		front: "judgement-front.png",
		meaningPositive: "觉醒，重生，评估，重要的决定。",
		meaningReversed: "自我怀疑，无法前进，逃避责任，停滞。",
		chineseName: "审判",
	}),
	createTarotCard({
		id: 21,
		name: "The World",
		front: "world-front.png",
		meaningPositive: "完成，整合，成就，和谐。",
		meaningReversed: "未完成，分裂，失败，混乱。",
		chineseName: "世界",
	}),
];
