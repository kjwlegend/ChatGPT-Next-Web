// define a meta proerty type with typescript

export const defaultSEOHeader = {
	title: "小光AI - 专业提示词工程师研发",
	description:
		"小光AI, 由专业提示词工程师打造的AIGC 工具, 专注于文案, 工作流, multi-agents 的人工智能工具",
	keywords: "AI, chatbot, NLP, 小光AI, chatgpt, AIGC",
};

export const pageMetadata: Record<
	string,
	{ title: string; description?: string; keywords?: string }
> = {
	home: {
		title: `${defaultSEOHeader.title}`,
		description: `${defaultSEOHeader.description}`,
		keywords: `${defaultSEOHeader.keywords}`,
	},
	about: {
		title: `关于我们 | ${defaultSEOHeader.title}`,
	},
	chats: {
		title: `对话 |  ${defaultSEOHeader.title}`,
	},
	tarot: {
		title: `黄金黎明塔罗 | ${defaultSEOHeader.title}`,
	},
	"double-agents": {
		title: `双重对话 | ${defaultSEOHeader.title}`,
	},
	"workflow-chats": {
		title: `工作流 | ${defaultSEOHeader.title}`,
	},
	updates: {
		title: `更新日志 | ${defaultSEOHeader.title}`,
	},
};
