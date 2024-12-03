import { nanoid } from "nanoid";
import { MultiAgentChatMessage, MultiAgentChatSession } from "./types";
import { getMessageTextContent } from "@/app/utils";
import { api } from "@/app/client/api";
import { strictLLMResult } from "@/app/chains/basic";

interface ServerMessage {
	id: number;
	chat_id: string;
	content: string;
	chat_role: string;
	chat_model: string;
	chat_images: string[];
	function_calls: any[];
	token_counts_total: number;
	object_id: number;
	sender_name: string;
	sender_id: string | null;
	created_at: string;
	updated_at: string;
	user: number;
}

export const mapServerMessageToChatMessage = (
	serverMessage: ServerMessage,
): MultiAgentChatMessage => {
	return {
		id: serverMessage.id.toString(),
		chat_id: serverMessage.chat_id,
		content: serverMessage.content,
		role: serverMessage.chat_role as "system" | "user" | "assistant",
		date: new Date(serverMessage.created_at).toISOString(),
		model: serverMessage.chat_model,
		image_url: serverMessage.chat_images,
		token_counts_total: serverMessage.token_counts_total,
		agentName: serverMessage.sender_name,
		agentId: serverMessage.sender_id,
	};
};

export const createMultiAgentChatMessage = (
	override: Partial<MultiAgentChatMessage>,
): MultiAgentChatMessage => {
	return {
		id: nanoid(),
		date: new Date().toISOString(),
		content: "",
		role: "user",
		streaming: false,
		toolMessages: [],
		preview: false,
		agentId: null,
		agentName: "",
		...override,
	};
};

// 添加 getMessageImages 辅助函数
export const getMessageImages = (message: MultiAgentChatMessage): string[] => {
	if (Array.isArray(message.content)) {
		return message.content
			.filter((content) => content.type === "image_url")
			.map((content) => content.image_url?.url || "")
			.filter(Boolean);
	}
	return message.image_url || [];
};

// 添加常量
export const MULTI_AGENT_DEFAULT_TOPIC = "未定义话题";

export async function getNextAgentFromLLM(
	conversation: MultiAgentChatSession,
	recentMessagesCount: number = 3,
): Promise<number> {
	const agents = conversation.aiConfigs;
	const summary = conversation.memory;
	const recentMessages = conversation.messages.slice(-recentMessagesCount);
	const lastSpeaker = recentMessages[recentMessages.length - 1]?.agentName;

	// 分析最近消息中的直接呼叫
	const directCall = analyzeDirecCall(
		recentMessages[recentMessages.length - 1],
	);

	// 如果有直接呼叫某个角色，优先选择被呼叫的角色
	if (directCall) {
		const calledAgent = agents.findIndex((agent) => agent.name === directCall);
		if (calledAgent !== -1 && agents[calledAgent].name !== lastSpeaker) {
			return calledAgent;
		}
	}

	// 统计最近参与对话的角色
	const recentSpeakers = new Set(recentMessages.map((msg) => msg.agentName));

	const prompt = `作为对话协调者，请为这段对话选择下一个最合适的发言者。

对话总结：
${summary}

当前对话情况：
${recentMessages.map((msg) => `${msg.agentName}: ${msg.content}`).join("\n")}

可选择的AI助手：
${agents
	.map(
		(agent, idx) =>
			`${idx}. ${agent.name}
角色描述: ${agent.description}
`,
	)
	.join("\n")}

选择规则：
1. 避免选择上一个发言者（${lastSpeaker}）
2. 如果对话中有角色直接被点名，应优先考虑该角色
3. 在保持对话流畅的前提下，可以考虑引入新的参与者, 以下是之前对话没有发言的角色: ${agents
		.filter((agent) => !recentSpeakers.has(agent.name))
		.map((agent) => agent.name)
		.join(", ")}
4. 根据对话内容和角色特点选择最合适的发言者
5. 确保对话的自然性和连贯性

请分析对话内容和每个助手的特点，选择最适合的助手来继续对话。
只需返回助手的序号（0-${agents.length - 1}）。`;

	console.log("Prompt:", prompt);
	try {
		const messages = [{ role: "system", content: prompt }];
		const response = await strictLLMResult(messages);

		// 从回复中提取数字
		const match = response.match(/\d+/);
		if (match) {
			const selectedIndex = parseInt(match[0]);
			// 确保返回的索引在有效范围内
			console.log("Selected Index:", selectedIndex);
			return selectedIndex < agents.length ? selectedIndex : 0;
		}

		return 0; // 默认返回第一个代理
	} catch (error) {
		console.error("Error getting next agent from LLM:", error);
		// 发生错误时退回到轮询模式
		return conversation.round % agents.length;
	}
}

// 辅助函数：分析是否有直接呼叫某个角色
function analyzeDirecCall(message: MultiAgentChatMessage): string | null {
	if (!message) return null;
	const content = getMessageTextContent(message);

	// 检测常见的呼叫模式
	const patterns = [/让(.+?)来/, /请(.+?)分享/, /(.+?)你说呢/, /(.+?)怎么看/];

	for (const pattern of patterns) {
		const match = content.match(pattern);
		if (match && match[1]) {
			return match[1];
		}
	}

	return null;
}
