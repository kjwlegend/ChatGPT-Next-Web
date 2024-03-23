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
				coordinates: { x: 80, y: 80 },
			},
			{
				id: 2,
				name: "Choice B",
				meaning: "代表第二个选择的当前状态和潜在结果。",
				coordinates: { x: 280, y: 80 },
			},
			{
				id: 3,
				name: "What You Need to Know",
				meaning: "揭示在做出决策时你需要考虑的关键信息或隐藏因素。",
				coordinates: { x: 180, y: 160 },
			},
			{
				id: 4,
				name: "Advice",
				meaning: "提供关于如何做出最佳决策的指导或建议。",
				coordinates: { x: 180, y: 240 },
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
				coordinates: { x: 80, y: 80 },
			},
			{
				id: 2,
				name: "Choice A - Challenges",
				meaning: "代表第一个选择面临的挑战。",
				coordinates: { x: 80, y: 160 },
			},
			{
				id: 3,
				name: "Choice A - Potential Outcome",
				meaning: "代表第一个选择的潜在结果。",
				coordinates: { x: 80, y: 240 },
			},
			{
				id: 4,
				name: "Choice B - Current Situation",
				meaning: "代表第二个选择当前的情况。",
				coordinates: { x: 280, y: 80 },
			},
			{
				id: 5,
				name: "Choice B - Challenges",
				meaning: "代表第二个选择面临的挑战。",
				coordinates: { x: 280, y: 160 },
			},
			{
				id: 6,
				name: "Choice B - Potential Outcome",
				meaning: "代表第二个选择的潜在结果。",
				coordinates: { x: 280, y: 240 },
			},
			{
				id: 7,
				name: "Advice",
				meaning: "提供关于如何做出最佳决策的指导或建议。",
				coordinates: { x: 180, y: 320 },
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
				coordinates: { x: 80, y: 150 },
			},
			{
				id: 2,
				name: "Choice A - Cons",
				meaning: "代表第一个选择的劣势。",
				coordinates: { x: 80, y: 300 },
			},
			{
				id: 3,
				name: "Choice B - Pros",
				meaning: "代表第二个选择的优势。",
				coordinates: { x: 240, y: 150 },
			},
			{
				id: 4,
				name: "Choice B - Cons",
				meaning: "代表第二个选择的劣势。",
				coordinates: { x: 240, y: 300 },
			},
			{
				id: 5,
				name: "Advice",
				meaning: "提供关于如何做出最佳决策的指导或建议。",
				coordinates: { x: 160, y: 400 },
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
				coordinates: { x: 330, y: 150 },
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
				coordinates: { x: 30, y: 150 },
			},
			{
				id: 4,
				name: "Earth (Physical World)",
				meaning: "代表提问者在物质世界中的存在，包括健康、财务和日常生活。",
				coordinates: { x: 180, y: 295 },
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
				coordinates: { x: 30, y: 250 },
			},
			{
				id: 5,
				name: "Weaknesses",
				meaning: "代表关系中的弱点和需要改进的方面。",
				coordinates: { x: 180, y: 250 },
			},
			{
				id: 6,
				name: "Challenges/Obstacles",
				meaning: "代表当前面临的挑战或障碍。",
				coordinates: { x: 330, y: 250 },
			},
			{
				id: 7,
				name: "Advice",
				meaning: "提供关于如何改善或处理关系的建议。",
				coordinates: { x: 180, y: 415 },
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
				coordinates: { x: 200, y: 175 },
			},
			{
				id: 2,
				name: "Challenge",
				meaning: "代表当前面临的挑战或障碍。",
				coordinates: { x: 230, y: 175 }, // 与当前位置重叠，但通常是横向放置
			},

			{
				id: 3,
				name: "Past",
				meaning: "代表影响当前情况的过去因素。",
				coordinates: { x: 80, y: 175 },
			},
			{
				id: 4,
				name: "Future",
				meaning: "代表即将到来的事件。",
				coordinates: { x: 350, y: 175 },
			},
			{
				id: 5,
				name: "Above",
				meaning: "代表最佳可能的结果。",
				coordinates: { x: 200, y: 0 },
			},
			{
				id: 6,
				name: "Below",
				meaning: "代表潜意识的影响。",
				coordinates: { x: 200, y: 350 },
			},
			{
				id: 7,
				name: "Advice",
				meaning: "代表建议的行动方向。",
				coordinates: { x: 500, y: 400 },
			},
			{
				id: 8,
				name: "External Influences",
				meaning: "代表外在影响。",
				coordinates: { x: 500, y: 250 },
			},
			{
				id: 9,
				name: "Hopes and Fears",
				meaning: "代表希望和恐惧。",
				coordinates: { x: 500, y: 100 },
			},
			{
				id: 10,
				name: "Outcome",
				meaning: "代表最终的结果。",
				coordinates: { x: 500, y: 0 },
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
				coordinates: { x: 10, y: 330 }, // 第一张牌的起始位置
			},
			{
				id: 2,
				name: "Present",
				meaning: "揭示了当前情况或提问者目前的心态。",
				coordinates: { x: 50, y: 180 }, // 第二张牌，考虑到间隙和卡片宽度
			},
			{
				id: 3,
				name: "Future",
				meaning: "预示了如果保持当前路径，未来可能发展的方向。",
				coordinates: { x: 90, y: 30 }, // 第三张牌
			},
			{
				id: 4,
				name: "Advice",
				meaning: "提供指导或建议，帮助提问者应对挑战或做出决策。",
				coordinates: { x: 180, y: 0 }, // 第四张牌，考虑到卡片高度和间隙
			},
			{
				id: 5,
				name: "External Influences",
				meaning: "指出了提问者可能没有意识到的外部影响或他人的作用。",
				coordinates: { x: 270, y: 30 }, // 第五张牌
			},
			{
				id: 6,
				name: "Obstacles",
				meaning: "揭示了提问者面临的潜在障碍或挑战。",
				coordinates: { x: 310, y: 180 }, // 第六张牌
			},
			{
				id: 7,
				name: "Outcome",
				meaning: "展示了基于当前路径和条件，最终可能达到的结果。",
				coordinates: { x: 350, y: 330 }, // 第七张牌
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
				coordinates: { x: 200, y: 0 }, // 顶部中心位置
			},
			{
				id: 2,
				name: "Chokmah",
				meaning: "代表智慧和创造力。",
				coordinates: { x: 100, y: 150 }, // Kether下方左侧
			},
			{
				id: 3,
				name: "Binah",
				meaning: "代表理解力和形式。",
				coordinates: { x: 300, y: 150 }, // Kether下方右侧
			},
			{
				id: 4,
				name: "Chesed",
				meaning: "代表慈悲和宽容。",
				coordinates: { x: 100, y: 300 }, // Chokmah下方左侧
			},
			{
				id: 5,
				name: "Geburah",
				meaning: "代表纪律和挑战。",
				coordinates: { x: 300, y: 300 }, // Binah下方右侧
			},
			{
				id: 6,
				name: "Tipheret",
				meaning: "代表平衡和和谐。",
				coordinates: { x: 200, y: 450 }, // Chesed和Geburah之间
			},
			{
				id: 7,
				name: "Netzach",
				meaning: "代表成就和胜利。",
				coordinates: { x: 100, y: 600 }, // Tipheret下方左侧
			},
			{
				id: 8,
				name: "Hod",
				meaning: "代表荣耀和骄傲。",
				coordinates: { x: 300, y: 600 }, // Tipheret下方右侧
			},
			{
				id: 9,
				name: "Yesod",
				meaning: "代表基础和潜意识。",
				coordinates: { x: 200, y: 750 }, // Netzach和Hod之间
			},
			{
				id: 10,
				name: "Malkuth",
				meaning: "代表物质世界和实际成果。",
				coordinates: { x: 200, y: 900 }, // 底部中心位置
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
		name: "五行牌阵",
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
				coordinates: { x: 60, y: 375 },
			},
			{
				id: 5,
				name: "Earth",
				meaning: "代表稳定、实用和耐心，以及提问者在物质世界的基础。",
				coordinates: { x: 300, y: 375 },
			},
		],
		cardCount: 5,
		labels: ["平衡", "自然力量", "内在和谐"],
	},
	{
		name: "Western Five Elements Spread",
		positions: [
			{
				id: 1,
				name: "Earth",
				meaning: "代表稳定、实用和耐心，以及提问者在物质世界的基础和实际需求。",
				coordinates: { x: 60, y: 375 },
			},

			{
				id: 2,
				name: "Water",
				meaning: "代表情感、直觉和内在智慧，以及提问者的情感深度和直觉。",
				coordinates: { x: 330, y: 225 },
			},
			{
				id: 3,
				name: "Fire",
				meaning: "代表热情、动力和变革，以及提问者的激情和动力。",
				coordinates: { x: 300, y: 375 },
			},

			{
				id: 4,
				name: "Air",
				meaning: "代表思维、沟通和知识，以及提问者的思想和沟通方式。",
				coordinates: { x: 30, y: 225 },
			},
			{
				id: 5,
				name: "Spirit",
				meaning: "代表精神、统一和超越，以及提问者的精神生活和更高自我。",
				coordinates: { x: 180, y: 75 },
			},
		],
		cardCount: 5,
		labels: ["精神", "追求", "探索"],
	},

	{
		name: "The Star Spread",
		positions: [
			{
				id: 1,
				name: "Central",
				meaning: "代表问题或情况的中心。",
				coordinates: { x: 180, y: 75 },
			},
			{
				id: 2,
				name: "Self",
				meaning: "代表提问者的当前状态或自我感受。",
				coordinates: { x: 280, y: 150 },
			},
			{
				id: 3,
				name: "Challenge",
				meaning: "代表提问者面临的挑战或障碍。",
				coordinates: { x: 360, y: 250 },
			},
			{
				id: 4,
				name: "Past",
				meaning: "代表过去的影响或已经发生的事件。",
				coordinates: { x: 280, y: 350 },
			},
			{
				id: 5,
				name: "Future",
				meaning: "代表未来可能的发展或结果。",
				coordinates: { x: 180, y: 450 },
			},
			{
				id: 6,
				name: "Willpower",
				meaning: "代表提问者的意志力和决心。",
				coordinates: { x: 80, y: 350 },
			},
			{
				id: 7,
				name: "Advice",
				meaning: "提供给提问者的建议或指导。",
				coordinates: { x: 20, y: 250 },
			},
			{
				id: 8,
				name: "Hope",
				meaning: "代表提问者的希望和愿望。",
				coordinates: { x: 80, y: 150 },
			},
			{
				id: 9,
				name: "Outcome",
				meaning: "代表问题的最终结果或解决方案。",
				coordinates: { x: 180, y: 250 },
			},
		],
		cardCount: 9,
		labels: ["爱情", "事业", "健康", "财务", "家庭", "精神", "人际关系"],
	},
	{
		name: "Star Spread",
		positions: [
			{
				id: 1,
				name: "Spirit",
				meaning: "代表你的精神生活和个人信仰。",
				coordinates: { x: 200, y: 100 },
			},
			{
				id: 2,
				name: "Work",
				meaning: "涉及你的职业生涯和工作环境。",
				coordinates: { x: 300, y: 200 },
			},
			{
				id: 3,
				name: "Love",
				meaning: "关于你的爱情生活和亲密关系。",
				coordinates: { x: 100, y: 300 },
			},
			{
				id: 4,
				name: "Conflict",
				meaning: "揭示你生活中可能的冲突和挑战。",
				coordinates: { x: 300, y: 300 },
			},
			{
				id: 5,
				name: "Personal",
				meaning: "关于你的个人成长和自我实现。",
				coordinates: { x: 100, y: 200 },
			},
			{
				id: 6,
				name: "Outcome",
				meaning: "基于当前路径，预示未来可能的结果。",
				coordinates: { x: 200, y: 400 },
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
				coordinates: { x: 215, y: 50 },
			},
			{
				id: 2,
				name: "Taurus (Resources)",
				meaning: "代表财务、物质资源和价值观。",
				coordinates: { x: 300, y: 90 },
			},
			{
				id: 3,
				name: "Gemini (Communication)",
				meaning: "代表沟通、学习和知识交流。",
				coordinates: { x: 350, y: 140 },
			},
			{
				id: 4,
				name: "Cancer (Home)",
				meaning: "代表家庭、情感安全和根基。",
				coordinates: { x: 390, y: 200 },
			},
			{
				id: 5,
				name: "Leo (Pleasure)",
				meaning: "代表创造力、浪漫和享乐。",
				coordinates: { x: 350, y: 260 },
			},
			{
				id: 6,
				name: "Virgo (Health)",
				meaning: "代表健康、日常工作和服务。",
				coordinates: { x: 300, y: 310 },
			},
			{
				id: 7,
				name: "Libra (Partnerships)",
				meaning: "代表合作关系、法律事务和公平。",
				coordinates: { x: 215, y: 350 },
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
				coordinates: { x: 50, y: 200 },
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
];
