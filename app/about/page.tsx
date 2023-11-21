"use client";
import React from "react";
import {
	Card,
	Carousel,
	Layout,
	Row,
	Col,
	Collapse,
	Button,
	Divider,
	Tabs,
} from "antd";
// import { createFromIconfontCN } from '@ant-design/icons';
import type { CollapseProps } from "antd";
import styles from "./intro.module.scss";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
	HomeOutlined,
	LoadingOutlined,
	SettingFilled,
	SmileOutlined,
	SyncOutlined,
} from "@ant-design/icons";
import { relative } from "path";

const { Content } = Layout;

const featureContent = [
	{
		// title: '我们的特点',
		// subtitle: '由专业提示词工程师持续微调的智能助手',
		// description: '我们的小光 AI 智能助手经过由专业提示词工程师持续微调的训练，具备以下特点：',
		background: "/assets/carousel-1.png",
	},
	// Add more feature content objects if needed
	{
		// title: '我们的特点22',
		// subtitle: '由专业提示词工程师持续微调的智能助手',
		// description: '我们的小光 AI 智能助手经过由专业提示词工程师持续微调的训练，具备以下特点：',
		background: "/assets/carousel-2.png",
	},
	{
		// title: '我们的特点22',
		// subtitle: '由专业提示词工程师持续微调的智能助手',
		// description: '我们的小光 AI 智能助手经过由专业提示词工程师持续微调的训练，具备以下特点：',
		background: "/assets/carousel-3.png",
	},
];

const whyChooseUsContent = [
	{
		title: "为什么小光有点",
		colorText: "不一样？",
		subtitle: "由专业提示词工程师持续微调的智能助手",
		blocks: [
			{
				image: "/assets/personal-01.jpg",
				title: "人格赋予",
				content:
					"相比传统聊天机器人，小光提供更有温度, 情感的回答. 让你面对的不再是冰冷的机器, 而是可以信赖的伙伴",
			},
			{
				image: "/assets/personal-02.jpg",
				title: "深度模型调教",
				content:
					"并不是简单的市场上prompts加载, 小光AI的内置预设由专业提示词工程师持续调教，小光 AI 智能助手能够根据用户的意图和需求，提供个性化、有针对性的回答",
			},
			{
				image: "/assets/personal-03.jpg",
				title: "广泛应用场景",
				content:
					"我们的团队持续改进和优化小光 AI 智能助手，适用于各种应用场景，包括但不限于教育、金融、医疗等领域，为不同行业和个人提供智能支持",
			},
			{
				image: "/assets/personal-04.jpg",
				title: "专业个性化输出",
				content:
					"专业行业咨询团队，针对不同行业设定特定角色，加强特定输出，为用户提供与其领域相关的专业建议和信息",
			},
			{
				image: "/assets/personal-05.jpg",
				title: "以你为中心的迭代",
				content:
					"时刻关注用户的反馈和需求，持续改进和优化底层模型和提示词，为用户提供更好的体验和服务",
			},
		],
	},
	// Add more whyChooseUs content objects if needed
];

const differentFromOthersContent = [
	{
		title: "为什么多数平台",
		colorText: "差点意思?",
		cards: [
			{
				title: "通用模型的局限",
				content:
					"通用模型是根据大量的文本数据进行训练的，但它们并没有真正的理解能力。它们只能根据输入的上下文进行模式匹配和统计概率推测，而无法像人类一样理解语义和背景。这可能导致模型在处理复杂或具有歧义的问题时出现困难，无法给出准确的回答。",
			},
			{
				title: "只有简单的角色预设",
				content:
					"多数语言对话平台就像是一个简单的角色扮演游戏，只是加载了一些基本的角色设定, (例如作为文案写手, 作为健身教练 etc.) 作为这些平台使用的语言模型在训练过程中缺少了一些重要的技术和数据支持，因此它们的回答可能显得不够智能。",
			},
			{
				title: "缺乏'LangChain' 技术",
				content:
					"在提示词工程中，'langchain' 是一个术语，指的是在多语言环境下使用不同语言的提示词来引导语言模型生成相应语言的输出。",
			},
			{
				title: "缺乏少样本和零样本训练技术",
				content:
					"'zero-shot' 和 'few-shot' 是训练模型的方式.通过给模型提供少量的示例或样本，让模型尝试解决新的任务。 如果缺乏这种训练方式，模型可能无法根据给定的示例生成相关的回答或文本，导致回答的质量下降。",
			},
			// Add more cards if needed
		],
	},
	// Add more differentFromOthers content objects if needed
];

