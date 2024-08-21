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

export interface WorkflowGroup {
	id: string;
	topic: string;
	description: string;
	summary: string;
	agent_numbers: number;
	chat_session_ids: string[];
	updated_at: string;
	created_at: string;
	lastUpdateTime: number | string | Date;

	[key: string]: any;
}
export type workflowChatSession = ChatSession & {
	workflow_group_id: string;
	order: number;
};
type State = {
	workflowGroups: WorkflowGroup[];
	workflowGroupIndex: { [groupId: string]: number }; // 索引对象
	workflowSessions: workflowChatSession[];
	workflowSessionsIndex: { [groupId: string]: any[] };
	selectedId: string;
	setSelectedId: (index: string) => void;
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
		updates: Partial<ChatSession>,
	) => void;

	moveSession: (
		groupId: string,
		sourceIndex: number,
		destinationIndex: number,
	) => void;
	deleteSessionFromGroup: (groupId: string, sessionId: string) => void;
	getWorkflowSessionId: (groupId: string) => string[];
	getCurrentWorkflowGroup: (selectedId: string) => WorkflowGroup | null;
	onUserInput: (
		content: string,
		attachImages: string[],
		attachFiles: FileInfo[],
		session: workflowChatSession,
	) => Promise<void>;
	updateSession: (
		updater: (session: workflowChatSession) => void,
	) => void;
};

export const useWorkflowStore = create<State>()(
	persist(
		(set, get) => ({
			workflowGroups: [],
			workflowGroupIndex: {},
			selectedId: "",
			setSelectedId: (index) => set({ selectedId: index }),
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
				// console.log("store debug:adding workflow", data);
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

					if (
						existingGroupIndex === undefined ||
						new Date(lastUpdateTime) >
							new Date(existingGroups[existingGroupIndex].lastUpdateTime)
					) {
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
							// console.log(
							// 	"store debug:new group",
							// 	newGroup,
							// 	"index",
							// 	existingGroupIndex,
							// );
							// 如果该组不存在，则将其添加到数组末尾
							updatedGroups.push(newGroup);
							updatedIndex[id] = updatedGroups.length - 1; // 更新索引以指向新组
						} else {
							// 如果该组已存在，进行合并操作

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
				updates: Partial<ChatSession>,
			) => {
				set((state) => {
					const groupIndex = state.workflowGroupIndex[groupId];
					if (groupIndex === undefined) return state;

					// 在 workflowSessions 中找到对应的 session
					const sessionIndex = state.workflowSessions.findIndex(
						(session) =>
							session.id === sessionId && session.workflow_group_id === groupId,
					);
					if (sessionIndex === -1) return state;

					// 获取当前 session
					const currentSession = state.workflowSessions[sessionIndex];

					// 检查是否有实际的更新
					const updatedSession = {
						...currentSession,
						...updates,
					};
					console.log("debug update workflow session", updates, updatedSession);

					// 深度比较更新前后的状态
					if (
						JSON.stringify(currentSession) === JSON.stringify(updatedSession)
					) {
						return state; // 如果没有实际更新，不改变状态
					}

					// // 直接更新特定的 session
					// state.workflowSessions[sessionIndex] = updatedSession;
					// 返回新的状态对象而不是直接修改原有对象
					const newWorkflowSessions = [...state.workflowSessions];
					newWorkflowSessions[sessionIndex] = updatedSession;

					return {
						...state,
						workflowSessions: newWorkflowSessions,
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

					console.log(
						"sourceIndex",
						sourceIndex,
						"destinationIndex",
						destinationIndex,
					);

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
				attachFiles: FileInfo[],
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

				const commonChatData = {
					user: userid,
					sessionId: sessionId, // 替换为实际的聊天会话 ID
					model: sessionModel,
					content_type: "workflowchatgroup",
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
					console.log("[User Input] after template: ", userContent);

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
					get().updateWorkflowSession(
						session.workflow_group_id,
						sessionId,
						updates,
					);

					sendMessages = recentMessages.concat(userMessage);
					// 发送函数回调
					const onUpdateCallback = (message: string) => {
						// 其他需要在 onUpdate 时执行的逻辑
						console.log(`Message updated: ${message}`);
						botMessage.content = message;

						get().updateSession((session) => {
							session.messages = session.messages.concat();
						});
					};

					const onToolUpdateCallback = (
						toolName: string,
						toolInput: string,
					) => {
						// 这里可以进行 tool 更新的逻辑
						console.log(`Tool updated: ${toolName}, Input: ${toolInput}`);
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
							botMessage.isFinished = true;
							botMessage.isTransfered = false;
							botMessage.token_counts_total = tokenCount;
						}
					};
					// 调用发送消息函数
					sendChatMessage(
						session,
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
					console.error(error);
					throw error;
				}
			},
			updateSession(updater: (session: workflowChatSession) => void) {
				 
			},
		}),
		{
			name: "workflow-store",
		},
	),
);
