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
				coordinates: { x: 30, y: 75 }, // 左边距 + 30px 间距
			},
			{
				id: 2,
				name: "Present",
				meaning: "代表当前的情况或挑战。",
				coordinates: { x: 180, y: 75 }, // 第一张卡片的右边距 + 卡片宽度 + 30px 间距
			},
			{
				id: 3,
				name: "Future",
				meaning: "代表潜在的未来结果。",
				coordinates: { x: 330, y: 75 }, // 第二张卡片的右边距 + 卡片宽度 + 30px 间距
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
				coordinates: { x: 150, y: 300 }, // 左边距 + 30px 间距
			},
			{
				id: 2,
				name: "Crossing",
				meaning: "代表当前的主要挑战或障碍。",
				coordinates: { x: 180, y: 330 }, // 第一张卡片的右边距 + 卡片宽度 + 30px 间距
			},
			{
				id: 3,
				name: "Base",
				meaning: "代表问题的根源或基础。",
				coordinates: { x: 0, y: 300 }, // 第二张卡片的右边距 + 卡片宽度 + 30px 间距
			},
			{
				id: 4,
				name: "Foundation",
				meaning: "代表影响提问者的潜意识或过去的影响。",
				coordinates: { x: 300, y: 300 }, // 第一张卡片的下方 + 30px 间距
			},
			{
				id: 5,
				name: "Challenge",
				meaning: "代表提问者面临的挑战或需要克服的障碍。",
				coordinates: { x: 150, y: 50 }, // 第三张卡片的下方 + 30px 间距
			},
			{
				id: 6,
				name: "Past",
				meaning: "代表过去的影响或已经发生的事件。",
				coordinates: { x: 150, y: 550 }, // 左上角的左下角 + 30px 间距
			},
			{
				id: 7,
				name: "Future",
				meaning: "代表未来可能的发展或结果。",
				coordinates: { x: 450, y: 550 }, // 右上角的右下角 + 30px 间距
			},
			{
				id: 8,
				name: "Self",
				meaning: "代表提问者的内心感受和态度。",
				coordinates: { x: 450, y: 380 }, // 第二张卡片的下方 + 30px 间距
			},
			{
				id: 9,
				name: "Environment",
				meaning: "代表周围环境对提问者的影响。",
				coordinates: { x: 450, y: 210 }, // 第一张卡片的左上角 + 30px 间距
			},
			{
				id: 10,
				name: "Outcome",
				meaning: "代表问题的最终结果或解决方案。",
				coordinates: { x: 450, y: 40 }, // 第三张卡片的下方 + 30px 间距
			},
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
			{
				id: 4,
				name: "Challenge",
				meaning: "代表提问者当前面临的挑战或障碍。",
				coordinates: { x: 250, y: 300 },
			},
			{
				id: 5,
				name: "Potential",
				meaning: "代表提问者的潜力和可能的机遇。",
				coordinates: { x: 450, y: 200 },
			},
			{
				id: 6,
				name: "Advice",
				meaning: "提供给提问者的建议或指导。",
				coordinates: { x: 150, y: 200 },
			},
			{
				id: 7,
				name: "Hopes and Fears",
				meaning: "代表提问者的希望和恐惧。",
				coordinates: { x: 550, y: 300 },
			},
			{
				id: 8,
				name: "Outcome",
				meaning: "代表可能的结果或未来的趋势。",
				coordinates: { x: 450, y: 100 },
			},
		],
		cardCount: 8,
		labels: ["爱情", "事业", "健康", "财务", "家庭"],
	},

	{
		name: "The Tree of Life Spread",
		positions: [
			{
				id: 1,
				name: "Kether",
				meaning: "代表纯粹的精神和无限的可能性。",
				coordinates: { x: 100, y: 200 }, // 顶部卡片的中心
			},
			{
				id: 2,
				name: "Chokmah",
				meaning: "代表智慧和创造力。",
				coordinates: { x: 200, y: 100 }, // Kether下方，第一层
			},
			{
				id: 3,
				name: "Binah",
				meaning: "代表理解力和形式。",
				coordinates: { x: 300, y: 100 }, // Chokmah的右边，第一层
			},
			{
				id: 4,
				name: "Chesed",
				meaning: "代表慈悲和力量。",
				coordinates: { x: 400, y: 200 }, // Kether下方，第二层
			},
			{
				id: 5,
				name: "Geburah",
				meaning: "代表力量和判断。",
				coordinates: { x: 400, y: 300 }, // Chesed的右边，第二层
			},
			{
				id: 6,
				name: "Tipheret",
				meaning: "代表美丽和平衡。",
				coordinates: { x: 300, y: 400 }, // Kether下方，第三层
			},
			{
				id: 7,
				name: "Netzach",
				meaning: "代表胜利和持久。",
				coordinates: { x: 200, y: 500 }, // Tipheret的左边，第四层
			},
			{
				id: 8,
				name: "Hod",
				meaning: "代表智慧和交流。",
				coordinates: { x: 100, y: 400 }, // Tipheret的下方，第五层
			},
			{
				id: 9,
				name: "Yesod",
				meaning: "代表基础和潜意识。",
				coordinates: { x: 100, y: 300 }, // Hod的左边，第五层
			},
			{
				id: 10,
				name: "Malkuth",
				meaning: "代表物质世界和实际成果。",
				coordinates: { x: 200, y: 600 }, // Yesod的右边，第六层
			},
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
				coordinates: { x: 100, y: 200 }, // 中心位置
			},
			{
				id: 2,
				name: "Self",
				meaning: "代表提问者的当前状态或自我感受。",
				coordinates: { x: 100, y: 100 }, // 中心位置正上方，减去卡片高度和间距
			},
			{
				id: 3,
				name: "潜意识",
				meaning: "代表提问者的潜意识想法或感受。",
				coordinates: { x: 200, y: 100 }, // 中心位置右侧，加上卡片宽度和间距
			},
			{
				id: 4,
				name: "Challenge",
				meaning: "代表提问者面临的挑战或障碍。",
				coordinates: { x: 300, y: 100 }, // 与 "潜意识" 同列，加上卡片宽度和间距
			},
			{
				id: 5,
				name: "Past",
				meaning: "代表过去的影响或已经发生的事件。",
				coordinates: { x: 100, y: 300 }, // 中心位置正下方，加上卡片高度和间距
			},
			{
				id: 6,
				name: "Future",
				meaning: "代表未来可能的发展或结果。",
				coordinates: { x: 300, y: 300 }, // 中心位置正下方，与 "Past" 同列，加上卡片高度和间距
			},
			{
				id: 7,
				name: "Willpower",
				meaning: "代表提问者的意志力和决心。",
				coordinates: { x: 500, y: 100 }, // 中心位置右侧，经过 "潜意识" 和 "Challenge"，加上相应的卡片宽度和间距
			},
			{
				id: 8,
				name: "Mystery",
				meaning: "代表未知的因素或隐藏的信息。",
				coordinates: { x: 600, y: 200 }, // 位于 "Willpower" 正上方，加上卡片高度和间距
			},
			{
				id: 9,
				name: "Advice",
				meaning: "提供给提问者的建议或指导。",
				coordinates: { x: 500, y: 300 }, // 位于 "Mystery" 正下方，加上卡片高度和间距
			},
			{
				id: 10,
				name: "Hope",
				meaning: "代表提问者的希望和愿望。",
				coordinates: { x: 400, y: 400 }, // 位于 "Future" 左侧，根据中心位置和 "Future" 计算
			},
			{
				id: 11,
				name: "Fear",
				meaning: "代表提问者的恐惧和担忧。",
				coordinates: { x: 200, y: 400 }, // 位于 "Hope" 正下方，加上卡片高度和间距
			},
			{
				id: 12,
				name: "Outcome",
				meaning: "代表问题的最终结果或解决方案。",
				coordinates: { x: 300, y: 500 }, // 位于 "Future" 正上方，加上卡片高度和间距
			},
			{
				id: 13,
				name: "Transformation",
				meaning: "代表变化和转变的可能性。",
				coordinates: { x: 400, y: 600 }, // 位于 "Outcome" 正上方，加上卡片高度和间距
			},
		],
		cardCount: 13,
		labels: ["爱情", "事业", "健康", "财务", "家庭", "精神", "人际关系"],
	},
	{
		name: "The Zodiac Spread",
		positions: [
			{
				id: 1,
				name: "Self",
				meaning: "代表提问者的个性和当前状态。",
				coordinates: { x: 100, y: 200 }, // 左上角的卡片
			},
			{
				id: 2,
				name: "Partner",
				meaning: "代表提问者的伴侣或重要的他人。",
				coordinates: { x: 200, y: 300 }, // 位于 "Self" 的右上方
			},
			{
				id: 3,
				name: "Foundation",
				meaning: "代表提问者生活的基础或家庭环境。",
				coordinates: { x: 300, y: 100 }, // 位于左下角的卡片
			},
			{
				id: 4,
				name: "Populus",
				meaning: "代表周围的人和社会环境的影响。",
				coordinates: { x: 400, y: 200 }, // 位于 "Foundation" 的右上方
			},
			{
				id: 5,
				name: "Via",
				meaning: "代表旅途和即将到来的变化。",
				coordinates: { x: 500, y: 300 }, // 位于 "Populus" 的右上方
			},
			{
				id: 6,
				name: "House",
				meaning: "代表提问者的个人空间和内心世界。",
				coordinates: { x: 600, y: 100 }, // 位于 "Foundation" 的正上方
			},
			{
				id: 7,
				name: "Levia",
				meaning: "代表潜意识和未解决的问题。",
				coordinates: { x: 700, y: 200 }, // 位于 "House" 的右上方
			},
			{
				id: 8,
				name: "Fortuna Major",
				meaning: "代表大的好运和即将到来的积极变化。",
				coordinates: { x: 800, y: 300 }, // 位于 "Levia" 的右上方
			},
			{
				id: 9,
				name: "Fortuna Minor",
				meaning: "代表小的不幸和即将到来的挑战。",
				coordinates: { x: 900, y: 200 }, // 位于 "Fortuna Major" 的下方
			},
			{
				id: 10,
				name: "Judgment",
				meaning: "代表评估和决策，以及其对未来的影响。",
				coordinates: { x: 1000, y: 100 }, // 位于 "House" 的正上方，稍微调整以适应圆周排列
			},
			{
				id: 11,
				name: "Death",
				meaning: "代表转变和结束，以及新的开始。",
				coordinates: { x: 1100, y: 200 }, // 位于 "Judgment" 的右上方
			},
			{
				id: 12,
				name: "Temperance",
				meaning: "代表平衡和调和，以及对现状的调整。",
				coordinates: { x: 1200, y: 300 }, // 位于 "Death" 的右上方
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
				coordinates: { x: 100, y: 200 }, // 左边距 + 30px 间距
			},
			{
				id: 2,
				name: "Stem",
				meaning: "代表成长和适应性。",
				coordinates: { x: 150, y: 200 }, // Root右侧30px + 卡片宽度 + 30px 间距
			},
			{
				id: 3,
				name: "Branches",
				meaning: "代表扩展和社交网络。",
				coordinates: { x: 290, y: 200 }, // Stem右侧30px + 卡片宽度 + 30px 间距
			},
			{
				id: 4,
				name: "Flower",
				meaning: "代表创造力和美。",
				coordinates: { x: 430, y: 200 }, // Branches右侧30px + 卡片宽度 + 30px 间距
			},
			{
				id: 5,
				name: "Leaf",
				meaning: "代表健康和活力。",
				coordinates: { x: 570, y: 200 }, // Flower右侧30px + 卡片宽度 + 30px 间距
			},
			{
				id: 6,
				name: "Fruit",
				meaning: "代表成就和结果。",
				coordinates: { x: 710, y: 200 }, // Leaf右侧30px + 卡片宽度 + 30px 间距
			},
			{
				id: 7,
				name: "Seed",
				meaning: "代表潜力和新的开始。",
				coordinates: { x: 850, y: 200 }, // Fruit右侧30px + 卡片宽度 + 30px 间距
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
				coordinates: { x: 100, y: 200 }, // 左边距 + 30px 间距
			},
			{
				id: 2,
				name: "Creativity",
				meaning: "代表艺术和创造力。",
				coordinates: { x: 200, y: 200 }, // Foundation右侧30px + 卡片宽度 + 30px 间距
			},
			{
				id: 3,
				name: "Home",
				meaning: "代表家庭生活和私人空间。",
				coordinates: { x: 300, y: 200 }, // Creativity右侧30px + 卡片宽度 + 30px 间距
			},
			{
				id: 4,
				name: "Love",
				meaning: "代表爱情和伙伴关系。",
				coordinates: { x: 400, y: 200 }, // Home右侧30px + 卡片宽度 + 30px 间距
			},
			{
				id: 5,
				name: "Wealth",
				meaning: "代表财务状况和物质资源。",
				coordinates: { x: 500, y: 200 }, // Love右侧30px + 卡片宽度 + 30px 间距
			},
			{
				id: 6,
				name: "Health",
				meaning: "代表身体和心理健康。",
				coordinates: { x: 600, y: 200 }, // Wealth右侧30px + 卡片宽度 + 30px 间距
			},
			{
				id: 7,
				name: "Career",
				meaning: "代表工作和职业发展。",
				coordinates: { x: 700, y: 200 }, // Health右侧30px + 卡片宽度 + 30px 间距
			},
			{
				id: 8,
				name: "Travel",
				meaning: "代表旅行和探索。",
				coordinates: { x: 800, y: 200 }, // Career右侧30px + 卡片宽度 + 30px 间距
			},
			{
				id: 9,
				name: "Spirituality",
				meaning: "代表精神生活和内在成长。",
				coordinates: { x: 900, y: 200 }, // Travel右侧30px + 卡片宽度 + 30px 间距
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
