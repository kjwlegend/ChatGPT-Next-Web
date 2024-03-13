// constants/tarotSpreads.ts

import { TarotSpread } from "../types/TarotSpread";
// constants/tarotSpreads.ts
export const TAROT_SPREADS: TarotSpread[] = [
	{
		name: "Three Card Spread",
		positions: [
			{
				id: 1,
				name: "Past",
				meaning: "代表过去及其对当前情况的影响。",
				coordinates: { x: 100, y: 200 },
			},
			{
				id: 2,
				name: "Present",
				meaning: "代表当前的情况或挑战。",
				coordinates: { x: 250, y: 200 },
			},
			{
				id: 3,
				name: "Future",
				meaning: "代表潜在的未来结果。",
				coordinates: { x: 350, y: 200 },
			},
		],
		cardCount: 3,
		labels: ["基本", "爱情", "事业"],
	},
	{
		name: "Celtic Cross Spread",
		positions: [
			{
				id: 1,
				name: "Significator",
				meaning: "代表提问者或问题的核心。",
				coordinates: { x: 100, y: 200 },
			},
			{
				id: 2,
				name: "Crossing",
				meaning: "代表当前的主要挑战或障碍。",
				coordinates: { x: 250, y: 200 },
			},
			{
				id: 3,
				name: "Base",
				meaning: "代表问题的根源或基础。",
				coordinates: { x: 350, y: 200 },
			},
			// ... 其他Celtic Cross Spread的位置和属性
		],
		cardCount: 10,
		labels: ["综合", "爱情", "事业", "健康", "财务"],
	},
	{
		name: "The Horseshoe Spread",
		positions: [
			{
				id: 1,
				name: "Past",
				meaning: "代表过去的事件或影响。",
				coordinates: { x: 100, y: 200 },
			},
			{
				id: 2,
				name: "Present",
				meaning: "代表当前的情况或挑战。",
				coordinates: { x: 250, y: 200 },
			},
			{
				id: 3,
				name: "Future",
				meaning: "代表潜在的未来结果。",
				coordinates: { x: 350, y: 200 },
			},
			// ... The Horseshoe Spread的其他位置和属性
		],
		cardCount: 5,
		labels: ["爱情", "事业", "健康", "财务", "家庭"],
	},
	{
		name: "The Tree of Life Spread",
		positions: [
			{
				id: 1,
				name: "Kether",
				meaning: "代表纯粹的精神和无限的可能性。",
				coordinates: { x: 100, y: 200 },
			},
			// ... The Tree of Life Spread的其他位置和属性
		],
		cardCount: 10,
		labels: [
			"综合",
			"爱情",
			"事业",
			"健康",
			"财务",
			"精神",
			"人际关系",
			"家庭",
		],
	},
	{
		name: "The Star Spread",
		positions: [
			{
				id: 1,
				name: "Central",
				meaning: "代表问题或情况的中心。",
				coordinates: { x: 100, y: 200 },
			},
			// ... The Star Spread的其他位置和属性
		],
		cardCount: 7,
		labels: ["爱情", "事业", "健康", "财务", "家庭", "精神", "人际关系"],
	},
	{
		name: "The Zodiac Spread",
		positions: [
			{
				id: 1,
				name: "Self",
				meaning: "代表提问者的个性和当前状态。",
				coordinates: { x: 100, y: 200 },
			},
			{
				id: 2,
				name: "Partner",
				meaning: "代表提问者的伴侣或重要的他人。",
				coordinates: { x: 200, y: 300 },
			},
			{
				id: 3,
				name: "Foundation",
				meaning: "代表提问者生活的基础或家庭环境。",
				coordinates: { x: 300, y: 100 },
			},
			{
				id: 4,
				name: "Populus",
				meaning: "代表周围的人和社会环境的影响。",
				coordinates: { x: 400, y: 200 },
			},
			{
				id: 5,
				name: "Via",
				meaning: "代表旅途和即将到来的变化。",
				coordinates: { x: 500, y: 300 },
			},
			{
				id: 6,
				name: "House",
				meaning: "代表提问者的个人空间和内心世界。",
				coordinates: { x: 600, y: 100 },
			},
			{
				id: 7,
				name: "Levia",
				meaning: "代表潜意识和未解决的问题。",
				coordinates: { x: 700, y: 200 },
			},
			{
				id: 8,
				name: "Fortuna Major",
				meaning: "代表大的好运和即将到来的积极变化。",
				coordinates: { x: 800, y: 300 },
			},
			{
				id: 9,
				name: "Fortuna Minor",
				meaning: "代表小的不幸和即将到来的挑战。",
				coordinates: { x: 900, y: 200 },
			},
			{
				id: 10,
				name: "Judgment",
				meaning: "代表评估和决策，以及其对未来的影响。",
				coordinates: { x: 1000, y: 100 },
			},
			{
				id: 11,
				name: "Death",
				meaning: "代表转变和结束，以及新的开始。",
				coordinates: { x: 1100, y: 200 },
			},
			{
				id: 12,
				name: "Temperance",
				meaning: "代表平衡和调和，以及对现状的调整。",
				coordinates: { x: 1200, y: 300 },
			},
		],
		cardCount: 12,
		labels: [
			"综合",
			"爱情",
			"事业",
			"健康",
			"财务",
			"家庭",
			"社交",
			"旅行",
			"内心",
			"变革",
			"决策",
			"平衡",
		],
	},

	{
		name: "The Celtic Tree Spread",
		positions: [
			{
				id: 1,
				name: "Root",
				meaning: "代表基础和稳定性。",
				coordinates: { x: 100, y: 200 },
			},
			{
				id: 2,
				name: "Stem",
				meaning: "代表成长和适应性。",
				coordinates: { x: 200, y: 200 },
			},
			{
				id: 3,
				name: "Branches",
				meaning: "代表扩展和社交网络。",
				coordinates: { x: 300, y: 200 },
			},
			{
				id: 4,
				name: "Flower",
				meaning: "代表创造力和美。",
				coordinates: { x: 400, y: 200 },
			},
			{
				id: 5,
				name: "Leaf",
				meaning: "代表健康和活力。",
				coordinates: { x: 500, y: 200 },
			},
			{
				id: 6,
				name: "Fruit",
				meaning: "代表成就和结果。",
				coordinates: { x: 600, y: 200 },
			},
			{
				id: 7,
				name: "Seed",
				meaning: "代表潜力和新的开始。",
				coordinates: { x: 700, y: 200 },
			},
		],
		cardCount: 7,
		labels: ["基础", "成长", "社交", "创造力", "健康", "成就", "潜力"],
	},

	{
		name: "The House Spread",
		positions: [
			{
				id: 1,
				name: "Foundation",
				meaning: "代表家庭和个人基础。",
				coordinates: { x: 100, y: 200 },
			},
			{
				id: 2,
				name: "Creativity",
				meaning: "代表艺术和创造力。",
				coordinates: { x: 200, y: 200 },
			},
			{
				id: 3,
				name: "Home",
				meaning: "代表家庭生活和私人空间。",
				coordinates: { x: 300, y: 200 },
			},
			{
				id: 4,
				name: "Love",
				meaning: "代表爱情和伙伴关系。",
				coordinates: { x: 400, y: 200 },
			},
			{
				id: 5,
				name: "Wealth",
				meaning: "代表财务状况和物质资源。",
				coordinates: { x: 500, y: 200 },
			},
			{
				id: 6,
				name: "Health",
				meaning: "代表身体和心理健康。",
				coordinates: { x: 600, y: 200 },
			},
			{
				id: 7,
				name: "Career",
				meaning: "代表工作和职业发展。",
				coordinates: { x: 700, y: 200 },
			},
			{
				id: 8,
				name: "Travel",
				meaning: "代表旅行和探索。",
				coordinates: { x: 800, y: 200 },
			},
			{
				id: 9,
				name: "Spirituality",
				meaning: "代表精神生活和内在成长。",
				coordinates: { x: 900, y: 200 },
			},
		],
		cardCount: 9,
		labels: [
			"基础",
			"创造力",
			"家庭",
			"爱情",
			"财富",
			"健康",
			"事业",
			"旅行",
			"精神",
		],
	},
];
