import { nanoid } from "nanoid";
import {
	MultiAgentState,
	MultiAgentActions,
	MultiAgentChatMessage,
	MultiAgentChatSession,
	MultimodalContent,
	MultiAgentSelectors,
} from "./types";
import { updateMultiAgentSession } from "../../services/api/chats";
import { Mask } from "@/app/types/mask";
import { contextSummarize } from "../../chains/summarize";
import {
	mapServerMessageToChatMessage,
	getMessageImages,
	createMultiAgentChatMessage,
	MULTI_AGENT_DEFAULT_TOPIC,
	getNextAgentFromLLM,
} from "./utils";
import { estimateTokenLength } from "@/app/utils/chat/token";
import { getMessageTextContent } from "@/app/utils";
import { FileInfo } from "@/app/client/platforms/utils";
import { createChatDataAndFetchId } from "@/app/services/chatService";
import { useUserStore } from "@/app/store/user";
import { createMultiAgentSelectors } from "./selectors";

export const createMultiAgentActions = (
	set: (
		partial:
			| Partial<MultiAgentState>
			| ((state: MultiAgentState) => Partial<MultiAgentState>),
	) => void,
	get: () => MultiAgentState,
): MultiAgentActions => {
	let actions: MultiAgentActions;
	const selectors = createMultiAgentSelectors(get);

	actions = {
		startConversation: (topic: string, conversationId: string) => {
			set((state) => {
				const newConversation: MultiAgentChatSession = {
					id: conversationId,
					aiConfigs: [] as Mask[],
					topic: topic,
					messages: [],
					lastUpdateTime: new Date().getTime(),
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
					memory: "",
					totalRounds: 0,
					round: 0,
					paused: false,
					next_agent_type: "round-robin",
					conversation_mode: "chat",
				};

				const newState = {
					currentConversationId: conversationId,
					conversations: [...state.conversations, newConversation],
				};

				return newState;
			});
			const sortedConvs = selectors.sortedConversations();
			set({ conversations: sortedConvs });
		},
		setCurrentConversationId: (id) => {
			set({ currentConversationId: id });
		},

		addAgent: (conversationId, config) => {
			set((state) => {
				const updatedConversations = state.conversations.map((session) => {
					if (session.id === conversationId) {
						return {
							...session,
							aiConfigs: [...session.aiConfigs, config],
							updated_at: new Date().toISOString(),
							lastUpdateTime: Date.now(),
						};
					}
					return session;
				});

				return { conversations: updatedConversations };
			});
		},

		setAIConfig: (conversationId, agentId, config) => {
			set((state) => {
				const updatedConversations = state.conversations.map((session) => {
					if (session.id === conversationId) {
						const updatedAIConfigs = session.aiConfigs.map(
							(aiConfig, index) => {
								if (index === agentId) {
									return { ...aiConfig, ...config };
								}
								return aiConfig;
							},
						);
						return {
							...session,
							aiConfigs: updatedAIConfigs,
							updated_at: new Date().toISOString(),
							lastUpdateTime: Date.now(),
						};
					}
					return session;
				});
				return { conversations: updatedConversations };
			});
		},

		clearAIConfig: (conversationId, agentId) => {
			set((state) => {
				const updatedConversations = state.conversations.map((session) => {
					if (session.id === conversationId) {
						return {
							...session,
							aiConfigs: session.aiConfigs.filter(
								(_, index) => index !== agentId,
							),
							updated_at: new Date().toISOString(),
							lastUpdateTime: Date.now(),
						};
					}
					return session;
				});
				return { conversations: updatedConversations };
			});
		},

		clearConversation: (conversationId) => {
			set((state) => {
				const updatedConversations = state.conversations.map((session) => {
					if (session.id === conversationId) {
						return {
							...session,
							messages: [],
							round: 0,
							updated_at: new Date().toISOString(),
							lastUpdateTime: Date.now(),
						};
					}
					return session;
				});
				return { conversations: updatedConversations };
			});
		},

		addMessage: (conversationId, message) => {
			set((state) => {
				const updatedConversations = state.conversations.map((session) => {
					if (session.id === conversationId) {
						return {
							...session,
							messages: [...session.messages, message],
							updated_at: new Date().toISOString(),
							lastUpdateTime: Date.now(),
						};
					}
					return session;
				});

				return { conversations: updatedConversations };
			});
		},

		updateTags: (conversationId, tags) => {
			set((state) => {
				const updatedConversations = state.conversations.map((session) => {
					if (session.id === conversationId) {
						return {
							...session,
							selectedTags: tags,
							updated_at: new Date().toISOString(),
							lastUpdateTime: Date.now(),
						};
					}
					return session;
				});

				return { conversations: updatedConversations };
			});
		},

		setTagsData: (tags) => {
			set({ tagsData: tags });
		},

		fetchNewConversations: (data: any[]) => {
			set((state) => {
				const existingConversations = state.conversations;
				const newConversations = data.map((session) => ({
					id: session.id,
					aiConfigs: session.custom_agents_data || [],
					topic: session.session_topic || "未定义话题",
					messages: [],
					lastUpdateTime: Date.parse(session.updated_at),
					created_at: session.created_at,
					updated_at: session.updated_at,
					totalRounds: 0,
					round: 0,
					paused: false,
					next_agent_type: "round-robin" as const,
					conversation_mode: "chat" as const,
					memory: "",
				}));

				const updatedConversations = existingConversations.map((conv) => {
					const newConv = newConversations.find((nc) => nc.id === conv.id);
					if (newConv && newConv.lastUpdateTime > conv.lastUpdateTime) {
						return {
							...conv,
							...newConv,
							aiConfigs: conv.aiConfigs.length
								? conv.aiConfigs
								: newConv.aiConfigs,
						};
					}
					return conv;
				});

				const brandNewConvs = newConversations.filter(
					(nc) => !existingConversations.find((ec) => ec.id === nc.id),
				);

				return {
					conversations: [...updatedConversations, ...brandNewConvs],
				};
			});
		},

		fetchNewMessages: (conversationId: string, messages: any) => {
			set((state) => {
				const updatedConversations = state.conversations.map((session) => {
					if (session.id === conversationId) {
						const newMessages = Array.isArray(messages)
							? messages.map(mapServerMessageToChatMessage)
							: [mapServerMessageToChatMessage(messages)];

						const existingMessagesMap = new Map(
							session.messages.map((msg) => [msg.id, msg]),
						);

						newMessages.forEach((newMsg) => {
							if (existingMessagesMap.has(newMsg.id)) {
								console.log("[Update Existing Message]", newMsg.id, newMsg);
								existingMessagesMap.set(newMsg.id, {
									...existingMessagesMap.get(newMsg.id)!,
									...newMsg,
								});
							} else {
								console.log("[Add New Message]", newMsg.id, newMsg);
								existingMessagesMap.set(newMsg.id, newMsg);
							}
						});

						const updatedMessages = Array.from(existingMessagesMap.values());
						console.log("[Messages Count]", {
							total: updatedMessages.length,
							new: newMessages.length,
							existing: session.messages.length,
						});

						return {
							...session,
							messages: updatedMessages,
							updated_at: new Date().toISOString(),
							lastUpdateTime: Date.now(),
						};
					}
					return session;
				});

				return { conversations: updatedConversations };
			});
		},

		updateSingleMessage: (
			conversationId,
			messageId,
			newMessageContent,
			toolsMessage,
			newMessageId,
		) => {
			set((state) => {
				const updatedConversations = state.conversations.map((session) => {
					if (session.id === conversationId) {
						const updatedMessages = session.messages.map((message) => {
							if (message.id === messageId) {
								return {
									...message,
									id: newMessageId || message.id,
									content: newMessageContent.content,
									toolMessages:
										toolsMessage !== undefined
											? toolsMessage
											: message.toolMessages,
								};
							}
							return message;
						});

						return {
							...session,
							messages: updatedMessages,
							updated_at: new Date().toISOString(),
							lastUpdateTime: Date.now(),
						};
					}
					return session;
				});

				return { conversations: updatedConversations };
			});
		},

		updateMultiAgentsChatsession: (conversationId, updates) => {
			set((state) => {
				const updatedConversations = state.conversations.map((session) => {
					if (session.id === conversationId) {
						return {
							...session,
							...updates,
							updated_at: new Date().toISOString(),
							lastUpdateTime: Date.now(),
						};
					}
					return session;
				});

				return { conversations: updatedConversations };
			});
		},

		putMultiAgentSessionData: async (conversationId) => {
			const state = get();
			const currentSession = state.conversations.find(
				(session) => session.id === conversationId,
			);

			if (!currentSession) {
				throw new Error("Session not found");
			}

			const sessionData = {
				session_topic: currentSession.topic,
				last_update_time: currentSession.lastUpdateTime,
				session_summary: currentSession.memory,
			};

			await updateMultiAgentSession(sessionData, conversationId);
		},

		updateConversation: (conversationId, conversation) => {
			set((state) => {
				const updatedConversations = state.conversations.map((session) =>
					session.id === conversationId ? conversation : session,
				);
				return { conversations: updatedConversations };
			});
		},

		deleteConversation: (conversationId) => {
			set((state) => ({
				conversations: state.conversations.filter(
					(session) => session.id !== conversationId,
				),
			}));
			set((state) => {
				const remainingConversations = state.conversations.filter(
					(session) => session.id !== conversationId,
				);
				return {
					currentConversationId:
						remainingConversations.length > 0
							? remainingConversations[0].id
							: "",
				};
			});
		},

		updateRound: (conversationId) => {
			let newRound = 0;

			set((state) => {
				const updatedConversations = state.conversations.map((session) => {
					if (session.id === conversationId) {
						newRound = session.round + 1;
						return {
							...session,
							round: newRound,
							updated_at: new Date().toISOString(),
							lastUpdateTime: Date.now(),
						};
					}
					return session;
				});

				return { conversations: updatedConversations };
			});

			return { round: newRound };
		},

		summarizeSession: async (conversationId) => {
			const state = get();
			const session = state.conversations.find((s) => s.id === conversationId);
			if (!session) return;

			const historyMessages = selectors.getHistory(conversationId);
			const historyMessageString = historyMessages
				.map((m: MultiAgentChatMessage) => m.content)
				.join("\n");

			if (estimateTokenLength(historyMessageString) < 1000) {
				return "";
			}

			const summary = await contextSummarize(historyMessages, session.memory);

			set((state) => ({
				conversations: state.conversations.map((s) =>
					s.id === conversationId ? { ...s, memory: summary } : s,
				),
			}));

			return summary;
		},

		onUserInput: async (
			content: string,
			attachImages: string[],
			attachFiles: FileInfo[] | undefined,
			session: MultiAgentChatSession,
		) => {
			try {
				const { userMessage, recentMessages } = await actions.handleUserInput(
					content,
					attachImages,
					attachFiles,
					session,
				);

				// 检查当前的 topic 是否是默认 topic
				if (session.topic === "未定义话题") {
					actions.updateMultiAgentsChatsession(session.id, {
						topic: content,
					});
				} else {
					const currentAdditionalInput = session.userAdditionInput || "";
					const updatedAdditionalInput = currentAdditionalInput
						? `${currentAdditionalInput}\n${content}`
						: content;

					actions.updateMultiAgentsChatsession(session.id, {
						userAdditionInput: updatedAdditionalInput,
					});
				}

				// make session unpaused
				actions.updateMultiAgentsChatsession(session.id, { paused: false });
				actions.putMultiAgentSessionData(session.id);

				// Update messages
				actions.addMessage(session.id, userMessage);
			} catch (error) {
				console.error("Error in onUserInput:", error);
				throw error;
			}
		},

		handleUserInput: async (
			content: string,
			attachImages: string[],
			attachFiles: FileInfo[] | undefined,
			session: MultiAgentChatSession,
		) => {
			const sessionId = session.id;
			const { id: userid, nickname } = useUserStore.getState().user;
			const messages: MultiAgentChatMessage[] = [];
			const recentMessages: MultiAgentChatMessage[] = [];

			const contentTokenCount = estimateTokenLength(content);
			const total_token_count = 0;

			const userModel = "userMessage";
			const createChatData = {
				user: userid,
				sessionId: sessionId,
				model: userModel,
				contentType: "multiagentchatsession",
				content: content,
				attachImages: attachImages,
				recentMessages: messages,
				chat_role: "user",
				sender_name: nickname,
				totalTokenCount: total_token_count,
			};

			const { chat_id, id } = await createChatDataAndFetchId(createChatData);

			let mContent: string | MultimodalContent[] = content;

			if (attachImages && attachImages.length > 0) {
				mContent = [
					{
						type: "text" as const,
						text: content,
					},
					...attachImages.map((url) => ({
						type: "image_url" as const,
						image_url: { url },
					})),
				];
			}

			const userMessage: MultiAgentChatMessage = {
				id,
				chat_id,
				role: "user",
				content: mContent,
				image_url: attachImages,
				token_counts_total: total_token_count,
				date: new Date().toISOString(),
				agentId: null,
				agentName: nickname,
			};

			return { userMessage, recentMessages };
		},

		prepareBotMessage: async (sessionId: string) => {
			const session = get().conversations.find((m) => m.id === sessionId);
			if (!session) throw new Error("Session not found");

			const nextAgentIndex = await actions.decideNextAgent(sessionId);
			const selectedAgent = session.aiConfigs[nextAgentIndex];

			if (!selectedAgent) throw new Error("No agent available for response");

			const botMessage: MultiAgentChatMessage = {
				id: nanoid(),
				role: "assistant",
				content: "思考..",
				date: new Date().toISOString(),
				agentId: selectedAgent.id,
				agentName: selectedAgent.name,
				streaming: true,
				preview: false,
				toolMessages: [],
			};

			actions.addMessage(sessionId, botMessage);

			return { botMessage, selectedAgent, nextAgentIndex };
		},

		updateBotMessage: (
			sessionId: string,
			message: MultiAgentChatMessage,
			newMessageId?: string,
		) => {
			const { id: messageId } = message;
			const { toolMessages } = message;

			actions.updateSingleMessage(
				sessionId,
				messageId,
				message,
				toolMessages,
				newMessageId,
			);
		},

		finalizeBotMessage: async (
			sessionId: string,
			message: MultiAgentChatMessage,
		) => {
			const { id: userid } = useUserStore.getState().user;
			const session = get().conversations.find((m) => m.id === sessionId);
			if (!session) throw new Error("Session not found");

			const selectedConfig = session.aiConfigs.find(
				(config) => config.id === message.agentId!,
			);
			const messageModel = selectedConfig?.model || "gpt-4-turbo";

			const createBotChatData = {
				user: userid,
				sessionId: sessionId,
				model: messageModel,
				contentType: "multiagentchatsession",
				content: getMessageTextContent(message),
				attachImages: getMessageImages(message),
				recentMessages: selectors.getHistory(sessionId),
				chat_role: "assistant",
				sender_name: message.agentName,
				sender_id: message.agentId ?? 999,
				totalTokenCount: estimateTokenLength(getMessageTextContent(message)),
			};

			const { chat_id, id } = await createChatDataAndFetchId(createBotChatData);

			const updatedMessage = {
				...message,
				id: id || message.id,
				chat_id: chat_id?.toString() || message.chat_id,
				isFinished: true,
				isTransfered: false,
				token_counts_total: createBotChatData.totalTokenCount,
			};

			actions.updateBotMessage(sessionId, message, updatedMessage.id);
			actions.updateRound(sessionId);
			if (!session.paused) {
				actions.updateMultiAgentsChatsession(sessionId, {
					paused: session.round >= session.totalRounds,
				});
			}
			actions.putMultiAgentSessionData(sessionId);

			return updatedMessage;
		},
		decideNextAgent: async (conversationId: string) => {
			const conversation = selectors.currentSession();

			if (!conversation) throw new Error("Conversation not found");

			const strategy = conversation.next_agent_type;

			const totalAgents = conversation.aiConfigs.length;
			switch (strategy) {
				case "round-robin":
					return conversation.round % totalAgents;
				case "random":
					return Math.floor(Math.random() * totalAgents);
				case "intelligent":
					return await getNextAgentFromLLM(conversation);
				default:
					throw new Error("Unknown strategy");
			}
		},
	};

	return actions;
};
