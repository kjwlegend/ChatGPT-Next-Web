import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ChatMessage, ChatSession } from "../types/chat";

import { useUserStore } from "./user";
import { nanoid } from "nanoid";
import { Chat } from "../(chat-pages)/chats/chat/main";
import { getMessagesWithMemory } from "../(chat-pages)/chats/chat/inputpanel/utils/chatMessage";
import { estimateTokenLength } from "../utils/chat/token";
import {
	createChatDataAndFetchId,
	handleChatCallbacks,
	sendChatMessage,
} from "../services/chatService";
import { MultimodalContent } from "../client/api";
import { createMessage } from "./chat";
import { FileInfo } from "../client/platforms/utils";
import { message } from "antd";

import { WorkflowGroup, workflowChatSession } from "../types/workflow";
import { createChat } from "../api/backend/chat";
import { getMessageImages, getMessageTextContent } from "../utils";
import _ from "lodash";

type State = {
	workflowGroups: WorkflowGroup[];
	workflowGroupIndex: { [groupId: string]: number }; // 索引对象
	workflowSessions: workflowChatSession[];
	workflowSessionsIndex: { [groupId: string]: any[] };
	selectedId: string;
	setSelectedId: (groupId: string) => void;
	addWorkflowGroup: (groupId: string, groupName: string) => void;
	updateWorkflowGroup: (
		groupId: string,
		updates: Partial<WorkflowGroup>,
	) => void;

	deleteWorkflowGroup: (groupId: string | number) => void;
	fetchNewWorkflowGroup: (data: Array<WorkflowGroup>) => void;
	sortWorkflowGroups: () => void;
	addSessionToGroup: (groupId: string, session: ChatSession) => void;
	updateWorkflowSession: (
		groupId: string,
		sessionId: string,
		updates: Partial<workflowChatSession>,
	) => void;

	moveSession: (
		groupId: string,
		sourceIndex: number,
		destinationIndex: number,
	) => void;
	deleteSessionFromGroup: (groupId: string, sessionId: string) => void;
	getNextSession: (sessionId: string) => workflowChatSession | undefined;
	getWorkflowSessionId: (groupId: string) => string[];
	getCurrentWorkflowGroup: (selectedId: string) => WorkflowGroup | null;
	onUserInput: (
		content: string,
		attachImages: string[],
		attachFiles: FileInfo[] | undefined,
		session: workflowChatSession,
	) => Promise<void>;
	onNewMessage: (
		message: ChatMessage[],
		workflowChatSession: workflowChatSession,
	) => void;
	getMessages: (sessionId: string) => ChatMessage[];
	sendMessagetoNextSession: (sessionId: string, message: ChatMessage) => void;
	updatedChatMessage: (sessionId: string, message: string) => void;
	clearWorkflowData: () => void;
};