const whatWeCanDoContent = [
	{
		title: "小光AI智能集成",
		colorText: "All Tools!",
		cards: [
			{
				key: "1",
				title: "搜索引擎",
				content: "同时检索百度和google并返回相关信息",
				icon : (
					<span>
		
				<Image
						src="/assets/search.png"
						alt="feature"
						height={50}
						width={50}
					/>,
					</span>
				) ,
			},
			{
				key: "2",
				title: "网页浏览",
				content: "通过输入网址, 即可针对网页内容进行自动检索和总结 (在网站允许爬虫情况)",
				icon : (
					<span>
		
				<Image
						src="/assets/liulanqi.png"
						alt="feature"
						height={50}
						width={50}
					/>,
					</span>
				) ,
			},
			{
				key: "3",
				title: "知识库查询",
				content: "检索PDF,TXT,Word文件, 基于已有信息进行针对性的对话和生成",
				icon : (
					<span>
		
				<Image
						src="/assets/zhishiku.png"
						alt="feature"
						height={50}
						width={50}
					/>,
					</span>
				) ,
			},
			{
				key: "4",
				title: "绘画接入",
				content: "dalle 3 和midjourney 集成, 用自然语言直接进行图画生成, 免除复杂提示词撰写",
				icon : (
					<span>
		
				<Image
						src="/assets/draw.png"
						alt="feature"
						height={50}
						width={50}
					/>,
					</span>
				) ,
			},
			{
				icon: (
					<span className={styles["icon"]}>
						<Image
							src="/assets/wode.png"
							alt="feature"
							height={50}
							width={50}
						/>{" "}
					</span>
				),
				title: "智能问答",
				content:
					"小光 AI 智能助手能够根据用户的意图和需求，提供个性化、有针对性的回答",
			},
			{
				icon: (
					<span className={styles["icon"]}>
						<Image
							src="/assets/yuyin.png"
							alt="feature"
							height={50}
							width={50}
						/>
					</span>
				),
				title: "语音交互",
				content:
					"提供语音交互的功能，用户可以直接通过语音与小光 AI 智能助手进行交流",
			},
			{
				icon: (
					<span className={styles["icon"]}>
						<Image
							src="/assets/linggan.png"
							alt="feature"
							height={50}
							width={50}
						/>
					</span>
				),
				// icon: <HomeOutlined />,
				title: "图像生成",
				content:
					"基于用户输入的文本，生成对应的图像，生成对应的海报, 产品图片等",
			},
			{
				icon: (
					<span>
						<Image
							src="/assets/baogao.png"
							alt="feature"
							height={50}
							width={50}
						/>
					</span>
				),
				title: "本地检索",
				content:
					"支持上传 PDF, Word, txt 文件, 进行基于本地知识的检索, 查询和总结",
			},
			// Add more cards if needed
		],
	},
	// Add more differentFromOthers content objects if needed
];


