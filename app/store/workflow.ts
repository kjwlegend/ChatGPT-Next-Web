import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ChatSession } from "../types/chat";
import {
	createWorkflowSession,
	deleteWorkflowSession,
	updateWorkflowSession,
} from "../api/backend/chat";
import { useUserStore } from "./user";
import { nanoid } from "nanoid";

export interface WorkflowGroup {
	id: string;
	topic: string;
	description: string;
	summary: string;
	agent_numbers: number;
	chat_session_ids: string[];
	sessions: ChatSession[];
	updated_at: string;
	created_at: string;
	lastUpdateTime: number | string | Date;

	[key: string]: any;
}

type State = {
	workflowGroups: WorkflowGroup[];
	workflowGroupIndex: { [groupId: string]: number }; // 索引对象
	selectedId: string;
	setSelectedId: (index: string) => void;
	addWorkflowGroup: (groupId: string, groupName: string) => void;
	updateWorkflowGroup: (
		groupId: string,
		updates: {
			groupName?: string;
			lastUpdateTime?: string;
			sessions?: ChatSession[];
		},
	) => void;
	updateWorkflowSession: (
		groupId: string,
		sessionId: string,
		updates: Partial<ChatSession>,
	) => void;

	deleteWorkflowGroup: (groupId: string | number) => void;
	fetchNewWorkflowGroup: (data: Array<WorkflowGroup>) => void;
	sortWorkflowGroups: () => void;
	addSessionToGroup: (groupId: string, session: ChatSession) => void;
	moveSession: (
		groupId: string,
		sourceIndex: number,
		destinationIndex: number,
	) => void;
	deleteSessionFromGroup: (groupId: string, sessionId: string) => void;
	getWorkflowSessionId: (groupId: string) => string[];
	getCurrentWorkflowGroup: (selectedId: string) => WorkflowGroup | null;
};

export const useWorkflowStore = create<State>()(
	persist(
		(set, get) => ({
			workflowGroups: [],
			workflowGroupIndex: {},
			selectedId: "",
			setSelectedId: (index) => set({ selectedId: index }),
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
					sessions: [],
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
			updateWorkflowSession: (groupId, sessionId, updates) => {
				set((state) => {
					const groupIndex = state.workflowGroupIndex[groupId];
					if (groupIndex === undefined) return state;

					const group = state.workflowGroups[groupIndex];
					const sessionIndex = group.sessions.findIndex(
						(session) => session.id === sessionId,
					);
					if (sessionIndex === -1) return state;

					const updatedSession = {
						...group.sessions[sessionIndex],
						...updates,
					};

					const updatedSessions = [...group.sessions];
					updatedSessions[sessionIndex] = updatedSession;

					const updatedGroup = {
						...group,
						sessions: updatedSessions,
					};

					const updatedGroups = [...state.workflowGroups];
					updatedGroups[groupIndex] = updatedGroup;

					return { workflowGroups: updatedGroups };
				});
			},

			deleteWorkflowGroup: (groupId) => {
				set((state) => {
					const index = state.workflowGroupIndex[groupId];
					if (index === undefined) return state;

					const updatedGroups = state.workflowGroups.filter(
						(_, i) => i !== index,
					);
					const updatedIndex: { [key: string]: number } = {};
					updatedGroups.forEach((group, i) => {
						updatedIndex[group.id] = i;
					});

					return {
						workflowGroups: updatedGroups,
						workflowGroupIndex: updatedIndex,
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
			addSessionToGroup: (groupId, session) => {
				set((state) => {
					const index = state.workflowGroupIndex[groupId];
					if (index === undefined) return state;

					// 确保 sessions 是一个数组，即使它是 undefined
					const currentSessions = state.workflowGroups[index].sessions;

					const updatedGroup = {
						...state.workflowGroups[index],
						sessions: [...currentSessions, session],
					};

					//  debug current session length and new sessions length
					console.log(
						"store debug: current session length",
						currentSessions.length,
						"new sessions length",
						updatedGroup.sessions.length,
					);

					const updatedGroups = [...state.workflowGroups];
					updatedGroups[index] = updatedGroup;

					console.log("store debug: currentGroup after update", updatedGroups);

					return { workflowGroups: updatedGroups };
				});
				console.log(
					"store debug: workflowgroup after update",
					get().workflowGroups,
				);
			},
			moveSession: async (groupId, sourceIndex, destinationIndex) => {
				set((state) => {
					const index = state.workflowGroupIndex[groupId];
					if (index === undefined) return state;

					const group = state.workflowGroups[index];
					const newSessions = [...group.sessions];
					const [removed] = newSessions.splice(sourceIndex, 1);
					newSessions.splice(destinationIndex, 0, removed);

					const updatedGroup = { ...group, sessions: newSessions };
					const updatedGroups = [...state.workflowGroups];
					updatedGroups[index] = updatedGroup;

					return { workflowGroups: updatedGroups };
				});
			},
			deleteSessionFromGroup: (groupId, sessionId) => {
				set((state) => {
					const index = state.workflowGroupIndex[groupId];
					if (index === undefined) return state;

					const group = state.workflowGroups[index];
					const newSessions = group.sessions.filter(
						(session) => session.id !== sessionId,
					);

					const updatedGroup = { ...group, sessions: newSessions };
					const updatedGroups = [...state.workflowGroups];
					updatedGroups[index] = updatedGroup;

					return { workflowGroups: updatedGroups };
				});
			},
			getWorkflowSessionId: (groupId: string) => {
				const index = get().workflowGroupIndex[groupId];
				const group = index !== undefined ? get().workflowGroups[index] : null;
				const sessions = group
					? group.sessions.map((session) => session.id)
					: [];
				return sessions;
			},
			getCurrentWorkflowGroup: (selectedId: string) => {
				const index = get().workflowGroupIndex[selectedId];
				const group = index !== undefined ? get().workflowGroups[index] : null;
				return group;
			},
		}),
		{
			name: "workflow-store",
		},
	),
);
