// types/ITarotCard.ts
export type TarotCardType = {
	id: number | string;
	name: string; // 英文名
	chineseName: string; // 中文名（可选）
	front: string; // 图片路径
	meaningPositive: string; // 正位含义
	meaningReversed: string; // 逆位含义
	flipped: boolean;
	isReversed: boolean; // 卡牌的位置，正位或逆位
	astrologicalCorrespondence?: string;
	elementalCorrespondence?: string;
	keywords?: string;
	summary?: string;
	flip(): void; // 翻转卡牌的方法
};
