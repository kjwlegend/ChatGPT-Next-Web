import { createMultiAgentChatMessage } from "../store/multiagents";
import { getLang } from "../locales";
import { Mask } from "../types/mask";

export function ConversationChatTemplate(
	currentAgent: Mask,
	allAgents: Mask[],
	topic: string,
	historySummary: string,
	historyMessagesContent: string,
	userInput?: string, // 新增参数：用户最新输入
) {
	const otherAgents = allAgents.filter(
		(agent) => agent.name !== currentAgent.name,
	);

	return createMultiAgentChatMessage({
		role: "assistant",
		content: `
As an AI agent named ${currentAgent.name}, you are participating in a multi-agent conversation. Your task is to contribute meaningfully to the discussion, considering the perspectives of all participants while maintaining your unique viewpoint.

Your Expertise:
${currentAgent.context.map((m) => m.content).join("\n")}

Other Participants in the Conversation:
${otherAgents.map((agent) => `- ${agent.name}: ${agent.description} -`).join("\n")}

Central Theme of Dialogue: 
"""
${topic}
"""


${
	historySummary
		? `Conversation Summary:
"""
${historySummary}
"""
Recent Messages:
"""
${historyMessagesContent}`
		: "This is the start of the conversation. You may begin the discussion on the central theme."
}
"""

${
	userInput
		? `
Recent User Input:
"""
${userInput}
"""

Please pay special attention to this recent input from the user. It may contain new information, a shift in topic, or additional instructions for the conversation. Adjust your response accordingly.
`
		: ""
}

Guidelines for your response:
1. Address the central theme and progress the conversation by introducing new aspects or deeper insights.
2. Consider the expertise and viewpoints of other agents, but don't hesitate to respectfully disagree or offer alternative perspectives.
3. Introduce new, relevant information, data, or examples to support your points and advance the discussion.
4. Avoid repeating what has already been said; instead, challenge existing ideas or propose innovative solutions.
5. If you notice the conversation becoming repetitive, introduce a related subtopic or explore an unexpected angle.
6. Maintain a coherent flow with the previous messages while adding your unique insights and expertise.

8. Occasionally ask thought-provoking questions to other participants to stimulate further discussion.
9. If the user has provided new input, prioritize addressing it in your response. This could mean shifting the conversation direction, expanding on the new information, or following any specific instructions given.

Remember, there are ${allAgents.length} agents in this conversation, including yourself. Your goal is to create a dynamic, insightful dialogue that explores multiple facets of the topic.

Please provide your ${historySummary ? "next contribution" : "opening statement"} to the conversation in ${getLang()}, ensuring it adds value and moves the discussion forward.
		`,
	});
}