export const useWorkflowStore = create<State>()(
	persist(
		(set, get) => ({
			workflowGroups: [],
			workflowGroupIndex: {},
			selectedId: "",
			setSelectedId: (groupId) => {
				// console.log("workflow setselectedid", groupId);
				set({ selectedId: groupId });
			},
			workflowSessions: [],
			workflowSessionsIndex: {},
			addWorkflowGroup: (groupId, topic) => {
				const newGroup: WorkflowGroup = {
					id: groupId,
					topic: topic,
					chat_session_ids: [],
					agent_numbers: 0,
					summary: "",
					description: "等待你创作无限的可能",
					lastUpdateTime: new Date().getTime(),
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				};

				set((state) => {
					const newIndex = state.workflowGroups.length;
					return {
						workflowGroups: [...state.workflowGroups, newGroup],
						workflowGroupIndex: {
							...state.workflowGroupIndex,
							[groupId]: newIndex,
						},
					};
				});
				get().setSelectedId(groupId);
				get().sortWorkflowGroups();
			},
			updateWorkflowGroup: (groupId, updates) => {
				// console.log("store debug:updateWorkflowGroup", groupId, updates);
				set((state) => {
					const index = state.workflowGroupIndex[groupId];
					if (index === undefined) return state;

					const updatedGroup = {
						...state.workflowGroups[index],
						...updates,
					};
					const updatedGroups = [...state.workflowGroups];
					updatedGroups[index] = updatedGroup;
					return { workflowGroups: updatedGroups };
				});
				get().sortWorkflowGroups();
			},

			deleteWorkflowGroup: (groupId) => {
				set((state) => {
					const index = state.workflowGroupIndex[groupId];
					if (index === undefined) return state;

					// 删除 workflowGroups 中的特定 group
					const updatedGroups = state.workflowGroups.filter(
						(_, i) => i !== index,
					);

					// 更新 workflowGroupIndex
					const updatedIndex: { [key: string]: number } = {};
					updatedGroups.forEach((group, i) => {
						updatedIndex[group.id] = i;
					});

					// 删除与 groupId 相关的 workflowSessions
					const updatedSessions = state.workflowSessions.filter(
						(session) => session.workflow_group_id !== groupId,
					);

					// 删除 workflowSessionsIndex 中的特定 group
					const { [groupId]: _, ...updatedSessionsIndex } =
						state.workflowSessionsIndex;

					return {
						workflowGroups: updatedGroups,
						workflowGroupIndex: updatedIndex,
						workflowSessions: updatedSessions,
						workflowSessionsIndex: updatedSessionsIndex,
					};
				});

				if (Object.keys(get().workflowGroupIndex).length === 0) {
					get().setSelectedId("");
				}

				if (get().selectedId === groupId) {
					const firstGroup = get().workflowGroups[0]?.id || "";
					get().setSelectedId(firstGroup);
				}
			},
			fetchNewWorkflowGroup: (data: WorkflowGroup[]) => {
				const existingGroups = get().workflowGroups;
				const existingIndex = get().workflowGroupIndex;

				const updatedGroups = [...existingGroups]; // 创建一个新的工作组数组
				const updatedIndex = { ...existingIndex }; // 创建一个新的索引对象

				data.forEach((item) => {
					const {
						id,
						session_id,
						session_topic,
						session_description,
						session_summary,
						agent_numbers,
						chat_groups,
						updated_at,
						created_at,
					} = item;

					// Convert updated_at string to Date timestamp
					const lastUpdateTime = new Date(updated_at).getTime();
					const existingGroupIndex = existingIndex[id];

					const newGroup = {
						id,
						topic: session_topic,
						summary: session_summary,
						description: session_description,
						created_at: created_at,
						updated_at: updated_at,
						agent_numbers: agent_numbers,
						lastUpdateTime,
						chat_session_ids: chat_groups !== undefined ? chat_groups : [],
						sessions: [],
					};

					if (existingGroupIndex === undefined) {
						updatedGroups.push(newGroup);
						updatedIndex[id] = updatedGroups.length - 1; // 更新索引以指向新组
					} else {
						// 如果该组已存在，进行合并操作
						// console.log(
						// 	"store debug:existing group",
						// 	existingGroupIndex,
						// 	newGroup,
						// );
						updatedGroups[existingGroupIndex] = {
							...updatedGroups[existingGroupIndex],
							...newGroup, // 合并新组的属性
							lastUpdateTime, // 确保更新时间被更新
							chat_session_ids: [
								...new Set([
									...updatedGroups[existingGroupIndex].chat_session_ids,
									...newGroup.chat_session_ids,
								]), // 合并 chat_session_ids 并去重
							],
							sessions: updatedGroups[existingGroupIndex].sessions || [],
						};
					}
				});

				set(() => ({
					workflowGroups: updatedGroups,
					workflowGroupIndex: updatedIndex,
				}));
				get().sortWorkflowGroups();
			},

			sortWorkflowGroups: () => {
				set((state) => {
					const sortedGroups = state.workflowGroups.sort(
						(a, b) =>
							new Date(b.lastUpdateTime).getTime() -
							new Date(a.lastUpdateTime).getTime(),
					);

					// 重新构建索引以匹配排序后的数组
					const newIndex: { [key: string]: number } = {};
					sortedGroups.forEach((group, index) => {
						newIndex[group.id] = index;
					});

					return {
						workflowGroups: sortedGroups,
						workflowGroupIndex: newIndex, // 更新索引为新的顺序
					};
				});
			},
			addSessionToGroup: (groupId: string, session: ChatSession) => {
				set((state) => {
					const index = state.workflowGroupIndex[groupId];
					if (index === undefined) return state;

					//  判断当前的order , 如果还没有存在workflowSessionsIndex[groupId] 则初始化
					const sessions = state.workflowSessionsIndex[groupId] || [];

					// 将 workflow_group_id 添加到 session
					const newSession: workflowChatSession = {
						...session,
						workflow_group_id: groupId,
						order: sessions.length,
						isworkflow: true,
						enableAutoFlow: true,
					};

					// 确保 newSession.id 存在
					if (newSession.id === undefined) {
						console.error("newSession.id is undefined");
						return state;
					}

					// 更新 workflowSessions
					const updatedSessions = [...state.workflowSessions, newSession];

					// 获取新添加的 session 的 ID
					const newSessionId = newSession.id;

					// 更新 workflowSessionsIndex
					const updatedSessionsIndex = {
						...state.workflowSessionsIndex,
						[groupId]: [
							...(state.workflowSessionsIndex[groupId] || []),
							newSessionId,
						],
					};

					return {
						workflowSessions: updatedSessions,
						workflowSessionsIndex: updatedSessionsIndex,
					};
				});
			},
			updateWorkflowSession: (
				groupId: string,
				sessionId: string,
				updates: Partial<workflowChatSession>,
			) => {
				set((state) => {
					const groupIndex = state.workflowGroupIndex[groupId];
					if (groupIndex === undefined) {
						console.log("Group index not found");
						return state;
					}

					const sessionIndex = state.workflowSessions.findIndex(
						(session) =>
							session.id === sessionId && session.workflow_group_id === groupId,
					);
					if (sessionIndex === -1) {
						console.log("Session index not found");
						return state;
					}
					const currentSession = state.workflowSessions[sessionIndex];
					const updatedSession = { ...currentSession, ...updates };
					const updatedSessions = [...state.workflowSessions];
					updatedSessions[sessionIndex] = updatedSession;

					return {
						workflowSessions: updatedSessions,
					};
				});
			},

			moveSession: (groupId, sourceIndex, destinationIndex) => {
				set((state) => {
					const groupIndex = state.workflowGroupIndex[groupId];
					if (groupIndex === undefined) return state;

					// 获取该 groupId 下的所有 sessions 的索引
					const sessionIds = state.workflowSessionsIndex[groupId];
					if (!sessionIds) return state;

					if (
						sourceIndex < 0 ||
						sourceIndex >= sessionIds.length ||
						destinationIndex < 0 ||
						destinationIndex >= sessionIds.length
					) {
						return state;
					}

					// console.log(
					// 	"sourceIndex",
					// 	sourceIndex,
					// 	"destinationIndex",
					// 	destinationIndex,
					// );

					// 移动 session
					const newSessionIds = [...sessionIds];
					const [removed] = newSessionIds.splice(sourceIndex, 1);
					newSessionIds.splice(destinationIndex, 0, removed);

					// 更新 order 属性
					const updatedSessions = state.workflowSessions.map((session) => {
						if (session.workflow_group_id === groupId) {
							const newIndex = newSessionIds.indexOf(session.id);
							return { ...session, order: newIndex };
						}
						return session;
					});

					// 更新 workflowSessionsIndex
					const updatedSessionsIndex = {
						...state.workflowSessionsIndex,
						[groupId]: newSessionIds,
					};

					return {
						workflowSessions: updatedSessions,
						workflowSessionsIndex: updatedSessionsIndex,
						lastUpdateTime: Date.now(), // 确保状态总是被更新
					};
				});
			},
			getNextSession: (sessionId: string) => {
				const currentSession = get().workflowSessions.find(
					(session) => session.id === sessionId,
				);
				if (!currentSession) return undefined;

				const workflowGroupId = currentSession.workflow_group_id;
				const sessionIds = get().workflowSessionsIndex[workflowGroupId];
				if (!sessionIds) return undefined;

				const sessionIndex = sessionIds.indexOf(sessionId);
				if (sessionIndex === -1 || sessionIndex >= sessionIds.length - 1)
					return undefined;

				const nextSessionId = sessionIds[sessionIndex + 1];
				if (!nextSessionId) return undefined;

				const nextSession = get().workflowSessions.find(
					(session) => session.id === nextSessionId,
				);

				return nextSession;
			},

			deleteSessionFromGroup: (groupId: string, sessionId: string | number) => {
				set((state) => {
					const index = state.workflowGroupIndex[groupId];
					if (index === undefined) return state;

					// 在 workflowSessions 中删除对应的 session
					const updatedSessions = state.workflowSessions.filter(
						(session) =>
							session.id !== sessionId || session.workflow_group_id !== groupId,
					);

					// 更新 workflowSessionsIndex
					const updatedSessionsIndex = {
						...state.workflowSessionsIndex,
						[groupId]: updatedSessions
							.filter((session) => session.workflow_group_id === groupId)
							.map((session) => session.id),
					};

					return {
						workflowSessions: updatedSessions,
						workflowSessionsIndex: updatedSessionsIndex,
					};
				});
			},
			getWorkflowSessionId: (groupId: string) => {
				const sessions = get().workflowSessionsIndex[groupId] || [];
				return sessions;
			},
			getCurrentWorkflowGroup: (selectedId: string) => {
				const index = get().workflowGroupIndex[selectedId];
				const group = index !== undefined ? get().workflowGroups[index] : null;
				return group;
			},
			onUserInput: async (
				content: string,
				attachImages: string[],
				attachFiles: FileInfo[] | undefined,
				session: workflowChatSession,
			) => {
				const sessionId = session.id;
				const sessionModel = session.mask.modelConfig.model;
				const modelConfig = session.mask.modelConfig;
				const { id: userid, nickname } = useUserStore.getState().user;
				// 获取最近的消息
				const { recentMessages, recentMessagesTokenCount } =
					getMessagesWithMemory(session);

				const contentTokenCount = estimateTokenLength(content);
				const total_token_count = recentMessagesTokenCount + contentTokenCount;

				let userMessage: ChatMessage;
				let botMessage: ChatMessage;
				let sendMessages: ChatMessage[];
				const agent = session.mask;

				const commonChatData = {
					user: userid,
					sessionId: sessionId, // 替换为实际的聊天会话 ID
					model: sessionModel,
					contentType: "workflowchatgroup",
				};

				try {
					const createChatData = {
						...commonChatData,
						content: content, // 使用用户输入作为 message 参数
						attachImages: attachImages,
						recentMessages: recentMessages,
						chat_role: "user",
						sender_name: nickname,
						totalTokenCount: total_token_count,
					};

					const { chat_id, id } =
						await createChatDataAndFetchId(createChatData);

					const userContent = content;

					let mContent: string | MultimodalContent[] = userContent;

					if (attachImages && attachImages.length > 0) {
						mContent = [
							{
								type: "text",
								text: userContent,
							},
						];
						mContent = mContent.concat(
							attachImages.map((url) => ({
								type: "image_url",
								image_url: { url },
							})),
						);
					}

					userMessage = createMessage({
						id,
						chat_id,
						role: "user",
						content: mContent,
						image_url: attachImages,
						// fileInfos: attachFiles,
						token_counts_total: total_token_count,
					});

					console.log("[userMessage] ", userMessage);

					botMessage = createMessage({
						role: "assistant",
						streaming: true,
						model: modelConfig.model,
						toolMessages: [],
						isFinished: false,
					});

					const newMessages = [userMessage, botMessage];
					const fullMessageList = session.messages.concat(newMessages);
					const updates: Partial<ChatSession> = {
						messages: fullMessageList,
					};

					//  找到对应的session, 将 userMessage 和botMessage 进行更新

					get().onNewMessage(newMessages, session);

					sendMessages = recentMessages.concat(userMessage);
					// 发送函数回调
					const onUpdateCallback = (message: string) => {
						// 其他需要在 onUpdate 时执行的逻辑
						// console.log(
						// 	`Message updated: ${message}, botmessage: `,
						// 	botMessage,
						// );
						botMessage.content = message;
						const updates = {
							messages: fullMessageList,
						};
						get().updateWorkflowSession(
							session.workflow_group_id,
							sessionId,
							updates,
						);
					};

					const onToolUpdateCallback = (
						toolName: string,
						toolInput: string,
					) => {
						// 这里可以进行 tool 更新的逻辑
					};

					const onFinishCallback = async (message: string) => {
						// updateSession(message);
						console.log(`Message finished: ${message}`);

						// 其他需要在 onFinish 时执行的逻辑
						const tokenCount = estimateTokenLength(message);

						const createBotChatData = {
							...commonChatData,
							content: message,
							attachImages: attachImages,
							recentMessages: recentMessages,
							chat_role: "assistant",
							sender_name: session.mask.name,
							sender_id: session.mask.id,
							totalTokenCount: tokenCount,
						};

						const { chat_id, id } =
							await createChatDataAndFetchId(createBotChatData);

						if (id) {
							botMessage.id = id;
							botMessage.chat_id = chat_id.toString();
						}
						botMessage.isFinished = true;
						botMessage.isTransfered = false;
						botMessage.token_counts_total = tokenCount;
						get().updateWorkflowSession(session.workflow_group_id, sessionId, {
							messages: fullMessageList,
						});

						if (session.enableAutoFlow) {
							// 如果在激活了 autoflow 的基础上, 则找到 nextSession
							const nextSession = get().getNextSession(sessionId);
							// 如果存在 next session , 则调用自身onuserinput, 将 botMessage 发送出去
							if (nextSession) {
								get().onUserInput(
									message,
									attachImages,
									attachFiles,
									nextSession,
								);
							}
							// 若不存在, 则终止
							else {
								console.log("no next session");
								return;
							}
						}
					};
					// 调用发送消息函数
					sendChatMessage(
						sessionId,
						agent,
						sendMessages,
						handleChatCallbacks(
							botMessage,
							userMessage,
							session,
							onUpdateCallback,
							onToolUpdateCallback,
							onFinishCallback,
						),
					);
				} catch (error) {
					console.log(error);
					throw error;
				}
			},
			onNewMessage: (
				message: ChatMessage[],
				workflowChatSession: workflowChatSession,
			) => {
				//  找到对应的session , 进行 messages concat
				const existingSession = get().workflowSessions.find(
					(item) =>
						item.id === workflowChatSession.id &&
						item.workflow_group_id == workflowChatSession.workflow_group_id,
				);
				if (!existingSession) return;

				const updateSession = existingSession.messages.concat(message);

				set(() => ({
					workflowSessions: get().workflowSessions.map((session) =>
						session.id === existingSession.id &&
						session.workflow_group_id === existingSession.workflow_group_id
							? { ...session, messages: updateSession }
							: session,
					),
				}));
			},
			getMessages(sessionId: string): ChatMessage[] {
				const session = get().workflowSessions.find(
					(session) => session.id === sessionId,
				);
				if (!session) return [];
				return session.messages;
			},
			sendMessagetoNextSession(sessionId: string, message: ChatMessage) {
				const nextSession = get().getNextSession(sessionId);
				if (nextSession) {
					const content = getMessageTextContent(message);
					const images = getMessageImages(message);

					get().onUserInput(content, images, [], nextSession);
				}
			},

			updatedChatMessage: (sessionId, message) => {},
			clearWorkflowData: () => {
				console.log("test");
				// clear localstory
				localStorage.removeItem("workflow-store");
			},
		}),

		{
			name: "workflow-store",
		},
	),
);