const CollapseContent: CollapseProps["items"] = [
	{
		key: "2",
		label: "我如何获得产品的技术支持和帮助?",
		children:
			"您可以通过以下方式获得我们的技术支持和帮助：\n联系我们的客服团队，他们将为您解答问题并提供技术支持。\n参加我们的在线培训课程和研讨会，深入了解产品的使用和技术细节。",
	},
	{
		key: "3",
		label: "产品是否支持与其他系统的集成?",
		children:
			"是的，我们的产品支持与其他系统的集成。我们提供丰富的API和开发工具，使您能够轻松将产品与现有系统进行无缝集成，实现数据共享和功能扩展。",
	},

	{
		key: "5",
		label: "产品是否提供免费试用期或退款政策?",
		children:
			"是的，我们提供免费试用期和灵活的退款政策，以确保您对产品的满意度：\n\n您可以在试用期内免费体验产品的功能和性能。\n如果在购买后的一定时间内您对产品不满意，我们将根据退款政策为您办理退款。",
	},
	{
		key: "6",
		label: "您的产品背后使用的是哪种模型?",
		children:
			"我们的产品背后使用的是基于深度学习的先进模型，其中包括OpenAI的GPT模型（生成式预训练模型）。这种模型具有强大的自然语言处理和理解能力，能够为用户提供准确、连贯的回答和解决方案。",
	},
	{
		key: "7",
		label: "产品是否支持私有化部署?",
		children:
			"是的，我们的产品支持私有化部署。我们理解一些企业和组织对于数据安全和隐私的重视，因此我们提供了私有化部署选项，使您能够在自己的服务器或云环境中运行和管理产品，确保数据的完全控制和保密性。",
	},
];

const contentStyle: React.CSSProperties = {
	margin: 0,
	height: "100%",
	color: "#fff",
	display: "flex",
	flexDirection: "column",
	justifyContent: "center",
	alignContent: "center",
	textAlign: "left",
	padding: "0 50px",
	minHeight: "500px",
	backgroundSize: "contain",
	backgroundRepeat: "no-repeat",
};

const FeatureSection: React.FC = () => {
	return (
		<div className={styles["section"]}>
			<Carousel autoplay dotPosition="bottom" easing="linear" effect="fade">
				{featureContent.map((content, index) => (
					<div key={index}>
						<div className={styles.carousel}>
							<Image
								src={content.background}
								alt="小光ai"
								fill={true}
								objectFit="contain"
							/>
						</div>
					</div>
				))}
			</Carousel>
		</div>
	);
};

const WhyChooseUsSection: React.FC = () => {
	return (
		<div className={`${styles["section"]} ${styles["whydifferent"]}`}>
			{whyChooseUsContent.map((content, index) => (
				<div key={index}>
					<Divider>
						<h2>
							{content.title} <span> {content.colorText} </span>
						</h2>
					</Divider>
					<Row gutter={[16, 16]} justify="space-between" align="middle">
						{content.blocks.map((block, blockIndex) => (
							<React.Fragment key={blockIndex}>
								{blockIndex % 2 === 0 ? (
									<>
										<Col xs={24} sm={24} md={12} lg={12} xl={12}>
											<Image
												// fill={true}
												width={500}
												height={500}
												style={{ objectFit: "contain" }}
												src={block.image}
												alt="Image"
											/>
										</Col>
										<Col xs={24} sm={24} md={12} lg={12} xl={12}>
											<h3>{block.title}</h3>
											<p>{block.content}</p>
										</Col>
									</>
								) : (
									<>
										<Col xs={24} sm={24} md={12} lg={12} xl={12}>
											<h3>{block.title}</h3>
											<p>{block.content}</p>
										</Col>
										<Col xs={24} sm={24} md={12} lg={12} xl={12}>
											<Image
												// fill={true}
												width={500}
												height={500}
												style={{ objectFit: "contain" }}
												src={block.image}
												alt="Image"
											/>
										</Col>
									</>
								)}
							</React.Fragment>
						))}
					</Row>
				</div>
			))}
		</div>
	);
};
const DifferentFromOthersSection: React.FC = () => {
	return (
		<div className={`${styles["section"]} ${styles["differentothers"]}`}>
			{differentFromOthersContent.map((content, index) => (
				<div key={index}>
					<Divider>
						<h2>
							{content.title} <span> {content.colorText} </span>
						</h2>
					</Divider>
					<Row gutter={[16, 16]}>
						{content.cards.map((card, index) => (
							<Col xs={24} sm={24} md={12} lg={12} xl={12} key={index}>
								<Card title={card.title}>
									<p>{card.content}</p>
								</Card>
							</Col>
						))}
					</Row>
				</div>
			))}
			<div className={styles["conclusion"]}>
				现在多数的大语言模型的应用, 例如 chatGPT, Claude, Bard, 百度的文心一言,
				讯飞星火等
				<br />
				在基础训练参数,信息处理能力逻辑推理能力都十分接近
				<br /> 获得更好的结果的关键在于<h3>提示词工程</h3>
			</div>
		</div>
	);
};

