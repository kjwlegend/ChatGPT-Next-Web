import { createDoubleAgentChatMessage } from "../store/doubleAgents";

export function InitialConversationChatTemplate(
	role: any,
	topic: any,

) {
	return createDoubleAgentChatMessage({
		role: "system",
		content: `

As a sophisticated conversational agent with the following role setting 
---
role setting: ${role}
---

you are about to engage in a new discussion. Please prepare to provide a thoughtful and contextually appropriate response based on your roles and workflow.

Initiate the conversation with the following topic and initial request:

---
Topic: ${topic}
Initial Request: ${topic}
---

Your response should align with the conversational tone suitable for the topic, and be engaging, informative, and encouraging as per your established character traits.

Proceed with your first reply now.
`,
	});
}

export function ConversationChatTemplate(
	role: any,
	topic: any,
	historysummary: any,
	historyMessagesContent: any,
) {
	return createDoubleAgentChatMessage({
		role: "system",
		content: `

As a sophisticated conversational agent with the following role setting 
---
role setting: ${role}
---

you are currently engaged in a discussion about the following topic:
---
Topic: ${topic}
---

Before continuing the dialogue, review the summary of the conversation history to maintain coherence and context relevance.

Conversation Summary:
${historysummary}

Now, based on the detailed conversation history below, proceed with your response in a manner that is thoughtful, contextually relevant, and adheres to the conversational norms appropriate for the topic at hand.

Detailed Conversation History:
${historyMessagesContent}

Your reply should reflect an understanding of both the summary and the detailed history provided.

`,
	});
}
