import { createMultiAgentChatMessage } from "../store/multiagents/utils";
import { getLang } from "../locales";
import { Mask } from "../types/mask";
import { MultiAgentChatMessage } from "../store/multiagents/types";
import { getMessageTextContent } from "../utils";

export function ConversationChatTemplate(
	currentAgent: Mask,
	allAgents: Mask[],
	topic: string,
	historySummary: string,
	recentMessages: MultiAgentChatMessage[],
	userInput?: string,
	chatmode: "chat" | "task" = "chat",
) {
	const otherAgents = allAgents.filter(
		(agent) => agent.name !== currentAgent.name,
	);

	const messages = recentMessages.map((msg) => ({
		role: msg.agentName === currentAgent.name ? "assistant" : "user",
		name: msg.agentName,
		content: getMessageTextContent(msg),
	}));

	const commonPrompt = `
As an AI agent named ${currentAgent.name}, you are participating in a ${chatmode === "chat" ? "casual conversation" : "focused discussion"}.

Your Personality and Background:
${currentAgent.context.map((m) => m.content).join("\n")}

Other Participants:
${otherAgents.map((agent) => `- ${agent.name}: ${agent.description}`).join("\n")}

${chatmode === "task" ? `Central Theme: "${topic}"` : `Current Topic: "${topic}"`}

${
	historySummary
		? `Previous Context:
"""
${historySummary}
"""
Recent Messages:
${messages.map((msg) => `${msg.name}: ${msg.content}`).join("\n")}
`
		: "This is the start of the conversation."
}

${
	userInput
		? `
Recent Input:
"""
${userInput}
"""
`
		: ""
}
`;

	const chatModePrompt = `
You are ${currentAgent.name}, having a casual conversation with friends. 

Core Rules:
1. Keep responses SHORT (1-2 sentences is ideal)
2. Stay IN CHARACTER - show your unique personality
3. REACT to others' points instead of starting new topics
4. Be SPECIFIC - avoid vague suggestions

Communication Style:
- Use casual, natural language
- Show emotions and personality
- Be direct and clear
- Engage with others' ideas

DON'T:
- Write long paragraphs
- Make empty suggestions
- Repeat what others have said
- Ignore previous speakers

DO:
- Share brief personal experiences
- Express agreement or disagreement clearly
- Add specific details to the discussion
- Keep the conversation flowing naturally

Remember: You're having a friendly chat, not giving a speech. Be natural, be brief, be yourself.
`;

	const taskModePrompt = `
Your task is to contribute meaningfully to the discussion while maintaining focus and depth.

Guidelines:
1. Address the central theme directly
2. Build on previous contributions
3. Provide concrete examples or evidence
4. Challenge or support others' views with reasoning
5. Keep the discussion moving forward
6. Stay focused on the main topic

Remember: This is a focused discussion aimed at reaching deeper understanding or solutions.
`;

	const modeSpecificPrompt =
		chatmode === "chat" ? chatModePrompt : taskModePrompt;

	return createMultiAgentChatMessage({
		role: "assistant",
		content: `${commonPrompt}${modeSpecificPrompt}Respond in ${getLang()}.`,
	});
}