const tab1Content = (
	<Row gutter={[16, 16]} align="middle">
		<Col xs={24} sm={24} md={12} lg={12} xl={12}>
			<p>
				除了零样本和少样本提示词技术以外, 小光AI还使用了链式思考
				(Chain-of-Thought Prompting) 技术,
				链式思考（CoT）提示通过中间推理步骤实现了复杂的推理能力。您可以将其与少样本提示相结合，以获得更好的结果，以便在回答之前进行推理的更复杂的任务。
				<a href="https://arxiv.org/abs/2201.11903"> 论文地址</a>
			</p>
		</Col>
		<Col xs={24} sm={24} md={12} lg={12} xl={12}>
			<div style={{ height: 300, position: "relative" }}>
				<Image
					src="/assets/intro-image-1.webp"
					alt="Image"
					fill={true}
					objectFit="cover"
				/>
			</div>
		</Col>
	</Row>
);

const tab2Content = (
	<Row gutter={[16, 16]} align="middle">
		<Col xs={24} sm={24} md={12} lg={12} xl={12}>
			<p>
				对于需要探索或预判战略的复杂任务来说，传统或简单的提示技巧是不够的。最近，Yao
				et el. (2023)(opens in a new tab) 提出了思维树（Tree of
				Thoughts，ToT）框架，该框架基于思维链提示进行了总结，引导语言模型探索把思维作为中间步骤来解决通用问题。使用这种方法，LM
				能够自己对严谨推理过程的中间思维进行评估。
				<a href="https://arxiv.org/abs/2305.10601"> 论文地址</a>
			</p>
		</Col>
		<Col xs={24} sm={24} md={12} lg={12} xl={12}>
			<div style={{ height: 300, position: "relative" }}>
				<Image
					src="/assets/intro-image-2.webp"
					alt="Image"
					fill={true}
					objectFit="cover"
				/>
			</div>
		</Col>
	</Row>
);

const tab3Content = (
	<Row gutter={[16, 16]} align="middle">
		<Col xs={24} sm={24} md={12} lg={12} xl={12}>
			<p>
				思维链（CoT）方法依赖于一组固定的人工注释范例。问题在于，这些范例可能不是不同任务的最有效示例。为了解决这个问题，Diao等人（2023）(opens
				in a new
				tab)最近提出了一种新的提示方法，称为Active-Prompt，以适应LLMs到不同的任务特定示例提示（用人类设计的CoT推理进行注释）。
				<a href="https://arxiv.org/pdf/2302.12246.pdf"> 论文地址</a>
			</p>
		</Col>
		<Col xs={24} sm={24} md={12} lg={12} xl={12}>
			<div style={{ height: 300, position: "relative" }}>
				<Image
					src="/assets/intro-image-3.webp"
					alt="Image"
					fill={true}
					objectFit="cover"
				/>
			</div>
		</Col>
	</Row>
);

