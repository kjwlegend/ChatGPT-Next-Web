// constants/tarotSpreads.ts

import { TarotSpread } from "../libs/TarotSpread";
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
		name: "Two Choices Spread",
		positions: [
			{
				id: 1,
				name: "Choice A",
				meaning: "代表第一个选择的当前状态和潜在结果。",
				coordinates: { x: 1, y: 1 },
			},
			{
				id: 2,
				name: "Choice B",
				meaning: "代表第二个选择的当前状态和潜在结果。",
				coordinates: { x: 3, y: 1 },
			},
			{
				id: 3,
				name: "What You Need to Know",
				meaning: "揭示在做出决策时你需要考虑的关键信息或隐藏因素。",
				coordinates: { x: 2, y: 2 },
			},
			{
				id: 4,
				name: "Advice",
				meaning: "提供关于如何做出最佳决策的指导或建议。",
				coordinates: { x: 2, y: 3 },
			},
		],
		cardCount: 4,
		labels: ["决策辅助", "选择对比", "个人指导"],
	},
	{
		name: "Extended Two Choices Spread",
		positions: [
			{
				id: 1,
				name: "Choice A - Current Situation",
				meaning: "代表第一个选择当前的情况。",
				coordinates: { x: 1, y: 1 },
			},
			{
				id: 2,
				name: "Choice A - Challenges",
				meaning: "代表第一个选择面临的挑战。",
				coordinates: { x: 1, y: 2 },
			},
			{
				id: 3,
				name: "Choice A - Potential Outcome",
				meaning: "代表第一个选择的潜在结果。",
				coordinates: { x: 1, y: 3 },
			},
			{
				id: 4,
				name: "Choice B - Current Situation",
				meaning: "代表第二个选择当前的情况。",
				coordinates: { x: 3, y: 1 },
			},
			{
				id: 5,
				name: "Choice B - Challenges",
				meaning: "代表第二个选择面临的挑战。",
				coordinates: { x: 3, y: 2 },
			},
			{
				id: 6,
				name: "Choice B - Potential Outcome",
				meaning: "代表第二个选择的潜在结果。",
				coordinates: { x: 3, y: 3 },
			},
			{
				id: 7,
				name: "Advice",
				meaning: "提供关于如何做出最佳决策的指导或建议。",
				coordinates: { x: 2, y: 4 },
			},
		],
		cardCount: 7,
		labels: ["详细决策辅助", "深度选择对比", "个人指导"],
	},
	{
		name: "Pros and Cons Spread",
		positions: [
			{
				id: 1,
				name: "Choice A - Pros",
				meaning: "代表第一个选择的优势。",
				coordinates: { x: 1, y: 1 },
			},
			{
				id: 2,
				name: "Choice A - Cons",
				meaning: "代表第一个选择的劣势。",
				coordinates: { x: 1, y: 2 },
			},
			{
				id: 3,
				name: "Choice B - Pros",
				meaning: "代表第二个选择的优势。",
				coordinates: { x: 3, y: 1 },
			},
			{
				id: 4,
				name: "Choice B - Cons",
				meaning: "代表第二个选择的劣势。",
				coordinates: { x: 3, y: 2 },
			},
			{
				id: 5,
				name: "Advice",
				meaning: "提供关于如何做出最佳决策的指导或建议。",
				coordinates: { x: 2, y: 3 },
			},
		],
		cardCount: 5,
		labels: ["优势劣势分析", "决策辅助", "个人指导"],
	},

	{
		name: "Crossroads Spread",
		positions: [
			{
				id: 1,
				name: "Current Situation",
				meaning: "代表提问者目前所处的情况。",
				coordinates: { x: 180, y: 75 },
			},
			{
				id: 2,
				name: "Path A",
				meaning: "代表面前的第一个选择或路径可能带来的结果。",
				coordinates: { x: 30, y: 225 },
			},
			{
				id: 3,
				name: "Path B",
				meaning: "代表面前的第二个选择或路径可能带来的结果。",
				coordinates: { x: 330, y: 225 },
			},
			{
				id: 4,
				name: "What Helps",
				meaning: "代表哪些因素或力量可以帮助提问者做出决策。",
				coordinates: { x: 30, y: 375 },
			},
			{
				id: 5,
				name: "What Hinders",
				meaning: "代表哪些障碍或挑战可能阻碍提问者做出决策。",
				coordinates: { x: 330, y: 375 },
			},
			{
				id: 6,
				name: "Potential Outcome",
				meaning: "代表基于当前所选择的路径可能出现的潜在结果。",
				coordinates: { x: 180, y: 525 },
			},
		],
		cardCount: 6,
		labels: ["选择", "决策", "路径"],
	},
	{
		name: "Hexagram Spread",
		positions: [
			{
				id: 1,
				name: "Spirit",
				meaning: "代表提问者的精神世界和内在智慧。",
				coordinates: { x: 180, y: 75 },
			},
			{
				id: 2,
				name: "Air",
				meaning: "代表与思考、沟通和决策相关的事务。",
				coordinates: { x: 30, y: 225 },
			},
			{
				id: 3,
				name: "Fire",
				meaning: "代表动力、热情、创造力和行动。",
				coordinates: { x: 330, y: 225 },
			},
			{
				id: 4,
				name: "Water",
				meaning: "代表情感、直觉、关系和流动性。",
				coordinates: { x: 30, y: 375 },
			},
			{
				id: 5,
				name: "Earth",
				meaning: "代表物质世界、稳定性、实际问题和身体健康。",
				coordinates: { x: 330, y: 375 },
			},
			{
				id: 6,
				name: "Outcome",
				meaning: "代表考虑所有元素后，提问者可能遇到的结果。",
				coordinates: { x: 180, y: 525 },
			},
		],
		cardCount: 6,
		labels: ["灵性", "智慧", "平衡"],
	},
	{
		name: "Four Elements Spread",
		positions: [
			{
				id: 1,
				name: "Fire (Action)",
				meaning: "代表提问者的行动力、动力和意志。",
				coordinates: { x: 30, y: 75 },
			},
			{
				id: 2,
				name: "Air (Thoughts)",
				meaning: "代表提问者的思考、计划和沟通方式。",
				coordinates: { x: 180, y: 75 },
			},
			{
				id: 3,
				name: "Water (Emotions)",
				meaning: "代表提问者的情感、直觉和内在感受。",
				coordinates: { x: 330, y: 75 },
			},
			{
				id: 4,
				name: "Earth (Physical World)",
				meaning: "代表提问者在物质世界中的存在，包括健康、财务和日常生活。",
				coordinates: { x: 180, y: 225 },
			},
		],
		cardCount: 4,
		labels: ["行动", "思考", "情感", "物质世界"],
	},

	{
		name: "Relationship Spread",
		positions: [
			{
				id: 1,
				name: "You",
				meaning: "代表你在关系中的当前状态和感受。",
				coordinates: { x: 30, y: 75 },
			},
			{
				id: 2,
				name: "The Other Person",
				meaning: "代表另一方在关系中的当前状态和感受。",
				coordinates: { x: 180, y: 75 },
			},
			{
				id: 3,
				name: "The Relationship",
				meaning: "代表双方关系的当前状态，以及双方如何互动。",
				coordinates: { x: 330, y: 75 },
			},
			{
				id: 4,
				name: "Strengths",
				meaning: "代表关系中的强项和积极方面。",
				coordinates: { x: 30, y: 225 },
			},
			{
				id: 5,
				name: "Weaknesses",
				meaning: "代表关系中的弱点和需要改进的方面。",
				coordinates: { x: 180, y: 225 },
			},
			{
				id: 6,
				name: "Challenges/Obstacles",
				meaning: "代表当前面临的挑战或障碍。",
				coordinates: { x: 330, y: 225 },
			},
			{
				id: 7,
				name: "Advice",
				meaning: "提供关于如何改善或处理关系的建议。",
				coordinates: { x: 180, y: 375 },
			},
		],
		cardCount: 7,
		labels: ["关系", "个人成长", "相互理解"],
	},

	{
		name: "Celtic Cross Spread",
		positions: [
			{
				id: 1,
				name: "Present",
				meaning: "代表当前的情况。",
				coordinates: { x: 30, y: 75 },
			},
			{
				id: 2,
				name: "Challenge",
				meaning: "代表当前面临的挑战或障碍。",
				coordinates: { x: 180, y: 75 },
			},
			{
				id: 3,
				name: "Past",
				meaning: "代表影响当前情况的过去因素。",
				coordinates: { x: 30, y: 225 },
			},
			{
				id: 4,
				name: "Future",
				meaning: "代表即将到来的事件。",
				coordinates: { x: 180, y: 225 },
			},
			{
				id: 5,
				name: "Above",
				meaning: "代表最佳可能的结果。",
				coordinates: { x: 330, y: 75 },
			},
			{
				id: 6,
				name: "Below",
				meaning: "代表潜意识的影响。",
				coordinates: { x: 330, y: 225 },
			},
			{
				id: 7,
				name: "Advice",
				meaning: "代表建议的行动方向。",
				coordinates: { x: 480, y: 75 },
			},
			{
				id: 8,
				name: "External Influences",
				meaning: "代表外在影响。",
				coordinates: { x: 480, y: 225 },
			},
			{
				id: 9,
				name: "Hopes and Fears",
				meaning: "代表希望和恐惧。",
				coordinates: { x: 630, y: 75 },
			},
			{
				id: 10,
				name: "Outcome",
				meaning: "代表最终的结果。",
				coordinates: { x: 630, y: 225 },
			},
		],
		cardCount: 10,
		labels: ["综合", "爱情", "事业", "财务"],
	},

	{
		name: "The Horseshoe Spread",
		positions: [
			{
				id: 1,
				name: "Past",
				meaning: "反映了影响当前情况的过去事件或态度。",
				coordinates: { x: 1, y: 1 },
			},
			{
				id: 2,
				name: "Present",
				meaning: "揭示了当前情况或提问者目前的心态。",
				coordinates: { x: 2, y: 1 },
			},
			{
				id: 3,
				name: "Future",
				meaning: "预示了如果保持当前路径，未来可能发展的方向。",
				coordinates: { x: 3, y: 1 },
			},
			{
				id: 4,
				name: "Advice",
				meaning: "提供指导或建议，帮助提问者应对挑战或做出决策。",
				coordinates: { x: 4, y: 2 },
			},
			{
				id: 5,
				name: "External Influences",
				meaning: "指出了提问者可能没有意识到的外部影响或他人的作用。",
				coordinates: { x: 3, y: 3 },
			},
			{
				id: 6,
				name: "Obstacles",
				meaning: "揭示了提问者面临的潜在障碍或挑战。",
				coordinates: { x: 2, y: 3 },
			},
			{
				id: 7,
				name: "Outcome",
				meaning: "展示了基于当前路径和条件，最终可能达到的结果。",
				coordinates: { x: 1, y: 3 },
			},
		],
		cardCount: 7,
		labels: ["马蹄铁", "问题解答", "指导"],
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
				meaning: "代表慈悲和宽容。",
				coordinates: { x: 400, y: 200 }, // Kether下方，第二层
			},
			{
				id: 5,
				name: "Geburah",
				meaning: "代表纪律和挑战",
				coordinates: { x: 400, y: 300 }, // Chesed的右边，第二层
			},
			{
				id: 6,
				name: "Tipheret",
				meaning: "代表平衡和和谐",
				coordinates: { x: 300, y: 400 }, // Kether下方，第三层
			},
			{
				id: 7,
				name: "Netzach",
				meaning: "代表成就和胜利。",
				coordinates: { x: 200, y: 500 }, // Tipheret的左边，第四层
			},
			{
				id: 8,
				name: "Hod",
				meaning: "代表荣耀和骄傲。。",
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
		name: "Five Elements Spread",
		positions: [
			{
				id: 1,
				name: "Metal",
				meaning: "代表逻辑、秩序和结构，以及提问者如何组织生活和思维。",
				coordinates: { x: 180, y: 75 },
			},
			{
				id: 2,
				name: "Wood",
				meaning: "代表成长、扩张和新的开始，以及提问者的发展和创新。",
				coordinates: { x: 30, y: 225 },
			},
			{
				id: 3,
				name: "Water",
				meaning: "代表情感、直觉和内在智慧，以及提问者的情感深度。",
				coordinates: { x: 330, y: 225 },
			},
			{
				id: 4,
				name: "Fire",
				meaning: "代表热情、动力和变革，以及提问者的激情和动力。",
				coordinates: { x: 30, y: 375 },
			},
			{
				id: 5,
				name: "Earth",
				meaning: "代表稳定、实用和耐心，以及提问者在物质世界的基础。",
				coordinates: { x: 330, y: 375 },
			},
		],
		cardCount: 5,
		labels: ["平衡", "自然力量", "内在和谐"],
	},
	{
		name: "Wheel of Fortune Spread",
		positions: [
			{
				id: 1,
				name: "Past",
				meaning: "代表提问者的过去，以及它如何影响当前。",
				coordinates: { x: 180, y: 75 },
			},
			{
				id: 2,
				name: "Present",
				meaning: "代表提问者的当前状态和正在发生的事情。",
				coordinates: { x: 180, y: 225 },
			},
			{
				id: 3,
				name: "Future",
				meaning: "代表提问者的未来和可能出现的机遇或挑战。",
				coordinates: { x: 180, y: 375 },
			},
			{
				id: 4,
				name: "Advice",
				meaning: "提供指导和建议，帮助提问者最好地利用命运之轮。",
				coordinates: { x: 180, y: 525 },
			},
		],
		cardCount: 4,
		labels: ["命运", "周期", "转变"],
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
		name: "Star Spread",
		positions: [
			{
				id: 1,
				name: "Spirit",
				meaning: "代表你的精神生活和个人信仰。",
				coordinates: { x: 2, y: 1 },
			},
			{
				id: 2,
				name: "Work",
				meaning: "涉及你的职业生涯和工作环境。",
				coordinates: { x: 3, y: 2 },
			},
			{
				id: 3,
				name: "Love",
				meaning: "关于你的爱情生活和亲密关系。",
				coordinates: { x: 1, y: 3 },
			},
			{
				id: 4,
				name: "Conflict",
				meaning: "揭示你生活中可能的冲突和挑战。",
				coordinates: { x: 3, y: 3 },
			},
			{
				id: 5,
				name: "Personal",
				meaning: "关于你的个人成长和自我实现。",
				coordinates: { x: 1, y: 2 },
			},
			{
				id: 6,
				name: "Outcome",
				meaning: "基于当前路径，预示未来可能的结果。",
				coordinates: { x: 2, y: 4 },
			},
		],
		cardCount: 6,
		labels: ["全面洞察", "个人成长", "生活指导"],
	},

	{
		name: "Seven Stars Spread",
		positions: [
			{
				id: 1,
				name: "Personal Development",
				meaning: "代表提问者个人成长和发展的方面。",
				coordinates: { x: 180, y: 75 },
			},
			{
				id: 2,
				name: "Challenge",
				meaning: "代表提问者面临的挑战和障碍。",
				coordinates: { x: 30, y: 225 },
			},
			{
				id: 3,
				name: "Mind",
				meaning: "代表提问者的思维方式和心智活动。",
				coordinates: { x: 330, y: 225 },
			},
			{
				id: 4,
				name: "Spirit",
				meaning: "代表提问者的精神生活和内在信念。",
				coordinates: { x: 30, y: 375 },
			},
			{
				id: 5,
				name: "Love",
				meaning: "代表提问者的爱情生活和情感关系。",
				coordinates: { x: 330, y: 375 },
			},
			{
				id: 6,
				name: "Success",
				meaning: "代表提问者在事业或其他追求中的成功和成就。",
				coordinates: { x: 30, y: 525 },
			},
			{
				id: 7,
				name: "Synthesis",
				meaning:
					"代表所有这些方面如何结合在一起，以及提问者如何实现整体的和谐与平衡。",
				coordinates: { x: 330, y: 525 },
			},
		],
		cardCount: 7,
		labels: ["平衡", "个人发展", "挑战"],
	},

	{
		name: "The Zodiac Spread",
		positions: [
			{
				id: 1,
				name: "Aries (Self)",
				meaning: "代表自我、个性和外在表现。",
				coordinates: { x: 180, y: 50 },
			},
			{
				id: 2,
				name: "Taurus (Resources)",
				meaning: "代表财务、物质资源和价值观。",
				coordinates: { x: 230, y: 90 },
			},
			{
				id: 3,
				name: "Gemini (Communication)",
				meaning: "代表沟通、学习和知识交流。",
				coordinates: { x: 280, y: 140 },
			},
			{
				id: 4,
				name: "Cancer (Home)",
				meaning: "代表家庭、情感安全和根基。",
				coordinates: { x: 300, y: 200 },
			},
			{
				id: 5,
				name: "Leo (Pleasure)",
				meaning: "代表创造力、浪漫和享乐。",
				coordinates: { x: 280, y: 260 },
			},
			{
				id: 6,
				name: "Virgo (Health)",
				meaning: "代表健康、日常工作和服务。",
				coordinates: { x: 230, y: 310 },
			},
			{
				id: 7,
				name: "Libra (Partnerships)",
				meaning: "代表合作关系、法律事务和公平。",
				coordinates: { x: 180, y: 350 },
			},
			{
				id: 8,
				name: "Scorpio (Transformation)",
				meaning: "代表变革、性、死亡和再生。",
				coordinates: { x: 130, y: 310 },
			},
			{
				id: 9,
				name: "Sagittarius (Travel)",
				meaning: "代表旅行、哲学和高等教育。",
				coordinates: { x: 80, y: 260 },
			},
			{
				id: 10,
				name: "Capricorn (Career)",
				meaning: "代表事业、社会地位和目标。",
				coordinates: { x: 60, y: 200 },
			},
			{
				id: 11,
				name: "Aquarius (Friendships)",
				meaning: "代表友谊、集体活动和未来的希望。",
				coordinates: { x: 80, y: 140 },
			},
			{
				id: 12,
				name: "Pisces (Subconscious)",
				meaning: "代表潜意识、灵性和秘密。",
				coordinates: { x: 130, y: 90 },
			},
		],
		cardCount: 12,
		labels: ["星座", "生活领域", "个人成长"],
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
