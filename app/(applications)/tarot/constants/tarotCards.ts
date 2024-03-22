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
		id: 0,
		name: "The Fool",
		front: "fool-front.png",
		meaningPositive:
			"精神的纯洁性，新的开始，自由，原始的力量，无拘无束的探索，直觉。",
		meaningReversed: "愚蠢，失去方向，疏忽，不负责任，轻率的决策，不切实际。",
		chineseName: "愚者",
		astrologicalCorrespondence: "天王星", // Golden Dawn中有时会将占星术与塔罗牌联系起来
		elementalCorrespondence: "空气", // Golden Dawn的元素对应
		keywords: "潜力、探索、信任、自由精神、无畏,开始、直觉、冒险、信任",
		summary:
			"愚人牌代表着无限的可能性、新的开始和生命旅程的起点。它象征着勇敢地迈出新步伐，即使未来未知。在金色黎明体系中，这张牌与天王星的创新和自由精神相联系，而空气元素则代表思维的清晰和沟通的能力。这张牌鼓励我们保持开放和好奇的心态，愿意冒险并信任直觉。",
	}),
	createTarotCard({
		id: 1,
		name: "The Magician",
		front: "magician-front.png",
		meaningPositive: "意志力，创造力，自信，灵巧，将潜能转化为实际成果。",
		meaningReversed: "潜力未发挥，意志薄弱，缺乏方向，欺骗，操纵。",
		chineseName: "魔术师",
		astrologicalCorrespondence: "水星", // Golden Dawn中魔术师与水星相对应
		elementalCorrespondence: "空气", // 根据Golden Dawn的元素对应系统
		keywords: "行动、技巧、沟通、创造性、展现潜力",
		summary:
			"魔术师代表了掌握自己命运的能力，以及通过意志力和专注来实现目标的潜力。这张牌象征着在现实世界中将想法转化为行动的力量，同时也提醒我们要诚实地使用这种力量，避免自欺欺人。",
	}),
	createTarotCard({
		id: 2,
		name: "The High Priestess",
		front: "high-priestess-front.png",
		meaningPositive: "直觉，神秘知识，深层意识，内在智慧，沉思。",
		meaningReversed: "隐藏的障碍或秘密，未被揭露的真相，表面知识，忽视直觉。",
		chineseName: "女祭司",
		astrologicalCorrespondence: "月亮", // Golden Dawn中女祭司与月亮相对应
		elementalCorrespondence: "水", // 根据Golden Dawn的元素对应系统
		keywords: "直觉、神秘、潜意识、静默、直觉",
		summary:
			"女祭司代表了直觉的力量和对更深层次知识的访问。这张牌鼓励我们倾听内在的声音，并探索隐藏在表面之下的真相。它象征着智慧和理解，这些往往来自于我们内在的深处，而不是外部的教导。",
	}),
	createTarotCard({
		id: 3,
		name: "The Empress",
		front: "empress-front.png",
		meaningPositive: "丰饶，创造力，生育，美丽，大自然，母性。",
		meaningReversed: "缺乏增长，创造力受阻，家庭纷争，依赖性，财务问题。",
		chineseName: "女皇",
		astrologicalCorrespondence: "金星", // Golden Dawn中女皇与金星相对应
		elementalCorrespondence: "地球", // 根据Golden Dawn的元素对应系统
		keywords: "生育、丰富、感官享受、母亲形象、自然",
		summary:
			"女皇代表了生命的丰饶和创造力的流露。她是大自然的护理者，象征着生育和成长。这张牌鼓励我们欣赏周围的美丽，享受感官的快乐，并且接受创造性的能量。它也代表了母性和关怀的品质。",
	}),
	createTarotCard({
		id: 4,
		name: "The Emperor",
		front: "emperor-front.png",
		meaningPositive: "权威，稳定，结构，控制，父性。",
		meaningReversed: "专制，顽固，缺乏灵活性，滥用权力。",
		chineseName: "皇帝",
		astrologicalCorrespondence: "白羊座", // Golden Dawn中皇帝与白羊座相对应
		elementalCorrespondence: "火", // 根据Golden Dawn的元素对应系统
		keywords: "领导、权威、父亲形象、控制、建立秩序",
		summary:
			"皇帝代表了权威和父性的力量。他象征着稳定性、结构和秩序。这张牌鼓励我们在生活中建立清晰的结构和界限，并且行使领导力。它也提醒我们要以公正和责任感来行使权力。",
	}),
	createTarotCard({
		id: 5,
		name: "The Hierophant",
		front: "hierophant-front.png",
		meaningPositive: "传统，精神指导，宗教信仰，教育，组织。",
		meaningReversed: "独断，狗matism，不宽容，对传统的挑战。",
		chineseName: "教皇",
		astrologicalCorrespondence: "金牛座", // Golden Dawn中教皇与金牛座相对应
		elementalCorrespondence: "地", // 根据Golden Dawn的元素对应系统
		keywords: "教导、传统价值、宗教、形式主义、精神领袖",
		summary:
			"教皇代表了传统知识和组织结构。他象征着精神指导和宗教信仰，以及对传统和教育的尊重。这张牌鼓励我们寻找精神上的指导和遵循社会的规范。它也代表了对传统价值观的坚持和维护。",
	}),
	createTarotCard({
		id: 6,
		name: "The Lovers",
		front: "lovers-front.png",
		meaningPositive: "爱情，和谐，关系，价值选择，决策。",
		meaningReversed: "不和，分离，道德困境，价值观冲突。",
		chineseName: "恋人们",
		astrologicalCorrespondence: "双子座", // Golden Dawn中恋人们与双子座相对应
		elementalCorrespondence: "风", // 根据Golden Dawn的元素对应系统
		keywords: "选择、爱情关系、精神联系、吸引力、重要决策",
		summary:
			"恋人们代表着爱情、吸引力和完美的结合。这张牌强调关系中的和谐与平衡，以及在关系或生活中所做的重要选择。它鼓励我们在决策时考虑个人价值观和道德观，并寻求真正的精神联系。",
	}),
	createTarotCard({
		id: 7,
		name: "The Chariot",
		front: "chariot-front.png",
		meaningPositive: "胜利，意志力，自我控制，勇气，决断。",
		meaningReversed: "失败，缺乏方向，无法控制，侵略性，冲动。",
		chineseName: "战车",
		astrologicalCorrespondence: "巨蟹座", // Golden Dawn中战车与巨蟹座相对应
		elementalCorrespondence: "水", // 根据Golden Dawn的元素对应系统
		keywords: "征服、自我控制、决断力、胜利、行动",
		summary:
			"战车代表着胜利和征服。它象征着通过坚定的意志力和自我控制来克服困难。这张牌鼓励我们保持决断和勇气，以便在面对挑战时能够取得成功。它也提醒我们在追求目标时要保持自律和方向感。",
	}),

	createTarotCard({
		id: 8,
		name: "Strength",
		front: "strength-front.png",
		meaningPositive: "勇气，力量，坚韧，激情，内在力量。",
		meaningReversed: "自我怀疑，缺乏自制力，内在的恐惧。",
		chineseName: "力量",
		astrologicalCorrespondence: "狮子座", // 力量牌在占星术中通常与狮子座相对应
		elementalCorrespondence: "火", // 根据一些传统，力量牌与火元素相对应
		keywords: "勇气、自信、控制、能量、决心",
		summary:
			"力量牌象征着内在的力量和勇气。它代表着通过坚韧和耐心来克服困难，以及以慈悲和理解来驾驭我们内在的激情和冲动。这张牌鼓励我们在面对挑战时保持冷静和自信，并且相信我们有能力影响和塑造我们的环境。",
	}),
	createTarotCard({
		id: 9,
		name: "The Hermit",
		front: "the-hermit-front.png",
		meaningPositive: "内省，寻求知识，智慧，独处，指导。",
		meaningReversed: "孤立，过度内省，拒绝帮助，隐居。",
		chineseName: "隐士",
		astrologicalCorrespondence: "处女座", // 隐士牌在占星术中通常与处女座相对应
		elementalCorrespondence: "土", // 根据一些传统，隐士牌与土元素相对应
		keywords: "智慧、隐退、独立思考、自省、启示",
		summary:
			"隐士牌象征着深入内心的探索和对智慧的追求。它鼓励我们在生活中的某个阶段退一步，进行深刻的自我反思。这张牌也代表着寻找内在真理和意义的旅程，以及可能出现的指导者或导师。",
	}),
	createTarotCard({
		id: 10,
		name: "Wheel of Fortune",
		front: "wheel-of-fortune-front.png",
		meaningPositive: "命运转变，机遇，周期，重大改变。",
		meaningReversed: "不好的运气，抵抗改变，周期的负面影响。",
		chineseName: "命运之轮",
		astrologicalCorrespondence: "木星", // 命运之轮牌在占星术中通常与木星相对应
		elementalCorrespondence: "火", // 根据一些传统，命运之轮牌与火元素相对应
		keywords: "循环、运气、命运、转折点、机遇",
		summary:
			"命运之轮牌象征着生命的循环性和不断变化的命运。它提醒我们，好运和坏运是生活的一部分，而且总是在变化。这张牌鼓励我们接受变化，并且意识到我们每个人都是生命之轮的一部分，我们的行动和决定可以影响我们的命运。",
	}),

	createTarotCard({
		id: 11,
		name: "Justice",
		front: "justice-front.png",
		meaningPositive: "公正，真理，法律，因果律，清晰。",
		meaningReversed: "不公，误判，不诚实，逃避责任。",
		chineseName: "正义",
		astrologicalCorrespondence: "天秤座", // Golden Dawn中正义与天秤座相对应
		elementalCorrespondence: "风", // 根据Golden Dawn的元素对应系统
		keywords: "平衡、责任、真相、法律、公正",
		summary:
			"正义牌代表着公正、平衡和真理。它象征着一个必须做出的重要决定，这个决定将带来长远的后果。这张牌鼓励我们以公正和诚实的态度来处理生活中的事务，并意识到我们行为的因果关系。",
	}),
	createTarotCard({
		id: 12,
		name: "The Hanged Man",
		front: "the-hanged-man-front.png",
		meaningPositive: "自我牺牲，新视角，等待，内省。",
		meaningReversed: "无谓的牺牲，停滞，无法前进。",
		chineseName: "倒吊人",
		astrologicalCorrespondence: "海王星", // 倒吊人牌在占星术中通常与海王星相对应
		elementalCorrespondence: "水", // 根据一些传统，倒吊人牌与水元素相对应
		keywords: "反思、放弃、献身、新观点、等待",
		summary:
			"倒吊人牌象征着自我牺牲、放弃以及从不同的角度看待问题。它通常表示一个时期，其中个人可能需要暂停他们的行动，反思他们的生活，并从新的视角考虑事物。这张牌鼓励我们接受暂时的不便，以获得更深刻的洞察力或精神上的成长。",
	}),
	createTarotCard({
		id: 13,
		name: "Death",
		front: "death-front.png",
		meaningPositive: "转变，结束，转折点，新开始。",
		meaningReversed: "抵抗改变，未完成的事情，无法释怀。",
		chineseName: "死神",
		astrologicalCorrespondence: "天蝎座", // 死神牌在占星术中通常与天蝎座相对应
		elementalCorrespondence: "水", // 根据一些传统，死神牌与水元素相对应
		keywords: "变革、结束、深刻转变、释放、新生",
		summary:
			"死神牌象征着生命中的结束和转变。它通常不是指物理上的死亡，而是指生活中一个阶段的结束和新阶段的开始。这张牌鼓励我们接受变化，放下旧有的东西，以便为新事物腾出空间。它提醒我们，结束是必要的，因为它们为成长和新的机会铺平了道路。",
	}),
	createTarotCard({
		id: 14,
		name: "Temperance",
		front: "temperance-front.png",
		meaningPositive: "平衡，和谐，耐心，适度，自我控制。",
		meaningReversed: "极端，失衡，缺乏耐心，过度自信。",
		chineseName: "节制",
		astrologicalCorrespondence: "射手座", // 节制牌在占星术中通常与射手座相对应
		elementalCorrespondence: "火", // 根据一些传统，节制牌与火元素相对应
		keywords: "调和、整合、中道、健康、调整",
		summary:
			"节制牌象征着平衡和调和。它提醒我们在生活的各个方面寻求中庸之道，避免走向极端。这张牌鼓励我们展现自我控制，耐心地整合对立面，并在情感、思想和行动上寻求和谐。节制牌也与健康和治愈有关，提示我们保持适度，以维持身心健康。",
	}),
	createTarotCard({
		id: 15,
		name: "The Devil",
		front: "the-devil-front.png",
		meaningPositive: "面对自己的阴影面，解放，认识到束缚。",
		meaningReversed: "依赖，束缚，物质主义过度，失去控制。",
		chineseName: "恶魔",
		astrologicalCorrespondence: "摩羯座", // 恶魔牌在占星术中通常与摩羯座相对应
		elementalCorrespondence: "地", // 根据一些传统，恶魔牌与地元素相对应
		keywords: "束缚、诱惑、物质主义、阴影自我、解放",
		summary:
			"恶魔牌象征着束缚和诱惑，通常指向人们在物质或情感上的依赖，以及那些阻碍我们成长的恐惧和不健康的关系。它提醒我们要认识到这些束缚，并寻求解放自己，以便继续前进和成长。",
	}),
	createTarotCard({
		id: 16,
		name: "The Tower",
		front: "the-tower-front.png",
		meaningPositive: "突然的变化，精神觉醒，释放束缚，必要的破坏。",
		meaningReversed: "持续的混乱，恐惧变化，灾难的影响，内在的冲突。",
		chineseName: "塔",
		astrologicalCorrespondence: "火星", // 金色黎明体系中塔牌与火星相对应
		elementalCorrespondence: "火", // 金色黎明体系中塔牌与火元素相对应
		keywords: "革命、揭露、意外事件、深刻的洞察",
		summary:
			"在金色黎明的传统中，塔牌象征着突然的破坏和变化，这些变化通常是由于个人错误或不可持续的结构所导致的。它代表着精神上的觉醒和启示，有时是通过剧烈和痛苦的方式实现的。这张牌鼓励我们接受生命中不可避免的变化，并从中学习和成长。它提醒我们，虽然变化可能是破坏性的，但它也是清除旧有结构，为新生事物铺路的必要过程。塔牌与火星的对应关系强调了这种变化的突然和强烈特性，而与火元素的联系则暗示了变化的净化和转化潜力。",
	}),
	createTarotCard({
		id: 17,
		name: "The Star",
		front: "the-star-front.png",
		meaningPositive: "希望，灵感，宁静，精神的指导。",
		meaningReversed: "失望，缺乏信心，创意受阻。",
		chineseName: "星星",
		astrologicalCorrespondence: "水瓶座", // 星星牌在占星术中通常与水瓶座相对应
		elementalCorrespondence: "空气", // 根据一些传统，星星牌与空气元素相对应
		keywords: "光明、希望、灵性觉醒、慷慨、平静",
		summary:
			"在金色黎明传统中，星星牌象征着希望、灵感和精神的指导。它鼓励我们保持乐观，相信直觉，追随梦想。与水瓶座相联系，星星牌代表创新和人道主义，而其空气元素象征思想清晰和智慧。这张牌是前进道路上的光明指引，提醒我们即使在困难时刻，也有希望和指导存在。",
	}),
	createTarotCard({
		id: 18,
		name: "The Moon",
		front: "the-moon-front.png",
		meaningPositive: "直觉，梦境，内在的启示，面对恐惧。",
		meaningReversed: "混乱，不安，欺骗，幻觉。",
		chineseName: "月亮",
		astrologicalCorrespondence: "巨蟹座", // 月亮牌在占星术中通常与巨蟹座相对应
		elementalCorrespondence: "水", // 月亮牌与水元素相对应
		keywords: "直觉、隐秘、幻想、潜意识",
		summary:
			"月亮牌代表直觉的力量和潜意识的深处。它揭示了隐藏的恐惧和幻想，鼓励我们探索未知并信任直觉。在金色黎明体系中，它与巨蟹座相联系，强调情感和保护的主题，而水元素则象征情感深处和直觉的流动。",
	}),
	createTarotCard({
		id: 19,
		name: "The Sun",
		front: "the-sun-front.png",
		meaningPositive: "活力，成功，幸福，清晰。",
		meaningReversed: "悲观，缺乏自信，不成功。",
		chineseName: "太阳",
		astrologicalCorrespondence: "狮子座", // 太阳牌在占星术中通常与狮子座相对应
		elementalCorrespondence: "火", // 太阳牌与火元素相对应
		keywords: "光明、活力、乐观、成就",
		summary:
			"太阳牌代表着积极的能量、生命力和成功。它象征着明确的目标、幸福感和内在的光明。在金色黎明体系中，太阳牌与狮子座相联系，强调自信和领导力，而火元素则代表激情和活力。这张牌鼓励我们享受生活中的美好时光，并乐观地迎接未来。",
	}),
	createTarotCard({
		id: 20,
		name: "Judgement",
		front: "judgement-front.png",
		meaningPositive: "觉醒，复兴，自我反省，救赎。",
		meaningReversed: "自我怀疑，内疚，拒绝接受过去。",
		chineseName: "审判",
		astrologicalCorrespondence: "冥王星", // 审判牌在占星术中通常与冥王星相对应，象征着深刻的变化和重生
		elementalCorrespondence: "火", // 审判牌与火元素相对应，象征净化和变革
		keywords: "觉醒、重生、决策、反省",
		summary:
			"审判牌代表着生命中的一个重要时刻，需要深刻的自我反省和评估。它鼓励我们听从内心的召唤，做出重要的决策，并准备迎接新的开始。在金色黎明体系中，这张牌与冥王星的变革能量相联系，而火元素则象征着净化和更新。这张牌通常提示我们要对自己的生活做出重大的评估，以便释放过去，迈向更光明的未来。",
	}),
	createTarotCard({
		id: 21,
		name: "The World",
		front: "the-world-front.png",
		meaningPositive: "完成，整合，旅程的结束，庆祝。",
		meaningReversed: "未完成，缺乏闭环，延迟。",
		chineseName: "世界",
		astrologicalCorrespondence: "土星", // 世界牌在占星术中通常与土星相对应，象征着责任、结构和长期的成就
		elementalCorrespondence: "地", // 世界牌与地元素相对应，象征着实际成果和物质世界
		keywords: "完成、成就、和谐、旅程",
		summary:
			"世界牌代表着一个周期的完成和成功的实现。它象征着目标的达成、生活的整合以及个人成长的顶点。在金色黎明体系中，这张牌与土星的稳定和耐心相联系，而地元素则代表着实际成果和物质世界的稳定。这张牌鼓励我们庆祝我们的成就，同时也提醒我们为新的旅程做好准备。",
	}),
	// 权杖王（King of Wands）
	createTarotCard({
		id: "King of Wands",
		name: "King of Wands",
		front: "king-of-wands-front.png",
		meaningPositive: "领导力，魅力，掌控力，创造力。",
		meaningReversed: "暴躁，专横，不成熟。",
		chineseName: "权杖王",
		elementalCorrespondence: "火",
		keywords: "领导、热情、冒险",
		summary:
			"权杖王代表着自信和创造力的领导者。他是一个有魅力的行动者，总是充满热情和动力。在正位时，这张牌鼓励我们采取领导的角色，以自信和创造力来引导他人。逆位时，它可能表明领导风格过于专横或缺乏耐心。",
	}),

	// 权杖皇后（Queen of Wands）
	createTarotCard({
		id: "Queen of Wands",
		name: "Queen of Wands",
		front: "queen-of-wands-front.png",
		meaningPositive: "热情，独立，社交能力，吸引力。",
		meaningReversed: "自私，易怒，控制欲。",
		chineseName: "权杖皇后",
		elementalCorrespondence: "火",
		keywords: "社交、魅力、独立",
		summary:
			"权杖皇后代表着热情和独立的女性能量。她是一个社交高手，能够吸引和激励他人。在正位时，这张牌象征着吸引力和自信。逆位时，可能意味着倾向于情绪化或过于关注自己的需求。",
	}),

	// 权杖骑士（Knight of Wands）
	createTarotCard({
		id: "Knight of Wands",
		name: "Knight of Wands",
		front: "knight-of-wands-front.png",
		meaningPositive: "能量，激情，冒险精神，行动。",
		meaningReversed: "鲁莽，冲动，缺乏方向。",
		chineseName: "权杖骑士",
		elementalCorrespondence: "火",
		keywords: "冒险、动力、激情",
		summary:
			"权杖骑士代表着充满激情和冒险精神的行动者。他追求自己的目标充满动力和热情。在正位时，这张牌鼓励我们勇敢地追求我们的梦想。逆位时，它可能警告我们避免鲁莽和冲动的行为。",
	}),

	// 权杖侍从（Page of Wands）
	createTarotCard({
		id: "Page of Wands",
		name: "Page of Wands",
		front: "page-of-wands-front.png",
		meaningPositive: "好奇心，探索，新的想法，创造力。",
		meaningReversed: "缺乏方向，失望，未能实现的想法。",
		chineseName: "权杖侍从",
		elementalCorrespondence: "火",
		keywords: "探索、创新、激情",
		summary:
			"权杖侍从代表着对新想法和探索的好奇心。他是一个充满创造力和热情的年轻灵魂。在正位时，这张牌鼓励我们追求新的兴趣和想法。逆位时，它可能表示失望或未能将想法转化为行动。",
	}),
	// 权杖王牌（Ace of Wands）
	createTarotCard({
		id: "Ace of Wands",
		name: "Ace of Wands",
		front: "ace-of-wands-front.png",
		meaningPositive: "新的开始，创造力，激情，动力。",
		meaningReversed: "缺乏动力，延迟，挫败感，浪费的潜力。",
		chineseName: "权杖王牌",
		elementalCorrespondence: "火",
		keywords: "新机会、激情、创造",
		summary:
			"权杖王牌象征着生命力、活力和创造力的火花。正位时，它代表一个新的机会或想法即将出现，鼓励我们采取行动并追求我们的目标。逆位时，它可能提示我们需要重新评估我们的计划，或者在追求目标时可能会遇到一些挑战。",
	}),
	// 权杖二（Two of Wands）
	createTarotCard({
		id: "Two of Wands",
		name: "Two of Wands",
		front: "two-of-wands-front.png",
		meaningPositive: "规划未来，个人力量，目标设定。",
		meaningReversed: "恐惧未知，缺乏规划，决策迟疑。",
		chineseName: "权杖二",
		elementalCorrespondence: "火",
		keywords: "未来规划、选择、个人力量",
		summary:
			"权杖二象征着面对未来的规划和选择。正位时，它鼓励我们拓展视野，做出勇敢的选择。逆位时，可能表示对未来的恐惧，或在规划上的迟疑不决。",
	}),

	// 权杖三（Three of Wands）
	createTarotCard({
		id: "Three of Wands",
		name: "Three of Wands",
		front: "three-of-wands-front.png",
		meaningPositive: "展望，增长，扩展视野。",
		meaningReversed: "挫折，延迟，未达预期。",
		chineseName: "权杖三",
		elementalCorrespondence: "火",
		keywords: "展望、探索、扩展",
		summary:
			"权杖三代表着对未来的展望和增长。正位时，它象征着成功的开始和积极的展望。逆位时，可能意味着遇到了挫折或进展不如预期。",
	}),

	// 权杖四（Four of Wands）
	createTarotCard({
		id: "Four of Wands",
		name: "Four of Wands",
		front: "four-of-wands-front.png",
		meaningPositive: "庆祝，稳定，社区。",
		meaningReversed: "缺乏支持，不稳定，家庭冲突。",
		chineseName: "权杖四",
		elementalCorrespondence: "火",
		keywords: "庆祝、和谐、稳定",
		summary:
			"权杖四象征着庆祝和社区的和谐。正位时，它代表着稳定和家庭的幸福。逆位时，可能指向家庭或社区中的不和与冲突。",
	}),

	// 权杖五（Five of Wands）
	createTarotCard({
		id: "Five of Wands",
		name: "Five of Wands",
		front: "five-of-wands-front.png",
		meaningPositive: "竞争，挑战，小冲突。",
		meaningReversed: "避免冲突，压力减轻，寻求解决方案。",
		chineseName: "权杖五",
		elementalCorrespondence: "火",
		keywords: "竞争、挑战、冲突",
		summary:
			"权杖五代表着竞争和挑战。正位时，它可能意味着面临小冲突和健康的竞争。逆位时，可能表示冲突的结束或寻找和平的解决方案。",
	}),

	// 权杖六（Six of Wands）
	createTarotCard({
		id: "Six of Wands",
		name: "Six of Wands",
		front: "six-of-wands-front.png",
		meaningPositive: "胜利，成就，荣誉。",
		meaningReversed: "失败，缺乏认可，自负。",
		chineseName: "权杖六",
		elementalCorrespondence: "火",
		keywords: "胜利、认可、自信",
		summary:
			"权杖六象征着胜利和成就。正位时，它代表着成功和受到他人的认可。逆位时，可能意味着失败或缺乏他人的支持。",
	}),

	// 权杖七（Seven of Wands）
	createTarotCard({
		id: "Seven of Wands",
		name: "Seven of Wands",
		front: "seven-of-wands-front.png",
		meaningPositive: "防御，挑战，坚持。",
		meaningReversed: "疲惫，放弃，被压倒。",
		chineseName: "权杖七",
		elementalCorrespondence: "火",
		keywords: "防御、挑战、坚持",
		summary:
			"权杖七代表着在挑战中的防御和坚持。正位时，它鼓励我们保持立场和勇气。逆位时，可能表示感到疲惫或被压倒。",
	}),

	// 权杖八（Eight of Wands）
	createTarotCard({
		id: "Eight of Wands",
		name: "Eight of Wands",
		front: "eight-of-wands-front.png",
		meaningPositive: "快速行动，进展，消息。",
		meaningReversed: "延迟，挫折，耐心。",
		chineseName: "权杖八",
		elementalCorrespondence: "火",
		keywords: "快速、进展、通讯",
		summary:
			"权杖八象征着快速的行动和进展。正位时，它代表着事情迅速向前发展和即将到来的消息。逆位时，可能意味着遇到延迟或需要更多耐心。",
	}),

	// 权杖九（Nine of Wands）
	createTarotCard({
		id: "Nine of Wands",
		name: "Nine of Wands",
		front: "nine-of-wands-front.png",
		meaningPositive: "坚韧，持久，警惕。",
		meaningReversed: "疲惫，防御过度，悲观。",
		chineseName: "权杖九",
		elementalCorrespondence: "火",
		keywords: "坚持、警惕、持久",
		summary:
			"权杖九代表着坚韧和持久。正位时，它鼓励我们在面对困难时保持坚强和警惕。逆位时，可能表示感到疲惫或防御过度。",
	}),

	// 权杖十（Ten of Wands）
	createTarotCard({
		id: "Ten of Wands",
		name: "Ten of Wands",
		front: "ten-of-wands-front.png",
		meaningPositive: "负担，责任，努力。",
		meaningReversed: "卸下负担，释放压力，寻求帮助。",
		chineseName: "权杖十",
		elementalCorrespondence: "火",
		keywords: "负担、努力、责任",
		summary:
			"权杖十象征着重负和责任。正位时，它可能意味着承担过多的责任或努力。逆位时，可能表示卸下负担或寻找他人的帮助。",
	}),

	// 圣杯侍者（Page of Cups）
	createTarotCard({
		id: "Page of Cups",
		name: "Page of Cups",
		front: "page-of-cups-front.png",
		meaningPositive: "情感消息，直觉，创造性的机会。",
		meaningReversed: "情绪不成熟，失望，缺乏直觉。",
		chineseName: "圣杯侍者",
		elementalCorrespondence: "水",
		keywords: "直觉、好消息、创造性",
		summary:
			"圣杯侍者代表着情感上的消息和直觉的觉醒。正位时，它可能代表着情感的表达或创造性的机会。逆位时，它可能指向情绪上的不成熟或直觉上的阻塞。",
	}),

	// 圣杯骑士（Knight of Cups）
	createTarotCard({
		id: "Knight of Cups",
		name: "Knight of Cups",
		front: "knight-of-cups-front.png",
		meaningPositive: "浪漫追求者，魅力，理想主义。",
		meaningReversed: "不切实际，情绪化，逃避现实。",
		chineseName: "圣杯骑士",
		elementalCorrespondence: "水",
		keywords: "浪漫、魅力、理想主义",
		summary:
			"圣杯骑士代表着浪漫的追求和理想主义。正位时，它象征着魅力和情感上的冒险。逆位时，可能表示情绪上的过度投入或逃避现实的倾向。",
	}),

	// 圣杯皇后（Queen of Cups）
	createTarotCard({
		id: "Queen of Cups",
		name: "Queen of Cups",
		front: "queen-of-cups-front.png",
		meaningPositive: "情感理解，同情心，直觉敏锐。",
		meaningReversed: "情感依赖，心灵封闭，易受伤害。",
		chineseName: "圣杯皇后",
		elementalCorrespondence: "水",
		keywords: "同情、理解、直觉",
		summary:
			"圣杯皇后象征着深刻的情感理解和同情心。正位时，它代表着情感上的支持和直觉的力量。逆位时，可能指向情感上的依赖或心灵的封闭。",
	}),

	// 圣杯国王（King of Cups）
	createTarotCard({
		id: "King of Cups",
		name: "King of Cups",
		front: "king-of-cups-front.png",
		meaningPositive: "情感稳定，慈爱的领导，外交。",
		meaningReversed: "情绪波动，避免冲突，情感操控。",
		chineseName: "圣杯国王",
		elementalCorrespondence: "水",
		keywords: "稳定、外交、领导",
		summary:
			"圣杯国王代表着情感上的成熟和稳定。正位时，它代表着慈爱的领导和外交能力。逆位时，可能指向情绪上的不稳定或避免必要的冲突。",
	}),
	// 圣杯王牌（Ace of Cups）
	createTarotCard({
		id: "Ace of Cups",
		name: "Ace of Cups",
		front: "ace-of-cups-front.png",
		meaningPositive: "新的感情，情感满足，爱情的开始。",
		meaningReversed: "情感上的阻滞，内心封闭，失落的爱。",
		chineseName: "圣杯王牌",
		elementalCorrespondence: "水",
		keywords: "新感情、情感表达、直觉",
		summary:
			"圣杯王牌象征着情感的新开始和内心的充实。正位时，它代表着新的爱情、友谊或情感体验的开始。逆位时，可能指情感上的不满或者感情的流失。",
	}),

	// 圣杯二（Two of Cups）
	createTarotCard({
		id: "Two of Cups",
		name: "Two of Cups",
		front: "two-of-cups-front.png",
		meaningPositive: "伙伴关系，深情的连接，和谐。",
		meaningReversed: "关系失衡，分离，情感冲突。",
		chineseName: "圣杯二",
		elementalCorrespondence: "水",
		keywords: "伙伴关系、和谐、连接",
		summary:
			"圣杯二代表着两人之间的和谐连接和伙伴关系。正位时，它象征着情感上的平衡和满足的关系。逆位时，可能表示关系中的不和谐或冲突。",
	}),

	// 圣杯三（Three of Cups）
	createTarotCard({
		id: "Three of Cups",
		name: "Three of Cups",
		front: "three-of-cups-front.png",
		meaningPositive: "庆祝，友谊，社交活动。",
		meaningReversed: "过度放纵，社交疲劳，疏远。",
		chineseName: "圣杯三",
		elementalCorrespondence: "水",
		keywords: "庆祝、社交、友谊",
		summary:
			"圣杯三象征着社交、庆祝和友谊。正位时，它代表着快乐的聚会和良好的社交关系。逆位时，可能意味着社交活动的过度或友谊之间的疏远。",
	}),

	// 圣杯四（Four of Cups）
	createTarotCard({
		id: "Four of Cups",
		name: "Four of Cups",
		front: "four-of-cups-front.png",
		meaningPositive: "冥想，重新评估，不满。",
		meaningReversed: "新的机会，动力复苏，接受。",
		chineseName: "圣杯四",
		elementalCorrespondence: "水",
		keywords: "内省、冥想、不满",
		summary:
			"圣杯四代表着内心的反思和可能的情感不满。正位时，它可能表示对当前情况的冷漠或不满。逆位时，可能意味着新机会的出现和情感的复苏。",
	}),

	// 圣杯五（Five of Cups）
	createTarotCard({
		id: "Five of Cups",
		name: "Five of Cups",
		front: "five-of-cups-front.png",
		meaningPositive: "失落，悲伤，后悔。",
		meaningReversed: "接受，放下过去，愈合。",
		chineseName: "圣杯五",
		elementalCorrespondence: "水",
		keywords: "失落、悲伤、释放",
		summary:
			"圣杯五象征着失落和悲伤。正位时，它可能指向失去的东西和伴随的情感痛苦。逆位时，它鼓励我们接受现实，开始情感上的愈合过程。",
	}),

	// 圣杯六（Six of Cups）
	createTarotCard({
		id: "Six of Cups",
		name: "Six of Cups",
		front: "six-of-cups-front.png",
		meaningPositive: "怀旧，旧友重逢，无忧无虑。",
		meaningReversed: "被过去束缚，成长，放下。",
		chineseName: "圣杯六",
		elementalCorrespondence: "水",
		keywords: "怀旧、回忆、纯真",
		summary:
			"圣杯六代表着怀旧和对过去美好时光的回忆。正位时，它可能代表旧友重逢或童年的美好记忆。逆位时，可能意味着需要放下过去，向前看。",
	}),

	// 圣杯七（Seven of Cups）
	createTarotCard({
		id: "Seven of Cups",
		name: "Seven of Cups",
		front: "seven-of-cups-front.png",
		meaningPositive: "选择，幻想，愿望。",
		meaningReversed: "决断，现实，清晰的选择。",
		chineseName: "圣杯七",
		elementalCorrespondence: "水",
		keywords: "梦想、选择、幻想",
		summary:
			"圣杯七象征着面临多种选择和可能性。正位时，它可能表示愿望和梦想，但也可能意味着幻想和错觉。逆位时，它鼓励我们做出现实的决定和清晰的选择。",
	}),

	// 圣杯八（Eight of Cups）
	createTarotCard({
		id: "Eight of Cups",
		name: "Eight of Cups",
		front: "eight-of-cups-front.png",
		meaningPositive: "寻求更深层次的意义，放弃，离开。",
		meaningReversed: "迷茫，恐惧改变，停滞。",
		chineseName: "圣杯八",
		elementalCorrespondence: "水",
		keywords: "探索、放弃、寻求",
		summary:
			"圣杯八代表着离开已知的环境去寻求更深层次的满足。正位时，它鼓励我们追求内心的召唤。逆位时，可能表示害怕改变或情感上的停滞。",
	}),

	// 圣杯九（Nine of Cups）
	createTarotCard({
		id: "Nine of Cups",
		name: "Nine of Cups",
		front: "nine-of-cups-front.png",
		meaningPositive: "满足，愿望成真，幸福。",
		meaningReversed: "不满足，物质主义，自满。",
		chineseName: "圣杯九",
		elementalCorrespondence: "水",
		keywords: "满足、愿望、幸福",
		summary:
			"圣杯九象征着情感上的满足和愿望的实现。正位时，它代表着幸福和内心的满足。逆位时，可能指向物质主义或情感上的不满。",
	}),

	// 圣杯十（Ten of Cups）
	createTarotCard({
		id: "Ten of Cups",
		name: "Ten of Cups",
		front: "ten-of-cups-front.png",
		meaningPositive: "家庭幸福，和谐，情感的充实。",
		meaningReversed: "家庭冲突，不和谐，情感的失落。",
		chineseName: "圣杯十",
		elementalCorrespondence: "水",
		keywords: "家庭、和谐、满足",
		summary:
			"圣杯十代表着家庭和情感生活的幸福和和谐。正位时，它象征着情感的充实和幸福的家庭生活。逆位时，可能表示家庭或情感关系中的紧张和不和谐。",
	}),
	// 宝剑侍者（Page of Swords）
	createTarotCard({
		id: "Page of Swords",
		name: "Page of Swords",
		front: "page-of-swords-front.png",
		meaningPositive: "好奇心，求知欲，新的想法。",
		meaningReversed: "诡计，不成熟的行为，谣言。",
		chineseName: "宝剑侍者",
		elementalCorrespondence: "风",
		keywords: "好奇、警觉、学习",
		summary:
			"宝剑侍者代表着好奇心和求知欲。正位时，它可能象征着新的想法或消息。逆位时，可能指向不成熟的行为或诡计。",
	}),

	// 宝剑骑士（Knight of Swords）
	createTarotCard({
		id: "Knight of Swords",
		name: "Knight of Swords",
		front: "knight-of-swords-front.png",
		meaningPositive: "行动，决断力，直面挑战。",
		meaningReversed: "鲁莽，冲动，缺乏方向。",
		chineseName: "宝剑骑士",
		elementalCorrespondence: "风",
		keywords: "行动、决断、勇气",
		summary:
			"宝剑骑士象征着行动和决断力。正位时，它代表直面挑战的勇气。逆位时，可能意味着鲁莽或冲动的行为。",
	}),

	// 宝剑皇后（Queen of Swords）
	createTarotCard({
		id: "Queen of Swords",
		name: "Queen of Swords",
		front: "queen-of-swords-front.png",
		meaningPositive: "智慧，清晰的沟通，独立。",
		meaningReversed: "尖酸刻薄，冷漠，误解。",
		chineseName: "宝剑皇后",
		elementalCorrespondence: "风",
		keywords: "智慧、清晰、直率",
		summary:
			"宝剑皇后代表着智慧和清晰的沟通。正位时，它象征着独立和直率的沟通。逆位时，可能指向尖酸刻薄或冷漠。",
	}),

	// 宝剑国王（King of Swords）
	createTarotCard({
		id: "King of Swords",
		name: "King of Swords",
		front: "king-of-swords-front.png",
		meaningPositive: "权威，战略思维，公正。",
		meaningReversed: "专横，冷酷，操控。",
		chineseName: "宝剑国王",
		elementalCorrespondence: "风",
		keywords: "权威、战略、公正",
		summary:
			"宝剑国王代表着权威和战略思维。正位时，它代表公正和智慧的领导。逆位时，可能意味着专横或冷酷的行为。",
	}),
	// 宝剑王牌（Ace of Swords）
	createTarotCard({
		id: "Ace of Swords",
		name: "Ace of Swords",
		front: "ace-of-swords-front.png",
		meaningPositive: "新的思想，突破，清晰的认识。",
		meaningReversed: "混乱，虚假的开始，误解。",
		chineseName: "宝剑王牌",
		elementalCorrespondence: "风",
		keywords: "突破、清晰、力量",
		summary:
			"宝剑王牌象征着思想上的突破和清晰的认识。正位时，它代表新的开始和智慧的胜利。逆位时，可能指向思维上的混乱或误解。",
	}),

	// 宝剑二（Two of Swords）
	createTarotCard({
		id: "Two of Swords",
		name: "Two of Swords",
		front: "two-of-swords-front.png",
		meaningPositive: "决策，平衡，僵局。",
		meaningReversed: "信息不足，避免决策，压力。",
		chineseName: "宝剑二",
		elementalCorrespondence: "风",
		keywords: "决策、平衡、僵局",
		summary:
			"宝剑二代表着决策和平衡。正位时，它可能表示需要在两个选择之间做出决策。逆位时，可能意味着信息不足或避免必要的决策。",
	}),

	// 宝剑三（Three of Swords）
	createTarotCard({
		id: "Three of Swords",
		name: "Three of Swords",
		front: "three-of-swords-front.png",
		meaningPositive: "心碎，失望，分离。",
		meaningReversed: "愈合，释放，向前看。",
		chineseName: "宝剑三",
		elementalCorrespondence: "风",
		keywords: "心碎、失望、痛苦",
		summary:
			"宝剑三象征着心碎和失望。正位时，它可能代表情感上的痛苦或分离。逆位时，它鼓励愈合和释放过去的痛苦。",
	}),

	// 宝剑四（Four of Swords）
	createTarotCard({
		id: "Four of Swords",
		name: "Four of Swords",
		front: "four-of-swords-front.png",
		meaningPositive: "休息，恢复，沉思。",
		meaningReversed: "活动恢复，准备，压力。",
		chineseName: "宝剑四",
		elementalCorrespondence: "风",
		keywords: "休息、恢复、沉思",
		summary:
			"宝剑四代表着休息和恢复。正位时，它鼓励我们休息和反思。逆位时，可能意味着准备恢复活动或面对压力。",
	}),

	// 宝剑五（Five of Swords）
	createTarotCard({
		id: "Five of Swords",
		name: "Five of Swords",
		front: "five-of-swords-front.png",
		meaningPositive: "冲突，胜利，不道德的胜利。",
		meaningReversed: "和解，避免冲突，悔恨。",
		chineseName: "宝剑五",
		elementalCorrespondence: "风",
		keywords: "冲突、胜利、不道德",
		summary:
			"宝剑五象征着冲突和胜利，但这种胜利可能带来道德上的问题。正位时，它可能代表不道德的胜利。逆位时，可能表示和解或悔恨。",
	}),

	// 宝剑六（Six of Swords）
	createTarotCard({
		id: "Six of Swords",
		name: "Six of Swords",
		front: "six-of-swords-front.png",
		meaningPositive: "过渡，改善，释放负担。",
		meaningReversed: "停滞，无法前进，未解决的问题。",
		chineseName: "宝剑六",
		elementalCorrespondence: "风",
		keywords: "过渡、改善、释放",
		summary:
			"宝剑六代表着过渡和改善。正位时，它象征着从困难中前进和释放负担。逆位时，可能意味着停滞或未解决的问题。",
	}),

	// 宝剑七（Seven of Swords）
	createTarotCard({
		id: "Seven of Swords",
		name: "Seven of Swords",
		front: "seven-of-swords-front.png",
		meaningPositive: "策略，隐秘行动，欺诈。",
		meaningReversed: "坦诚，揭露真相，良心的呼唤。",
		chineseName: "宝剑七",
		elementalCorrespondence: "风",
		keywords: "策略、欺诈、隐秘",
		summary:
			"宝剑七象征着策略和可能的欺诈行为。正位时，它可能代表隐秘的计划或行动。逆位时，可能意味着坦诚或揭露真相。",
	}),

	// 宝剑八（Eight of Swords）
	createTarotCard({
		id: "Eight of Swords",
		name: "Eight of Swords",
		front: "eight-of-swords-front.png",
		meaningPositive: "限制，困境，自我设限。",
		meaningReversed: "解放，找到出路，自我接受。",
		chineseName: "宝剑八",
		elementalCorrespondence: "风",
		keywords: "限制、困境、自我设限",
		summary:
			"宝剑八代表着限制和困境。正位时，它可能象征着感到被困或受限。逆位时，它鼓励解放自己，找到出路。",
	}),

	// 宝剑九（Nine of Swords）
	createTarotCard({
		id: "Nine of Swords",
		name: "Nine of Swords",
		front: "nine-of-swords-front.png",
		meaningPositive: "焦虑，噩梦，内心的痛苦。",
		meaningReversed: "希望，开始愈合，释放恐惧。",
		chineseName: "宝剑九",
		elementalCorrespondence: "风",
		keywords: "焦虑、噩梦、痛苦",
		summary:
			"宝剑九象征着内心的焦虑和痛苦。正位时，它可能代表深夜的噩梦和不安。逆位时，可能意味着开始愈合和释放恐惧。",
	}),

	// 宝剑十（Ten of Swords）
	createTarotCard({
		id: "Ten of Swords",
		name: "Ten of Swords",
		front: "ten-of-swords-front.png",
		meaningPositive: "结束，背叛，痛苦的结局。",
		meaningReversed: "复苏，结束痛苦，接受现实。",
		chineseName: "宝剑十",
		elementalCorrespondence: "风",
		keywords: "结束、背叛、痛苦",
		summary:
			"宝剑十代表着结束和痛苦的结局。正位时，它可能象征着背叛或痛苦的结束。逆位时，它鼓励接受现实，开始复苏。",
	}),

	// 金币侍者（Page of Pentacles）
	createTarotCard({
		id: "Page of Pentacles",
		name: "Page of Pentacles",
		front: "page-of-pentacles-front.png",
		meaningPositive: "学习，机会，财务计划。",
		meaningReversed: "缺乏重点，挥霍，懒惰。",
		chineseName: "金币侍者",
		elementalCorrespondence: "土",
		keywords: "学习、机会、规划",
		summary:
			"金币侍者代表学习和探索财务机会。正位时，它鼓励新的开始和计划。逆位时，可能指向缺乏专注或不切实际。",
	}),

	// 金币骑士（Knight of Pentacles）
	createTarotCard({
		id: "Knight of Pentacles",
		name: "Knight of Pentacles",
		front: "knight-of-pentacles-front.png",
		meaningPositive: "勤奋，可靠，稳健。",
		meaningReversed: "停滞，缺乏动力，固执。",
		chineseName: "金币骑士",
		elementalCorrespondence: "土",
		keywords: "勤奋、可靠、稳健",
		summary:
			"金币骑士代表勤奋和可靠性。正位时，它象征着稳健的进展和努力。逆位时，可能意味着停滞或缺乏动力。",
	}),

	// 金币皇后（Queen of Pentacles）
	createTarotCard({
		id: "Queen of Pentacles",
		name: "Queen of Pentacles",
		front: "queen-of-pentacles-front.png",
		meaningPositive: "慷慨，照顾他人，实际。",
		meaningReversed: "物质主义，忽视他人，过度担忧。",
		chineseName: "金币皇后",
		elementalCorrespondence: "土",
		keywords: "慷慨、照顾、实际",
		summary:
			"金币皇后代表慷慨和照顾他人的能力。正位时，它鼓励实际和关心家庭。逆位时，可能指向物质主义或忽视他人。",
	}),

	// 金币国王（King of Pentacles）
	createTarotCard({
		id: "King of Pentacles",
		name: "King of Pentacles",
		front: "king-of-pentacles-front.png",
		meaningPositive: "成功，财富，商业头脑。",
		meaningReversed: "贪婪，固执，不愿冒险。",
		chineseName: "金币国王",
		elementalCorrespondence: "土",
		keywords: "成功、财富、领导",
		summary:
			"金币国王代表成功和财富。正位时，它象征着商业上的成就和稳定。逆位时，可能意味着过度固执或贪婪。",
	}),

	// 金币王牌（Ace of Pentacles）
	createTarotCard({
		id: "Ace of Pentacles",
		name: "Ace of Pentacles",
		front: "ace-of-pentacles-front.png",
		meaningPositive: "新的财务开始，机会，繁荣。",
		meaningReversed: "错失机会，财务困难，不实际的期望。",
		chineseName: "金币王牌",
		elementalCorrespondence: "土",
		keywords: "机会、繁荣、新开始",
		summary:
			"金币王牌代表新的物质或财务开始。正位时，它象征着机会和繁荣。逆位时，可能指向错失的机会或财务挑战。",
	}),

	// 金币二（Two of Pentacles）
	createTarotCard({
		id: "Two of Pentacles",
		name: "Two of Pentacles",
		front: "two-of-pentacles-front.png",
		meaningPositive: "平衡，多任务处理，适应性。",
		meaningReversed: "失去平衡，压力，过度承诺。",
		chineseName: "金币二",
		elementalCorrespondence: "土",
		keywords: "平衡、适应、灵活",
		summary:
			"金币二代表平衡和多任务处理的能力。正位时，它鼓励适应性和灵活性。逆位时，可能意味着失去平衡或压力过大。",
	}),

	// 金币三（Three of Pentacles）
	createTarotCard({
		id: "Three of Pentacles",
		name: "Three of Pentacles",
		front: "three-of-pentacles-front.png",
		meaningPositive: "团队合作，技能，实现目标。",
		meaningReversed: "缺乏团队合作，无视细节，职业不满。",
		chineseName: "金币三",
		elementalCorrespondence: "土",
		keywords: "合作、技能、成就",
		summary:
			"金币三代表团队合作和技能的应用。正位时，它象征着共同努力实现目标。逆位时，可能指向缺乏协作或职业不满。",
	}),

	// 金币四（Four of Pentacles）
	createTarotCard({
		id: "Four of Pentacles",
		name: "Four of Pentacles",
		front: "four-of-pentacles-front.png",
		meaningPositive: "稳定，储蓄，安全感。",
		meaningReversed: "贪婪，过度节俭，恐惧失去。",
		chineseName: "金币四",
		elementalCorrespondence: "土",
		keywords: "稳定、储蓄、安全",
		summary:
			"金币四代表财务稳定和对安全感的追求。正位时，它鼓励财务规划和储蓄。逆位时，可能意味着贪婪或对失去的恐惧。",
	}),

	// 金币五（Five of Pentacles）
	createTarotCard({
		id: "Five of Pentacles",
		name: "Five of Pentacles",
		front: "five-of-pentacles-front.png",
		meaningPositive: "财务困难，孤独，外部挑战。",
		meaningReversed: "恢复，找到帮助，克服困难。",
		chineseName: "金币五",
		elementalCorrespondence: "土",
		keywords: "困难、缺乏、挑战",
		summary:
			"金币五代表经济上的困难和感觉被遗弃。正位时，它可能指向财务挑战或孤独。逆位时，鼓励寻找帮助和恢复。",
	}),

	// 金币六（Six of Pentacles）
	createTarotCard({
		id: "Six of Pentacles",
		name: "Six of Pentacles",
		front: "six-of-pentacles-front.png",
		meaningPositive: "慷慨，分享，公平交易。",
		meaningReversed: "不平等，自私，债务。",
		chineseName: "金币六",
		elementalCorrespondence: "土",
		keywords: "慷慨、分享、平衡",
		summary:
			"金币六代表慷慨和分享的精神。正位时，它象征着公平的交易和给予。逆位时，可能意味着不平等或自私。",
	}),

	// 金币七（Seven of Pentacles）
	createTarotCard({
		id: "Seven of Pentacles",
		name: "Seven of Pentacles",
		front: "seven-of-pentacles-front.png",
		meaningPositive: "耐心等待，长期投资，收获。",
		meaningReversed: "失望，缺乏长远规划，浪费努力。",
		chineseName: "金币七",
		elementalCorrespondence: "土",
		keywords: "耐心、投资、收获",
		summary:
			"金币七代表耐心和长期投资的成果。正位时，它鼓励等待收获。逆位时，可能指向失望或缺乏规划。",
	}),

	// 金币八（Eight of Pentacles）
	createTarotCard({
		id: "Eight of Pentacles",
		name: "Eight of Pentacles",
		front: "eight-of-pentacles-front.png",
		meaningPositive: "工作勤奋，精湛技艺，专注。",
		meaningReversed: "缺乏专注，低质量工作，不努力。",
		chineseName: "金币八",
		elementalCorrespondence: "土",
		keywords: "勤奋、技艺、专注",
		summary:
			"金币八代表工作的勤奋和专注于技艺。正位时，它鼓励努力和精进。逆位时，可能意味着缺乏专注或不满意的工作。",
	}),

	// 金币九（Nine of Pentacles）
	createTarotCard({
		id: "Nine of Pentacles",
		name: "Nine of Pentacles",
		front: "nine-of-pentacles-front.png",
		meaningPositive: "独立，财务自足，享受成果。",
		meaningReversed: "财务依赖，缺乏自制力，放纵。",
		chineseName: "金币九",
		elementalCorrespondence: "土",
		keywords: "独立、自足、享受",
		summary:
			"金币九代表独立和财务自足。正位时，它象征着享受努力的成果。逆位时，可能指向财务依赖或缺乏自制。",
	}),

	// 金币十（Ten of Pentacles）
	createTarotCard({
		id: "Ten of Pentacles",
		name: "Ten of Pentacles",
		front: "ten-of-pentacles-front.png",
		meaningPositive: "家庭财富，遗产，稳定。",
		meaningReversed: "财务问题，家庭冲突，不稳定。",
		chineseName: "金币十",
		elementalCorrespondence: "土",
		keywords: "财富、稳定、传承",
		summary:
			"金币十代表家庭的财富和稳定。正位时，它象征着遗产和长期的安全。逆位时，可能意味着家庭或财务问题。",
	}),
];
