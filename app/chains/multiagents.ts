import { createMultiAgentChatMessage } from "../store/multiagents";
import { getLang } from "../locales";
import { Mask } from "../types/mask";

export function ConversationChatTemplate(
	currentAgent: Mask,
	allAgents: Mask[],
	topic: string,
	historySummary: string,
	historyMessagesContent: string,
) {
	const otherAgents = allAgents.filter(
		(agent) => agent.name !== currentAgent.name,
	);

	return createMultiAgentChatMessage({
		role: "assistant",
		content: `
As an AI agent named ${currentAgent.name}, you are participating in a multi-agent conversation. Your task is to contribute meaningfully to the discussion, considering the perspectives of all participants.

Your Expertise:
${currentAgent.context.map((m) => m.content).join("\n")}

Other Participants in the Conversation:
${otherAgents.map((agent) => `- ${agent.name}: ${agent.description} -`).join("\n")}

Central Theme of Dialogue: ${topic}

${
	historySummary
		? `Conversation Summary:
${historySummary}

Recent Messages:
"""
${historyMessagesContent}`
		: "This is the start of the conversation. You may begin the discussion on the central theme."
}
"""

Guidelines for your response:
1. Address the central theme and build upon the existing conversation (if any).
2. Consider the expertise and viewpoints of other agents when formulating your response.
3. Introduce new information, data, or examples to support your points and advance the discussion.
4. Avoid repeating what has already been said; instead, expand on previous points or introduce new angles.
5. If you notice the conversation becoming repetitive, steer it in a new direction or delve deeper into a specific aspect.
6. Maintain a coherent flow with the previous messages (if any) while adding your unique insights.

Remember, there are ${allAgents.length} agents in this conversation, including yourself. Tailor your response to engage with the ideas presented by others and to further the collective understanding of the topic.

Please provide your ${historySummary ? "next contribution" : "opening statement"} to the conversation in ${getLang()}.
		`,
	});
}
