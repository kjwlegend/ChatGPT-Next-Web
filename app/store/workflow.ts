import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ChatSession } from "./chat";
import {
	createWorkflowSession,
	deleteWorkflowSession,
	updateWorkflowSession,
} from "../api/backend/chat";
import { useUserStore } from "./user";
import { nanoid } from "nanoid";

export interface workflowGroup {
	id: string;
	name: string;
	description: string;
	lastUpdateTime: string;
	sessions: string[];
}

type State = {
	workflowGroup: {
		[groupId: string]: {
			id: string;
			name: string;
			description: string;
			lastUpdateTime: string;
			sessions: string[];
		};
	};
	selectedId: string;
	setselectedId: (index: string) => void;
	addWorkflowGroup: (groupId: string, groupName: string) => void;
	updateWorkflowGroup: (
		groupId: string,
		updates: {
			groupName?: string;
			lastUpdateTime?: string;
			sessions?: string[];
		},
	) => void;

	deleteWorkflowGroup: (groupId: string) => void;
	addSessionToGroup: (groupId: string, session: string) => Promise<void>;
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
			workflowGroup: {},
			selectedId: "",
			setselectedId: (index) => set({ selectedId: index }),
			addWorkflowGroup: (groupId, groupName) => {
				set((state) => ({
					workflowGroup: {
						...state.workflowGroup,
						[groupId]: {
							id: groupId,
							name: groupName,
							description: "等待你创作无限的可能",
							lastUpdateTime: new Date().toISOString(),
							sessions: [],
						},
					},
				}));

				get().setselectedId(groupId);
			},
			updateWorkflowGroup: (groupId, updates) => {
				set((state) => {
					const { workflowGroup } = state;
					// 创建一个新对象，包含传入的更新
					const updatedWorkflowGroup = {
						...workflowGroup,
						[groupId]: {
							...workflowGroup[groupId],
							...updates,
						},
					};
					return { workflowGroup: updatedWorkflowGroup };
				});
			},
			deleteWorkflowGroup: (groupId) => {
				set((state) => ({
					workflowGroup: Object.keys(state.workflowGroup)
						.filter((key) => key !== groupId)
						.reduce(
							(obj, key) => ({ ...obj, [key]: state.workflowGroup[key] }),
							{},
						),
				}));
				// when delete the last workflow group, set selectedId to empty
				if (Object.keys(get().workflowGroup).length === 0) {
					get().setselectedId("");
				}
				// when delete the selected workflow group, set selectedId to the first group
				if (get().selectedId === groupId) {
					const firstGroup = Object.keys(get().workflowGroup)[0];
					get().setselectedId(firstGroup);
				}
			},
			addSessionToGroup: async (groupId, session) => {
				set((state) => ({
					workflowGroup: {
						...state.workflowGroup,
						[groupId]: {
							...state.workflowGroup[groupId],
							sessions: [...state.workflowGroup[groupId].sessions, session],
						},
					},
				}));

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
					const group = state.workflowGroup[groupId];
					const newSessions = [...group.sessions];
					const [removed] = newSessions.splice(sourceIndex, 1);
					newSessions.splice(destinationIndex, 0, removed);
					return {
						workflowGroup: {
							...state.workflowGroup,
							[groupId]: { ...group, sessions: newSessions },
						},
					};
				});
			},
			deleteSessionFromGroup: (groupId, sessionId) => {
				set((state) => {
					const group = state.workflowGroup[groupId];
					const newSessions = group.sessions.filter(
						(session) => session !== sessionId,
					);
					return {
						workflowGroup: {
							...state.workflowGroup,
							[groupId]: { ...group, sessions: newSessions },
						},
					};
				});
			},
			getWorkflowSessionId: (groupId: string) => {
				// get all sessions id from one group and return as a list
				const group = get().workflowGroup[groupId];
				const sessions = group ? group.sessions : [];
				return sessions;
			},
		}),
		{
			name: "workflow-store",
		},
	),
);
