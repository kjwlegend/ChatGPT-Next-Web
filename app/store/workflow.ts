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
	deleteWorkflowGroup: (groupId: string | number) => void;
	fetchNewWorkflowGroup: (data: Array<WorkflowGroup>) => void;
	sortWorkflowGroups: () => void;
	addSessionToGroup: (groupId: string, session: ChatSession) => Promise<void>;
	moveSession: (
		groupId: string,
		sourceIndex: number,
		destinationIndex: number,
	) => void;
	deleteSessionFromGroup: (groupId: string, sessionId: string) => void;
	getWorkflowSessionId: (groupId: string) => string[];
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
				console.log("adding workflow", data);
				const existingGroups = get().workflowGroups;
				const existingIndex = get().workflowGroupIndex;

				const updatedGroups = [...existingGroups];
				const updatedIndex = { ...existingIndex };

				data.forEach((item) => {
					const {
						id,
						session_id,
						session_topic,
						session_description,
						session_summary,
						agent_numbers,
						chat_session_ids,
						updated_at,
						created_at,
					} = item;
					// convert updated_at string to Date timestamp
					const lastUpdateTime = new Date(updated_at).toISOString();
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
							chat_session_ids:
								chat_session_ids !== undefined ? chat_session_ids : [],
							sessions: [],
						};
						if (existingGroupIndex === undefined) {
							updatedIndex[id] = updatedGroups.length;
							updatedGroups.push(newGroup);
						} else {
							updatedGroups[existingGroupIndex] = newGroup;
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
					return {
						workflowGroups: state.workflowGroups.sort(
							(a, b) =>
								new Date(b.lastUpdateTime).getTime() -
								new Date(a.lastUpdateTime).getTime(),
						),
					};
				});
			},
			addSessionToGroup: async (groupId, session) => {
				set((state) => {
					const index = state.workflowGroupIndex[groupId];
					if (index === undefined) return state;

					const updatedGroup = {
						...state.workflowGroups[index],
						sessions: [
							...(state.workflowGroups[index].sessions || []),
							session,
						],
					};
					const updatedGroups = [...state.workflowGroups];
					updatedGroups[index] = updatedGroup;

					return { workflowGroups: updatedGroups };
				});

				const newSessions = get().getWorkflowSessionId(groupId);
				const res = await updateWorkflowSession(groupId, {
					chat_sessions: newSessions,
					user: useUserStore.getState().user.id,
				});
				if (res.code === 401) {
					throw new Error("登录状态已过期, 请重新登录");
				}
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
		}),
		{
			name: "workflow-store",
		},
	),
);