const tab4Content = (
	<Row gutter={[16, 16]} align="middle">
		<Col xs={24} sm={24} md={12} lg={12} xl={12}>
			<p>
				当我们将 GPT 的对话界面与编程语言的 shell
				进行类比时，封装的提示可以被视为形成一个函数。这个函数有一个独特的名称，当我们用输入文本调用这个名称时，它根据内部设定的规则产生结果。简而言之，我们构建了一个可重用的提示，它有一个易于与
				GPT 交互的名称。这就像有一个方便的工具，让 GPT 代表我们执行特定的任务 -
				我们只需提供输入，就可以得到所需的输出。
			</p>
		</Col>
		<Col xs={24} sm={24} md={12} lg={12} xl={12}>
			<div style={{ height: 300, position: "relative" }}>
				<Image
					src="/assets/intro-image-4.jpg"
					alt="Image"
					fill={true}
					objectFit="cover"
				/>
			</div>
		</Col>
	</Row>
);

const technicalDetailsContent = [
	{
		title: "小光AI背后的",
		colorText: "技术细节",
		Tabs: [
			{
				key: "1",
				label: "链式思考（CoT）技术",
				content: tab1Content,
			},
			{
				key: "2",
				label: "思维树 (ToT)技术",
				content: tab2Content,
			},
			{
				key: "3",
				label: "Active-Prompt 技术",
				content: tab3Content,
			},
			{
				key: "4",
				label: "提示函数 技术",
				content: tab4Content,
			},
		],
	},
];

const TechnicalDetailsSection: React.FC = () => {
	const onChange = (key: string) => {
		console.log(key);
	};
	return (
		<div className={`${styles["section"]} ${styles["technicaldetails"]}`}>
			{technicalDetailsContent.map((content, index) => (
				<div key={index}>
					<Divider>
						<h2>
							{content.title} <span> {content.colorText} </span>
						</h2>
					</Divider>
					<Tabs
						onChange={onChange}
						type="card"
						size="large"
						centered
						items={content.Tabs.map((tab) => {
							return {
								key: tab.key,
								label: tab.label,
								children: tab.content,
							};
						})}
					/>
				</div>
			))}
		</div>
	);
};

//at.alicdn.com/t/c/font_4149808_p5w7ew7ar7s.js

const WhatWeCanDoSection: React.FC = () => {
	return (
		<div className={`${styles["section"]} ${styles["whatcanwedo"]}`}>
			{whatWeCanDoContent.map((content, index) => (
				<div key={index}>
					<Divider>
						<h2>
							{content.title} <span> {content.colorText} </span>
						</h2>
					</Divider>
					<Row gutter={[16, 16]}>
						{content.cards.map((card, index) => (
							<Col xs={24} sm={24} md={12} lg={6} xl={6} key={index}>
								<Card
									title={card.title}
									cover={card.icon}
									hoverable
									bordered={false}
									headStyle={{
										border: "none",
										fontSize: "20px",
										fontWeight: "bold",
									}}
								>
									<p>{card.content}</p>
								</Card>
							</Col>
						))}
					</Row>
				</div>
			))}
		</div>
	);
};


const CollapseSection: React.FC = () => {
	return (
		<div className={styles["section"]}>
			<Collapse items={CollapseContent} accordion />
		</div>
	);
};

const ChatBlock: React.FC = () => {
	const router = useRouter();

	const startChat = () => {
		router.push("/chats/");
	};
	const register = () => {
		router.push("/auth");
	};

	return (
		<div className={styles["action"]}>
			<h3>立即注册，开始你的聊天之旅！</h3>
			<div>
				<Button
					size="large"
					type="primary"
					onClick={startChat}
					className={styles["blue"]}
				>
					开始对话
				</Button>

				<Button
					size="large"
					type="primary"
					onClick={register}
					className={styles["black"]}
				>
					立即注册
				</Button>
			</div>
		</div>
	);
};
const HomePage: React.FC = () => {
	return (
		<div className={styles["home-page"] + " main"}>
			<Content>
				<FeatureSection />
				<ChatBlock />
				<WhatWeCanDoSection />
				<WhyChooseUsSection />
				<DifferentFromOthersSection />
				<TechnicalDetailsSection />
				<ChatBlock />
				<Divider />
				<CollapseSection />
			</Content>
		</div>
	);
};

export default HomePage;
