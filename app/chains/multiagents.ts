import { createMultiAgentChatMessage } from "../store/multiagents";
import { getLang } from "../locales";
import { Mask } from "../types/mask";
export function InitialConversationChatTemplate(
	agent1: Mask,
	agent2: Mask,
	topic: any,
) {
	return createMultiAgentChatMessage({
		role: "user",
		content: `

As a conversational AI with a distinct personality and expertise, you are tasked with engaging in a dialogue that revolves around a central theme, which will guide the direction and purpose of your conversation with another AI. Your responses should be thoughtful, contextually relevant, and reflect your character traits.

AI Identity:
- Name: ${agent1.name}
- Expertise: ${agent1.context.map((m) => m.content).join("\n")}
=====
Counterpart AI Identity:
- Name: ${agent2.name}
- Expertise: ${agent2.context.map((m) => m.content).join("\n")}
=====
The central theme of your dialogue will serve as both the topic and the driving force behind the conversation:

- Central Theme: ${topic}
=====
Your dialogue should be engaging and informative, maintaining a conversational tone that is suitable for the central theme. Ensure that your responses are structured and contribute to a deep and meaningful exploration of the theme.

Language for the dialogue: ${getLang()}

Please proceed with your first reply now, and remember to facilitate a smooth and coherent exchange that showcases your ability to reason and provide nuanced insights within the context of the central theme.

为了避免对话中的重复，请确保您的回应：
1. 提供新的信息或视角，推动对话向前发展。
2. 在可能的情况下，引入相关数据或案例，以支持您的观点。
3. 避免简单地重述对话伙伴的话，而是在此基础上构建和扩展。
4. 如果您注意到对话开始循环，请主动改变话题方向或深入探讨一个细节，以打破重复的模式。
		
`,
	});
}

export function ConversationChatTemplate(
	agent1: Mask,
	agent2: Mask,
	topic: any,
	historysummary: any,
	historyMessagesContent: any,
) {
	return createMultiAgentChatMessage({
		role: "user",
		content: `

As an advanced conversational agent with a unique expertise, you are currently engaged in a dynamic exchange with another conversational agent. Your role is to contribute to the conversation with insights and responses that are not only relevant but also enrich the discussion.

Your Role Expertise:
- Your Name: ${agent1.name}
- Your Expertise: ${agent1.context.map((m) => m.content).join("\n")}

Counterpart Agent:
- Their Name: ${agent2.name}
- Their Expertise: ${agent2.context.map((m) => m.content).join("\n")}

Central Theme of Dialogue:
- Central Theme: ${topic}
=====
To ensure continuity and relevance in your dialogue with the counterpart agent, please review the conversation's progression. The summary provided will help you grasp the key points and context of the ongoing discussion.

Conversation Summary:
${historysummary}
=====
Armed with the detailed conversation history, continue the dialogue with a response that is both reflective of the conversation's depth and cognizant of the nuances within.

Detailed Conversation History:
${historyMessagesContent}
=====
Craft your reply to demonstrate a comprehensive understanding of the conversation's trajectory, keeping in mind the central theme, your role expertise, and the dynamic interplay with your counterpart agent. Your response should seamlessly integrate into the existing dialogue, maintaining the flow and adding value to the exchange.

为了避免对话中的重复，请确保您的回应：
1. 提供新的信息或视角，推动对话向前发展。
2. 在可能的情况下，引入相关数据或案例，以支持您的观点。
3. 避免简单地重述对话伙伴的话，而是在此基础上构建和扩展。
4. 如果您注意到对话开始循环，请主动改变话题方向或深入探讨一个细节，以打破重复的模式。

Always respond in the specified language: ${getLang()}.
		

`,
	});
}
